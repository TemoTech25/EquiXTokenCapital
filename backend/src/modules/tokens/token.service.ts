import { prisma } from "../../db/client";
import {
  createFungibleToken,
  createNonFungibleToken,
  mintFungibleToken,
  mintNonFungibleToken,
} from "../hedera/hts";

type TokenType = "FT" | "NFT";

export type CreateTokenInput = {
  tenantId: string;
  name: string;
  description?: string;
  symbol: string;
  type: TokenType;
  decimals?: number;
  associatedCaseId?: string;
  rules: {
    whitelist: string[];
    transferRestrictions: string[];
    holdingLimitPercent?: number;
    feeSplitsBps?: Array<{ entity: string; bps: number }>;
  };
  spv: {
    name: string;
    registrationNumber: string;
    jurisdiction: string;
    shareClass: string;
  };
  holders?: Array<{ wallet: string; amount: number }>;
  complianceFlags?: Array<{ id: string; label: string; severity: string; description: string; resolved: boolean }>;
};

export const listTokens = async (tenantId: string) => {
  return prisma.token.findMany({ where: { tenantId }, orderBy: { createdAt: "desc" } });
};

export const getTokenById = async (tenantId: string, tokenId: string) => {
  return prisma.token.findFirst({
    where: { id: tokenId, tenantId },
  });
};

export const createToken = async ({
  tenantId,
  name,
  description,
  symbol,
  type,
  decimals,
  associatedCaseId,
  rules,
  spv,
  holders,
  complianceFlags,
  createdById,
}: CreateTokenInput & { createdById: string }) => {
  let htsId: string | undefined;

  if (type === "FT") {
    if (decimals === undefined) {
      throw new Error("Fungible tokens require decimals");
    }
    htsId = await createFungibleToken(symbol, decimals);
  } else {
    htsId = await createNonFungibleToken(symbol);
  }

  return prisma.$transaction(async (tx: any) => {
    const token = await tx.token.create({
      data: {
        tenantId,
        name,
        description: description ?? null,
        symbol,
        type,
        decimals: decimals ?? null,
        associatedCaseId: associatedCaseId ?? null,
        rulesJson: rules,
        spvJson: spv,
        holdersJson: holders ?? [],
        complianceJson: complianceFlags ?? [],
        htsId,
        status: "DRAFT",
      },
    });

    await tx.audit.create({
      data: {
        action: "TOKEN_CREATED",
        subjectType: "TOKEN",
        subjectId: token.id,
        metaJson: {
          symbol,
          type,
          htsId,
        },
        userId: createdById,
      },
    });

    return token;
  });
};

export const mintToken = async (
  tenantId: string,
  tokenId: string,
  amountOrMetadata: { amount?: bigint; metadata?: Uint8Array[] },
  userId: string,
) => {
  return prisma.$transaction(async (tx: any) => {
    const token = await tx.token.findFirst({ where: { id: tokenId, tenantId } });
    if (!token) {
      throw new Error("Token not found");
    }
    if (!token.htsId) {
      throw new Error("Token has no Hedera ID");
    }

    let supplyDelta = BigInt(0);

    if (token.type === "FT") {
      if (!amountOrMetadata.amount) {
        throw new Error("Mint amount required for FT");
      }
      await mintFungibleToken(token.htsId, amountOrMetadata.amount);
      supplyDelta = amountOrMetadata.amount;
    } else {
      if (!amountOrMetadata.metadata) {
        throw new Error("Metadata required for NFT mint");
      }
      await mintNonFungibleToken(token.htsId, amountOrMetadata.metadata);
      supplyDelta = BigInt(amountOrMetadata.metadata.length);
    }

    const updated = await tx.token.update({
      where: { id: tokenId },
      data: {
        supply: (token.supply ?? BigInt(0)) + supplyDelta,
        status: token.status === "DRAFT" ? "ACTIVE" : token.status,
      },
    });

    await tx.audit.create({
      data: {
        action: "TOKEN_MINTED",
        subjectType: "TOKEN",
        subjectId: tokenId,
        metaJson: {
          supplyDelta: supplyDelta.toString(),
        },
        userId,
      },
    });

    return updated;
  });
};

export const updateTokenStatus = async (tenantId: string, tokenId: string, status: string) => {
  const token = await prisma.token.findFirst({ where: { id: tokenId, tenantId } });
  if (!token) {
    throw new Error("Token not found");
  }
  return prisma.token.update({
    where: { id: tokenId },
    data: {
      status,
      updatedAt: new Date(),
    },
  });
};
