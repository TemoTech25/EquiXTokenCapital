import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { OwnershipRecord, OwnershipHistoryEntry } from './ownership.entity';
import { CreateOwnershipDto } from './dto/create-ownership.dto';
import { TransferOwnershipDto } from './dto/transfer-ownership.dto';

const ONE_HUNDRED = 100;
const EPSILON = 0.0001;

@Injectable()
export class OwnershipService {
  constructor(
    @InjectRepository(OwnershipRecord)
    private readonly ownershipRepository: Repository<OwnershipRecord>,
    private readonly dataSource: DataSource,
  ) {}

  async createOwnership(dto: CreateOwnershipDto) {
    if (dto.splits.length === 0) {
      throw new BadRequestException('At least one ownership split is required');
    }

    const existing = await this.ownershipRepository.count({ where: { assetId: dto.assetId } });
    if (existing > 0) {
      throw new BadRequestException('Ownership already initialized for this asset');
    }

    const duplicates = new Set<string>();
    for (const split of dto.splits) {
      const key = `${split.ownerId}:${split.rightsType.toLowerCase()}`;
      if (duplicates.has(key)) {
        throw new BadRequestException('Duplicate owner + rightsType split found');
      }
      duplicates.add(key);
    }

    const total = this.sumPercentages(dto.splits.map((split) => split.percentage));
    this.assertTotalIs100(total);

    const timestamp = new Date().toISOString();

    const created = await this.dataSource.transaction(async (manager) => {
      const records = dto.splits.map((split) =>
        manager.create(OwnershipRecord, {
          assetId: dto.assetId,
          ownerId: split.ownerId,
          percentage: split.percentage.toFixed(4),
          rightsType: split.rightsType,
          historyLog: [
            {
              action: 'CREATED',
              percentage: split.percentage.toFixed(4),
              timestamp,
            } as OwnershipHistoryEntry,
          ],
        }),
      );

      return manager.save(OwnershipRecord, records);
    });

    return {
      assetId: dto.assetId,
      totalPercentage: total,
      records: created,
    };
  }

  async getOwnershipByAsset(assetId: string) {
    const records = await this.ownershipRepository.find({
      where: { assetId },
      order: { createdAt: 'ASC' },
    });

    if (records.length === 0) {
      throw new NotFoundException('Ownership records not found for asset');
    }

    const total = this.sumPercentages(records.map((record) => Number(record.percentage)));
    this.assertTotalIs100(total);

    return {
      assetId,
      totalPercentage: total,
      records,
    };
  }

  async transferOwnership(dto: TransferOwnershipDto) {
    return this.dataSource.transaction(async (manager) => {
      const records = await manager.find(OwnershipRecord, {
        where: { assetId: dto.assetId },
        order: { createdAt: 'ASC' },
      });

      if (records.length === 0) {
        throw new NotFoundException('Ownership records not found for asset');
      }

      const transferAmount = Number(dto.percentage.toFixed(4));
      const from = records.find((record) => record.ownerId === dto.fromOwnerId);

      if (!from) {
        throw new NotFoundException('Source owner does not have ownership in this asset');
      }

      const fromCurrent = Number(from.percentage);
      if (fromCurrent + EPSILON < transferAmount) {
        throw new BadRequestException('Transfer percentage exceeds source owner share');
      }

      const targetRightsType = dto.rightsType ?? from.rightsType;
      let to = records.find(
        (record) =>
          record.ownerId === dto.toOwnerId &&
          record.rightsType.toLowerCase() === targetRightsType.toLowerCase(),
      );

      if (!to) {
        to = manager.create(OwnershipRecord, {
          assetId: dto.assetId,
          ownerId: dto.toOwnerId,
          percentage: '0.0000',
          rightsType: targetRightsType,
          historyLog: [],
        });
      }

      from.percentage = (fromCurrent - transferAmount).toFixed(4);
      to.percentage = (Number(to.percentage) + transferAmount).toFixed(4);

      const timestamp = new Date().toISOString();
      from.historyLog = [
        ...(from.historyLog ?? []),
        {
          action: 'TRANSFER_OUT',
          percentage: transferAmount.toFixed(4),
          counterpartyOwnerId: dto.toOwnerId,
          timestamp,
        },
      ];
      to.historyLog = [
        ...(to.historyLog ?? []),
        {
          action: 'TRANSFER_IN',
          percentage: transferAmount.toFixed(4),
          counterpartyOwnerId: dto.fromOwnerId,
          timestamp,
        },
      ];

      await manager.save(OwnershipRecord, from);
      await manager.save(OwnershipRecord, to);

      if (Number(from.percentage) <= EPSILON) {
        await manager.delete(OwnershipRecord, { id: from.id });
      }

      const latest = await manager.find(OwnershipRecord, {
        where: { assetId: dto.assetId },
      });

      const total = this.sumPercentages(latest.map((record) => Number(record.percentage)));
      this.assertTotalIs100(total);

      return {
        assetId: dto.assetId,
        totalPercentage: total,
        records: latest,
      };
    });
  }

  private sumPercentages(values: number[]): number {
    return Number(values.reduce((sum, value) => sum + value, 0).toFixed(4));
  }

  private assertTotalIs100(total: number): void {
    if (Math.abs(total - ONE_HUNDRED) > EPSILON) {
      throw new BadRequestException(
        `Ownership percentages must total 100.0000. Current total: ${total.toFixed(4)}`,
      );
    }
  }
}
