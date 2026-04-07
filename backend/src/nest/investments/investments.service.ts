import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { Investment } from './investment.entity';
import { SubscribeInvestmentDto } from './dto/subscribe-investment.dto';
import { InvestmentStatus } from './enums/investment-status.enum';
import { Spv } from '../spv/spv.entity';
import { SpvShareAllocation } from '../spv/spv-share-allocation.entity';
import { SpvService } from '../spv/spv.service';

@Injectable()
export class InvestmentsService {
  constructor(
    @InjectRepository(Investment)
    private readonly investmentsRepository: Repository<Investment>,
    @InjectRepository(Spv)
    private readonly spvRepository: Repository<Spv>,
    @InjectRepository(SpvShareAllocation)
    private readonly allocationRepository: Repository<SpvShareAllocation>,
    private readonly spvService: SpvService,
    private readonly dataSource: DataSource,
  ) {}

  async subscribe(dto: SubscribeInvestmentDto): Promise<Investment> {
    return this.dataSource.transaction(async (manager) => {
      const spv = await manager.findOne(Spv, { where: { id: dto.spvId } });
      if (!spv) {
        throw new NotFoundException('SPV not found');
      }

      const allocations = await manager.find(SpvShareAllocation, { where: { spvId: spv.id } });
      const allocatedShares = allocations.reduce((sum, allocation) => sum + allocation.shares, 0);
      const availableShares = spv.totalShares - allocatedShares;

      if (dto.sharesRequested > availableShares) {
        throw new BadRequestException('Not enough shares available for subscription');
      }

      const investment = await manager.save(
        Investment,
        manager.create(Investment, {
          spvId: dto.spvId,
          investorId: dto.investorId,
          amountInvested: dto.amountInvested.toFixed(2),
          sharesAllocated: dto.sharesRequested,
          status: InvestmentStatus.CONFIRMED,
        }),
      );

      await this.spvService.allocateShares({
        spvId: dto.spvId,
        ownerId: dto.investorId,
        shares: dto.sharesRequested,
        rightsType: 'equity',
      });

      return investment;
    });
  }

  async getByUser(userId: string): Promise<Investment[]> {
    return this.investmentsRepository.find({
      where: { investorId: userId },
      order: { createdAt: 'DESC' },
    });
  }

  async opportunities() {
    const spvs = await this.spvRepository.find();

    const response = [];
    for (const spv of spvs) {
      const allocations = await this.allocationRepository.find({ where: { spvId: spv.id } });
      const allocatedShares = allocations.reduce((sum, allocation) => sum + allocation.shares, 0);
      response.push({
        spvId: spv.id,
        name: spv.name,
        legalType: spv.legalType,
        totalShares: spv.totalShares,
        allocatedShares,
        availableShares: spv.totalShares - allocatedShares,
      });
    }

    return response;
  }
}
