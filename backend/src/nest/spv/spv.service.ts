import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, EntityManager, Repository } from 'typeorm';
import { Spv } from './spv.entity';
import { SpvShareAllocation } from './spv-share-allocation.entity';
import { CreateSpvDto } from './dto/create-spv.dto';
import { AllocateSharesDto } from './dto/allocate-shares.dto';
import { Property } from '../properties/property.entity';
import { OwnershipRecord } from '../ownership/ownership.entity';

const DEFAULT_RIGHTS_TYPE = 'equity';

@Injectable()
export class SpvService {
  constructor(
    @InjectRepository(Spv)
    private readonly spvRepository: Repository<Spv>,
    @InjectRepository(SpvShareAllocation)
    private readonly allocationRepository: Repository<SpvShareAllocation>,
    @InjectRepository(Property)
    private readonly propertyRepository: Repository<Property>,
    @InjectRepository(OwnershipRecord)
    private readonly ownershipRepository: Repository<OwnershipRecord>,
    private readonly dataSource: DataSource,
  ) {}

  async create(dto: CreateSpvDto): Promise<Spv> {
    const property = await this.propertyRepository.findOne({ where: { id: dto.propertyId } });
    if (!property) {
      throw new NotFoundException('Property not found');
    }

    return this.spvRepository.save(this.spvRepository.create(dto));
  }

  async getById(id: string): Promise<Spv> {
    const spv = await this.spvRepository.findOne({
      where: { id },
      relations: {
        allocations: true,
      },
    });

    if (!spv) {
      throw new NotFoundException('SPV not found');
    }

    return spv;
  }

  async allocateShares(dto: AllocateSharesDto) {
    const rightsType = dto.rightsType ?? DEFAULT_RIGHTS_TYPE;

    return this.dataSource.transaction(async (manager) => {
      const spv = await manager.findOne(Spv, { where: { id: dto.spvId } });
      if (!spv) {
        throw new NotFoundException('SPV not found');
      }

      const allocations = await manager.find(SpvShareAllocation, { where: { spvId: spv.id } });
      let allocation = allocations.find((item) => item.ownerId === dto.ownerId);

      const currentlyAllocated = allocations.reduce((sum, item) => sum + item.shares, 0);
      const proposedTotal = currentlyAllocated + dto.shares;
      if (proposedTotal > spv.totalShares) {
        throw new BadRequestException('Allocated shares cannot exceed total_shares');
      }

      if (!allocation) {
        allocation = manager.create(SpvShareAllocation, {
          spvId: spv.id,
          ownerId: dto.ownerId,
          shares: dto.shares,
        });
      } else {
        allocation.shares += dto.shares;
      }
      await manager.save(SpvShareAllocation, allocation);

      const latestAllocations = await manager.find(SpvShareAllocation, { where: { spvId: spv.id } });
      await this.syncOwnershipFromShares(manager, spv, latestAllocations, rightsType);

      const totalAllocated = latestAllocations.reduce((sum, item) => sum + item.shares, 0);
      return {
        spvId: spv.id,
        totalShares: spv.totalShares,
        allocatedShares: totalAllocated,
        allocationPercentage: Number(((totalAllocated / spv.totalShares) * 100).toFixed(4)),
        allocations: latestAllocations,
      };
    });
  }

  private async syncOwnershipFromShares(
    manager: EntityManager,
    spv: Spv,
    allocations: SpvShareAllocation[],
    rightsType: string,
  ) {
    const existing = await manager.find(OwnershipRecord, {
      where: { assetId: spv.id, rightsType },
    });

    for (const allocation of allocations) {
      const percentage = ((allocation.shares / spv.totalShares) * 100).toFixed(4);
      const record = existing.find((entry) => entry.ownerId === allocation.ownerId);

      if (record) {
        record.percentage = percentage;
        record.historyLog = [
          ...(record.historyLog ?? []),
          {
            action: 'TRANSFER_IN',
            percentage,
            timestamp: new Date().toISOString(),
            note: 'Synced from SPV share allocation',
          },
        ];
        await manager.save(OwnershipRecord, record);
      } else {
        await manager.save(
          OwnershipRecord,
          manager.create(OwnershipRecord, {
            assetId: spv.id,
            ownerId: allocation.ownerId,
            rightsType,
            percentage,
            historyLog: [
              {
                action: 'CREATED',
                percentage,
                timestamp: new Date().toISOString(),
                note: 'Created from SPV share allocation',
              },
            ],
          }),
        );
      }
    }

    for (const record of existing) {
      const stillExists = allocations.some((allocation) => allocation.ownerId === record.ownerId);
      if (!stillExists) {
        await manager.delete(OwnershipRecord, { id: record.id });
      }
    }
  }
}
