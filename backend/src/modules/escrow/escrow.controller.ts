import type { Request, Response } from "express";
import { forbidden, badRequest } from "../../lib/errors";
import { createEscrow, getEscrow, listEscrows, markEscrowFunded, releaseEscrow } from "./escrow.service";

const serializeEscrow = (escrow: any) => ({
  id: escrow.id,
  caseId: escrow.caseId,
  rail: escrow.rail,
  amountTinybars: escrow.amountTinybars?.toString?.() ?? "0",
  status: escrow.status,
  conditions: (escrow.conditionsJson ?? []) as Array<Record<string, unknown>>,
  splits: (escrow.splitsJson ?? []) as Array<Record<string, unknown>>,
  approvals: (escrow.approvalsJson ?? []) as Array<Record<string, unknown>>,
  ledgerRef: escrow.ledgerRef ?? undefined,
  createdAt: escrow.createdAt?.toISOString?.() ?? new Date().toISOString(),
  updatedAt: escrow.updatedAt?.toISOString?.() ?? new Date().toISOString(),
  case: escrow.case
    ? {
        id: escrow.case.id,
        title: escrow.case.title,
        municipality: escrow.case.municipality,
        stage: escrow.case.stage,
      }
    : undefined,
});

export const escrowController = {
  list: async (req: Request, res: Response) => {
    const tenantId = req.tenant?.id ?? req.user?.tenantId;
    if (!tenantId) throw forbidden("Tenant context required");
    const escrows = await listEscrows(tenantId);
    res.json({ data: escrows.map(serializeEscrow) });
  },
  create: async (req: Request, res: Response) => {
    if (!req.user) throw forbidden();
    const tenantId = req.tenant?.id ?? req.user.tenantId;
    if (!tenantId) throw forbidden("Tenant context required");
    const amountTinybars =
      typeof req.body.amountTinybars === "string" ? BigInt(req.body.amountTinybars) : BigInt(req.body.amountTinybars ?? 0);
    if (amountTinybars <= 0n) {
      throw badRequest("INVALID_AMOUNT", "amountTinybars must be greater than zero");
    }
    const escrow = await createEscrow({
      tenantId,
      caseId: req.body.caseId,
      rail: req.body.rail,
      amountTinybars,
      conditions: req.body.conditions ?? [],
      splits: req.body.splits ?? [],
      approvals: req.body.approvals ?? [],
      createdById: req.user.sub,
      contractId: req.body.contractId,
    });
    res.status(201).json(serializeEscrow(escrow));
  },
  detail: async (req: Request, res: Response) => {
    const tenantId = req.tenant?.id ?? req.user?.tenantId;
    if (!tenantId) throw forbidden("Tenant context required");
    const escrow = await getEscrow(tenantId, req.params.id);
    res.json({ data: serializeEscrow(escrow) });
  },
  fund: async (req: Request, res: Response) => {
    if (!req.user) throw forbidden();
    const tenantId = req.tenant?.id ?? req.user.tenantId;
    if (!tenantId) throw forbidden("Tenant context required");
    const escrow = await markEscrowFunded(tenantId, req.params.id, req.user.sub, req.body.reference ?? "manual");
    res.status(202).json({ data: serializeEscrow(escrow) });
  },
  release: async (req: Request, res: Response) => {
    if (!req.user) throw forbidden();
    const tenantId = req.tenant?.id ?? req.user.tenantId;
    if (!tenantId) throw forbidden("Tenant context required");
    const result = await releaseEscrow({ tenantId, escrowId: req.params.id, userId: req.user.sub });
    res.status(202).json({
      data: {
        escrow: serializeEscrow(result.escrow),
        releaseResult: result.releaseResult,
      },
    });
  },
};
