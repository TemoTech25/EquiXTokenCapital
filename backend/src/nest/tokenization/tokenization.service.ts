import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, EntityManager, Repository } from 'typeorm';
import { OffchainToken } from './token.entity';
import { MintTokenDto } from './dto/mint-token.dto';
import { TransferTokenDto } from './dto/transfer-token.dto';
import { OwnershipRecord } from '../ownership/ownership.entity';

const DEFAULT_TOKEN_TYPE = 'equity';
const EPSILON = 0.0001;

@Injectable()
export class TokenizationService {
  private readonly defaultSupply: number;

  constructor(
    @InjectRepository(OffchainToken)
    private readonly tokensRepository: Repository<OffchainToken>,
    @InjectRepository(OwnershipRecord)
    private readonly ownershipRepository: Repository<OwnershipRecord>,
    private readonly dataSource: DataSource,
    configService: ConfigService,
  ) {
    this.defaultSupply = Number(configService.get<string>('TOKEN_SUPPLY_DEFAULT', '1000000'));
  }

  async mint(dto: MintTokenDto) {
    const type = dto.type ?? DEFAULT_TOKEN_TYPE;
    const supply = this.defaultSupply;

    return this.dataSource.transaction(async (manager) => {
      const existingTokens = await manager.find(OffchainToken, { where: { assetId: dto.assetId, type } });
      const mintedSoFar = this.sum(existingTokens.map((token) => Number(token.amount)));

      if (mintedSoFar >= supply - EPSILON) {
        throw new BadRequestException('Token supply already fully minted for this asset and type');
      }

      const mintAmount = Number(dto.amount.toFixed(4));
      const nextMinted = this.sum([mintedSoFar, mintAmount]);

      if (Math.abs(nextMinted - supply) > EPSILON) {
        throw new BadRequestException(
          `Mint must complete configured supply (${supply}). Minted after this operation: ${nextMinted}`,
        );
      }

      const ownerToken = existingTokens.find((token) => token.ownerId === dto.ownerId);
      if (ownerToken) {
        ownerToken.amount = this.sum([Number(ownerToken.amount), mintAmount]).toFixed(4);
        await manager.save(OffchainToken, ownerToken);
      } else {
        const token = manager.create(OffchainToken, {
          assetId: dto.assetId,
          ownerId: dto.ownerId,
          amount: mintAmount.toFixed(4),
          type,
        });
        await manager.save(OffchainToken, token);
      }

      await this.syncOwnershipFromTokens(manager, dto.assetId, type, supply);

      const latest = await manager.find(OffchainToken, { where: { assetId: dto.assetId, type } });
      return {
        assetId: dto.assetId,
        type,
        supply,
        balances: latest,
      };
    });
  }

  async transfer(dto: TransferTokenDto) {
    const type = dto.type ?? DEFAULT_TOKEN_TYPE;
    const supply = this.defaultSupply;

    return this.dataSource.transaction(async (manager) => {
      const tokens = await manager.find(OffchainToken, { where: { assetId: dto.assetId, type } });
      if (tokens.length === 0) {
        throw new NotFoundException('No minted tokens found for asset/type');
      }

      const from = tokens.find((token) => token.ownerId === dto.fromOwnerId);
      if (!from) {
        throw new NotFoundException('Source owner token balance not found');
      }

      const transferAmount = Number(dto.amount.toFixed(4));
      const fromAmount = Number(from.amount);
      if (fromAmount + EPSILON < transferAmount) {
        throw new BadRequestException('Transfer amount exceeds source balance');
      }

      let to = tokens.find((token) => token.ownerId === dto.toOwnerId);
      if (!to) {
        to = manager.create(OffchainToken, {
          assetId: dto.assetId,
          ownerId: dto.toOwnerId,
          amount: '0.0000',
          type,
        });
      }

      from.amount = (fromAmount - transferAmount).toFixed(4);
      to.amount = (Number(to.amount) + transferAmount).toFixed(4);

      await manager.save(OffchainToken, from);
      await manager.save(OffchainToken, to);

      if (Number(from.amount) <= EPSILON) {
        await manager.delete(OffchainToken, { id: from.id });
      }

      await this.syncOwnershipFromTokens(manager, dto.assetId, type, supply);

      const latest = await manager.find(OffchainToken, { where: { assetId: dto.assetId, type } });
      return {
        assetId: dto.assetId,
        type,
        supply,
        balances: latest,
      };
    });
  }


  async byAsset(assetId: string) {
    const tokens = await this.tokensRepository.find({ where: { assetId } });
    const balances = tokens.map((token) => ({
      id: token.id,
      ownerId: token.ownerId,
      amount: Number(token.amount),
      type: token.type,
    }));

    const totalTokensIssued = this.sum(balances.map((token) => token.amount));

    return {
      assetId,
      totalTokensIssued,
      balances,
    };
  }

  private async syncOwnershipFromTokens(
    manager: EntityManager,
    assetId: string,
    rightsType: string,
    supply: number,
  ) {
    const tokens = await manager.find(OffchainToken, { where: { assetId, type: rightsType } });
    const tokenTotal = this.sum(tokens.map((token) => Number(token.amount)));

    if (Math.abs(tokenTotal - supply) > EPSILON) {
      throw new BadRequestException('Token balances must equal configured supply before syncing ownership');
    }

    const ownershipRecords = await manager.find(OwnershipRecord, { where: { assetId, rightsType } });
    const byOwner = new Map(ownershipRecords.map((record) => [record.ownerId, record]));

    for (const token of tokens) {
      const percentage = ((Number(token.amount) / supply) * 100).toFixed(4);
      const now = new Date().toISOString();

      const existing = byOwner.get(token.ownerId);
      if (existing) {
        existing.percentage = percentage;
        existing.historyLog = [
          ...(existing.historyLog ?? []),
          {
            action: 'TRANSFER_IN',
            percentage,
            timestamp: now,
            note: 'Synced from token balances',
          },
        ];
        await manager.save(OwnershipRecord, existing);
      } else {
        const created = manager.create(OwnershipRecord, {
          assetId,
          ownerId: token.ownerId,
          rightsType,
          percentage,
          historyLog: [
            {
              action: 'CREATED',
              percentage,
              timestamp: now,
              note: 'Initialized from token mint',
            },
          ],
        });
        await manager.save(OwnershipRecord, created);
      }
    }

    for (const record of ownershipRecords) {
      const stillHasTokens = tokens.some((token) => token.ownerId === record.ownerId);
      if (!stillHasTokens) {
        await manager.delete(OwnershipRecord, { id: record.id });
      }
    }
  }

  private sum(values: number[]): number {
    return Number(values.reduce((acc, cur) => acc + cur, 0).toFixed(4));
  }
}
