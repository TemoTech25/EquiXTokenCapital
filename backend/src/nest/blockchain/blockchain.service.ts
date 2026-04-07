import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import {
  AccountId,
  Client,
  Hbar,
  PrivateKey,
  TokenCreateTransaction,
  TokenSupplyType,
  TokenType,
  TokenId,
  TransferTransaction,
  TransactionId,
} from '@hashgraph/sdk';
import { ConfigService } from '@nestjs/config';
import { Repository } from 'typeorm';
import { BlockchainTokenRecord } from './blockchain-token.entity';
import { MintBlockchainDto } from './dto/mint-blockchain.dto';
import { TransferBlockchainDto } from './dto/transfer-blockchain.dto';
import { OffchainToken } from '../tokenization/token.entity';

const DEFAULT_TOKEN_TYPE = 'equity';

@Injectable()
export class BlockchainService {
  private readonly client?: Client;
  private readonly operatorId?: AccountId;
  private readonly operatorKey?: PrivateKey;

  constructor(
    @InjectRepository(BlockchainTokenRecord)
    private readonly blockchainRepository: Repository<BlockchainTokenRecord>,
    @InjectRepository(OffchainToken)
    private readonly offchainTokenRepository: Repository<OffchainToken>,
    configService: ConfigService,
  ) {
    const network = configService.get<string>('HEDERA_NETWORK', 'testnet');
    const operatorId = configService.get<string>('HEDERA_OPERATOR_ID');
    const operatorKey = configService.get<string>('HEDERA_OPERATOR_KEY');

    if (operatorId && operatorKey) {
      this.client = network === 'mainnet' ? Client.forMainnet() : Client.forTestnet();
      this.operatorId = AccountId.fromString(operatorId);
      this.operatorKey = PrivateKey.fromStringECDSA(operatorKey);
      this.client.setOperator(this.operatorId, this.operatorKey);
      this.client.setDefaultMaxTransactionFee(new Hbar(2));
    }
  }

  async mint(dto: MintBlockchainDto) {
    const type = dto.type ?? DEFAULT_TOKEN_TYPE;

    await this.upsertOffchainBalance(dto.assetId, dto.ownerId, type, dto.amount);

    const hedera = await this.tryMintOnHedera(dto.assetId);

    const record = await this.blockchainRepository.save(
      this.blockchainRepository.create({
        assetId: dto.assetId,
        ownerId: dto.ownerId,
        hederaTokenId: hedera?.hederaTokenId ?? null,
        transactionHash: hedera?.transactionHash ?? null,
      }),
    );

    return {
      record,
      blockchainSynced: Boolean(hedera),
      fallbackMode: !hedera,
    };
  }

  async transfer(dto: TransferBlockchainDto) {
    const type = dto.type ?? DEFAULT_TOKEN_TYPE;

    await this.transferOffchainBalance(dto.assetId, dto.fromOwnerId, dto.toOwnerId, type, dto.amount);

    const previous = await this.blockchainRepository.findOne({
      where: { assetId: dto.assetId },
      order: { createdAt: 'DESC' },
    });

    const hedera = await this.tryTransferOnHedera(previous?.hederaTokenId, dto.amount);

    const record = await this.blockchainRepository.save(
      this.blockchainRepository.create({
        assetId: dto.assetId,
        ownerId: dto.toOwnerId,
        hederaTokenId: hedera?.hederaTokenId ?? previous?.hederaTokenId ?? null,
        transactionHash: hedera?.transactionHash ?? null,
      }),
    );

    return {
      record,
      blockchainSynced: Boolean(hedera),
      fallbackMode: !hedera,
    };
  }

  async byAsset(assetId: string) {
    return this.blockchainRepository.find({
      where: { assetId },
      order: { createdAt: 'DESC' },
    });
  }

  private async tryMintOnHedera(assetId: string): Promise<{ hederaTokenId: string; transactionHash: string } | null> {
    if (!this.client || !this.operatorId || !this.operatorKey) {
      return null;
    }

    try {
      const tx = await new TokenCreateTransaction()
        .setTokenName(`Asset-${assetId.slice(0, 8)}`)
        .setTokenSymbol(`AST${assetId.slice(0, 4).toUpperCase()}`)
        .setTokenType(TokenType.FungibleCommon)
        .setSupplyType(TokenSupplyType.Infinite)
        .setTreasuryAccountId(this.operatorId)
        .setInitialSupply(0)
        .freezeWith(this.client)
        .sign(this.operatorKey);

      const response = await tx.execute(this.client);
      const receipt = await response.getReceipt(this.client);
      const tokenId = receipt.tokenId?.toString() ?? null;

      if (!tokenId) {
        return null;
      }

      return {
        hederaTokenId: tokenId,
        transactionHash: response.transactionId.toString(),
      };
    } catch {
      return null;
    }
  }

  private async tryTransferOnHedera(
    hederaTokenId: string | null | undefined,
    amount: number,
  ): Promise<{ hederaTokenId: string; transactionHash: string } | null> {
    if (!this.client || !this.operatorId || !hederaTokenId) {
      return null;
    }

    try {
      const tx = await new TransferTransaction()
        .setTransactionId(TransactionId.generate(this.operatorId))
        .addTokenTransfer(TokenId.fromString(hederaTokenId), this.operatorId, Math.floor(-amount))
        .addTokenTransfer(TokenId.fromString(hederaTokenId), this.operatorId, Math.floor(amount))
        .execute(this.client);

      await tx.getReceipt(this.client);
      return {
        hederaTokenId,
        transactionHash: tx.transactionId.toString(),
      };
    } catch {
      return null;
    }
  }

  private async upsertOffchainBalance(
    assetId: string,
    ownerId: string,
    type: string,
    amount: number,
  ): Promise<void> {
    const existing = await this.offchainTokenRepository.findOne({ where: { assetId, ownerId, type } });
    if (existing) {
      existing.amount = (Number(existing.amount) + amount).toFixed(4);
      await this.offchainTokenRepository.save(existing);
      return;
    }

    await this.offchainTokenRepository.save(
      this.offchainTokenRepository.create({
        assetId,
        ownerId,
        type,
        amount: amount.toFixed(4),
      }),
    );
  }

  private async transferOffchainBalance(
    assetId: string,
    fromOwnerId: string,
    toOwnerId: string,
    type: string,
    amount: number,
  ): Promise<void> {
    const from = await this.offchainTokenRepository.findOne({ where: { assetId, ownerId: fromOwnerId, type } });
    if (!from || Number(from.amount) < amount) {
      throw new NotFoundException('Insufficient off-chain token balance');
    }

    let to = await this.offchainTokenRepository.findOne({ where: { assetId, ownerId: toOwnerId, type } });
    if (!to) {
      to = this.offchainTokenRepository.create({
        assetId,
        ownerId: toOwnerId,
        type,
        amount: '0.0000',
      });
    }

    from.amount = (Number(from.amount) - amount).toFixed(4);
    to.amount = (Number(to.amount) + amount).toFixed(4);

    await this.offchainTokenRepository.save(from);
    await this.offchainTokenRepository.save(to);

    if (Number(from.amount) <= 0) {
      await this.offchainTokenRepository.delete({ id: from.id });
    }
  }
}
