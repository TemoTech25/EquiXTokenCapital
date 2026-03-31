import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Deal } from '../deals/deal.entity';
import { Payment } from '../payments/payment.entity';
import { OwnershipRecord } from '../ownership/ownership.entity';
import { User } from '../users/user.entity';

@Injectable()
export class AnalyticsService {
  constructor(
    @InjectRepository(Deal)
    private readonly dealsRepository: Repository<Deal>,
    @InjectRepository(Payment)
    private readonly paymentsRepository: Repository<Payment>,
    @InjectRepository(OwnershipRecord)
    private readonly ownershipRepository: Repository<OwnershipRecord>,
    @InjectRepository(User)
    private readonly usersRepository: Repository<User>,
  ) {}

  async overview() {
    const [dealsAgg, valueAgg, activeUsersAgg, ownershipAgg] = await Promise.all([
      this.dealsRepository
        .createQueryBuilder('deal')
        .select('COUNT(deal.id)', 'totalDeals')
        .getRawOne<{ totalDeals: string }>(),
      this.paymentsRepository
        .createQueryBuilder('payment')
        .select('COALESCE(SUM(payment.amount), 0)', 'totalTransactionValue')
        .getRawOne<{ totalTransactionValue: string }>(),
      this.usersRepository.query(`
        SELECT COUNT(DISTINCT user_id) AS "activeUsers"
        FROM (
          SELECT buyer_id AS user_id FROM deals
          UNION ALL
          SELECT seller_id AS user_id FROM deals
          UNION ALL
          SELECT agent_id AS user_id FROM deals
          UNION ALL
          SELECT conveyancer_id AS user_id FROM deals
        ) participants
      `),
      this.ownershipRepository
        .createQueryBuilder('ownership')
        .select('ownership.asset_id', 'assetId')
        .addSelect('COALESCE(SUM(ownership.percentage), 0)', 'totalPercentage')
        .groupBy('ownership.asset_id')
        .getRawMany<{ assetId: string; totalPercentage: string }>(),
    ]);

    return {
      totalDeals: Number(dealsAgg?.totalDeals ?? 0),
      totalTransactionValue: Number(valueAgg?.totalTransactionValue ?? 0),
      activeUsers: Number(activeUsersAgg?.[0]?.activeUsers ?? 0),
      ownershipDistribution: ownershipAgg.map((row) => ({
        assetId: row.assetId,
        totalPercentage: Number(row.totalPercentage),
      })),
    };
  }

  async dealsReport() {
    const [statusBreakdown, monthlyDealCount] = await Promise.all([
      this.dealsRepository
        .createQueryBuilder('deal')
        .select('deal.status', 'status')
        .addSelect('COUNT(deal.id)', 'count')
        .groupBy('deal.status')
        .getRawMany<{ status: string; count: string }>(),
      this.dealsRepository
        .createQueryBuilder('deal')
        .select("TO_CHAR(deal.created_at, 'YYYY-MM')", 'month')
        .addSelect('COUNT(deal.id)', 'count')
        .groupBy("TO_CHAR(deal.created_at, 'YYYY-MM')")
        .orderBy('month', 'DESC')
        .limit(12)
        .getRawMany<{ month: string; count: string }>(),
    ]);

    return {
      statusBreakdown: statusBreakdown.map((row) => ({
        status: row.status,
        count: Number(row.count),
      })),
      monthlyDealCount: monthlyDealCount.map((row) => ({
        month: row.month,
        count: Number(row.count),
      })),
    };
  }

  async usersReport() {
    const [roleBreakdown, kycBreakdown] = await Promise.all([
      this.usersRepository
        .createQueryBuilder('user')
        .select('user.role', 'role')
        .addSelect('COUNT(user.id)', 'count')
        .groupBy('user.role')
        .getRawMany<{ role: string; count: string }>(),
      this.usersRepository
        .createQueryBuilder('user')
        .select('user.kyc_status', 'kycStatus')
        .addSelect('COUNT(user.id)', 'count')
        .groupBy('user.kyc_status')
        .getRawMany<{ kycStatus: boolean; count: string }>(),
    ]);

    return {
      roleBreakdown: roleBreakdown.map((row) => ({
        role: row.role,
        count: Number(row.count),
      })),
      kycBreakdown: kycBreakdown.map((row) => ({
        kycStatus: row.kycStatus,
        count: Number(row.count),
      })),
    };
  }
}
