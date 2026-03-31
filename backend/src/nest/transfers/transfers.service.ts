import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { TransferRequest } from './transfer-request.entity';
import { RequestTransferDto } from './dto/request-transfer.dto';
import { ApproveTransferDto } from './dto/approve-transfer.dto';
import { TransferStatus } from './enums/transfer-status.enum';
import { User } from '../users/user.entity';
import { OwnershipRecord } from '../ownership/ownership.entity';
import { OwnershipService } from '../ownership/ownership.service';

@Injectable()
export class TransfersService {
  constructor(
    @InjectRepository(TransferRequest)
    private readonly transfersRepository: Repository<TransferRequest>,
    @InjectRepository(User)
    private readonly usersRepository: Repository<User>,
    @InjectRepository(OwnershipRecord)
    private readonly ownershipRepository: Repository<OwnershipRecord>,
    private readonly ownershipService: OwnershipService,
    private readonly dataSource: DataSource,
  ) {}

  async request(dto: RequestTransferDto): Promise<TransferRequest> {
    await this.assertUsersVerified(dto.fromUserId, dto.toUserId);

    const record = await this.ownershipRepository.findOne({
      where: { assetId: dto.assetId, ownerId: dto.fromUserId },
    });

    if (!record || Number(record.percentage) < dto.percentage) {
      throw new BadRequestException('Insufficient ownership percentage for transfer request');
    }

    return this.transfersRepository.save(
      this.transfersRepository.create({
        fromUserId: dto.fromUserId,
        toUserId: dto.toUserId,
        assetId: dto.assetId,
        percentage: dto.percentage.toFixed(4),
        status: TransferStatus.PENDING,
      }),
    );
  }

  async approve(id: string, dto: ApproveTransferDto): Promise<TransferRequest> {
    return this.dataSource.transaction(async (manager) => {
      const transfer = await manager.findOne(TransferRequest, { where: { id } });
      if (!transfer) {
        throw new NotFoundException('Transfer request not found');
      }

      if (transfer.status !== TransferStatus.PENDING) {
        throw new BadRequestException('Only pending transfers can be processed');
      }

      const decision = dto.status ?? TransferStatus.APPROVED;
      transfer.status = decision;

      if (decision === TransferStatus.APPROVED) {
        await this.assertUsersVerified(transfer.fromUserId, transfer.toUserId);

        await this.ownershipService.transferOwnership({
          assetId: transfer.assetId,
          fromOwnerId: transfer.fromUserId,
          toOwnerId: transfer.toUserId,
          percentage: Number(transfer.percentage),
        });
      }

      return manager.save(TransferRequest, transfer);
    });
  }

  async listByUser(userId: string): Promise<TransferRequest[]> {
    return this.transfersRepository
      .createQueryBuilder('transfer')
      .where('transfer.from_user_id = :userId OR transfer.to_user_id = :userId', { userId })
      .orderBy('transfer.created_at', 'DESC')
      .getMany();
  }

  private async assertUsersVerified(fromUserId: string, toUserId: string): Promise<void> {
    const users = await this.usersRepository.findBy([{ id: fromUserId }, { id: toUserId }]);
    if (users.length !== 2) {
      throw new NotFoundException('Users for transfer not found');
    }

    const unverified = users.find((user) => !user.kycStatus);
    if (unverified) {
      throw new BadRequestException('Only KYC-verified users can participate in ownership transfers');
    }
  }
}
