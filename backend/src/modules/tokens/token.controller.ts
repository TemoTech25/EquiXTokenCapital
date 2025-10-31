import type { Request, Response } from "express";
import { listTokens, createToken, mintToken, getTokenById, updateTokenStatus } from "./token.service";
import { forbidden, badRequest } from "../../lib/errors";

const typeMap: Record<string, string> = {
  FT: "FT_FRACTION",
  NFT: "NFT_TITLE_TWIN",
};

const reverseTypeMap: Record<string, "FT" | "NFT"> = {
  FT_FRACTION: "FT",
  NFT_TITLE_TWIN: "NFT",
};

const statusMap: Record<string, "Draft" | "Live" | "Paused"> = {
  DRAFT: "Draft",
  ACTIVE: "Live",
  LIVE: "Live",
  PAUSED: "Paused",
  CLOSED: "Paused",
};

const serializeToken = (token: any) => {
  const rules = (token.rulesJson ?? {}) as Record<string, unknown>;
  const holders = (token.holdersJson ?? []) as Array<{ wallet: string; amount: number }>;
  const complianceFlags = (token.complianceJson ?? []) as Array<Record<string, unknown>>;
  const spv = (token.spvJson ?? {}) as Record<string, string>;

  return {
    id: token.id,
    name: token.name,
    description: token.description ?? undefined,
    symbol: token.symbol,
    type: typeMap[token.type] ?? token.type,
    associatedCaseId: token.associatedCaseId ?? undefined,
    spv: {
      name: spv.name ?? "",
      registrationNumber: spv.registrationNumber ?? "",
      jurisdiction: spv.jurisdiction ?? "",
      shareClass: spv.shareClass ?? "",
    },
    supply: token.supply ? Number(token.supply) : undefined,
    decimals: token.decimals ?? undefined,
    holders,
    rules: {
      whitelist: (rules.whitelist as string[]) ?? [],
      transferRestrictions: (rules.transferRestrictions as string[]) ?? [],
      holdingLimitPercent: rules.holdingLimitPercent as number | undefined,
      feeSplitsBps: (rules.feeSplitsBps as Array<{ entity: string; bps: number }>) ?? undefined,
    },
    status: statusMap[token.status] ?? "Draft",
    complianceFlags,
    createdAt: token.createdAt?.toISOString?.() ?? new Date().toISOString(),
    updatedAt: token.updatedAt?.toISOString?.() ?? new Date().toISOString(),
  };
};

export const tokenController = {
  list: async (req: Request, res: Response) => {
    const tenantId = req.tenant?.id ?? req.user?.tenantId;
    if (!tenantId) {
      throw forbidden("Tenant context required");
    }
    const tokens = await listTokens(tenantId);
    res.json({ data: tokens.map(serializeToken) });
  },
  detail: async (req: Request, res: Response) => {
    const tenantId = req.tenant?.id ?? req.user?.tenantId;
    if (!tenantId) {
      throw forbidden("Tenant context required");
    }
    const token = await getTokenById(tenantId, req.params.id);
    if (!token) {
      return res.status(404).json({ code: "TOKEN_NOT_FOUND", message: "Token not found" });
    }
    res.json({ data: serializeToken(token) });
  },
  create: async (req: Request, res: Response) => {
    if (!req.user) {
      throw forbidden("User context required");
    }
    const tenantId = req.tenant?.id ?? req.user.tenantId;
    if (!tenantId) {
      throw forbidden("Tenant context required");
    }
    const { symbol, name, description, type, decimals, rules, spv, holders, complianceFlags, associatedCaseId } = req.body;
    const mappedType = reverseTypeMap[type] ?? type;
    const token = await createToken({
      tenantId,
      name,
      description,
      symbol,
      type: mappedType,
      decimals,
      associatedCaseId,
      rules,
      spv,
      holders,
      complianceFlags,
      createdById: req.user.sub,
    });
    res.status(201).json({ data: serializeToken(token) });
  },
  updateStatus: async (req: Request, res: Response) => {
    if (!req.user) {
      throw forbidden("User context required");
    }
    const tenantId = req.tenant?.id ?? req.user.tenantId;
    if (!tenantId) {
      throw forbidden("Tenant context required");
    }
    const { status } = req.body as { status?: string };
    if (!status) {
      throw badRequest("STATUS_REQUIRED", "Status is required");
    }
    const token = await updateTokenStatus(tenantId, req.params.id, status);
    res.json({ data: serializeToken(token) });
  },
  mint: async (req: Request, res: Response) => {
    if (!req.user) {
      throw forbidden("User context required");
    }
    const tenantId = req.tenant?.id ?? req.user.tenantId;
    if (!tenantId) {
      throw forbidden("Tenant context required");
    }
    const { amount, metadata } = req.body as { amount?: string; metadata?: string[] };
    const payload: { amount?: bigint; metadata?: Uint8Array[] } = {};
    if (amount) {
      try {
        payload.amount = BigInt(amount);
      } catch {
        throw badRequest("INVALID_AMOUNT", "Amount must be a numeric string");
      }
    }
    if (metadata) {
      payload.metadata = metadata.map((item) => Buffer.from(item, "base64"));
    }
    const updated = await mintToken(tenantId, req.params.id, payload, req.user.sub);
    res.status(202).json({ data: serializeToken(updated) });
  },
};
