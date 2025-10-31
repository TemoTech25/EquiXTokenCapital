import type { Request, Response } from "express";
import { listCases, createCase, updateCase } from "./case.service";
import { forbidden, notFound } from "../../lib/errors";
import { prisma } from "../../db/client";
import { releaseEscrow } from "../escrow/escrow.service";

export const caseController = {
  list: async (req: Request, res: Response) => {
    const tenantId = req.tenant?.id ?? req.user?.tenantId;
    if (!tenantId) {
      throw forbidden("Tenant context required");
    }
    const items = await listCases(tenantId, {
      stage: req.query.stage as string | undefined,
      municipality: req.query.municipality as string | undefined,
      bank: req.query.bank as string | undefined,
      assignee: req.query.assignee as string | undefined,
    });
    res.json({ data: items });
  },
  create: async (req: Request, res: Response) => {
    const tenantId = req.tenant?.id ?? req.user?.tenantId;
    if (!tenantId || !req.user) {
      throw forbidden("Tenant context required");
    }
    const caseRecord = await createCase({
      tenantId,
      title: req.body.title,
      municipality: req.body.municipality,
      priceCents: req.body.priceCents,
      rail: req.body.rail,
      parties: req.body.parties,
      createdById: req.user.sub,
    });
    res.status(201).json({ data: caseRecord });
  },
  detail: async (req: Request, res: Response) => {
    const tenantId = req.tenant?.id ?? req.user?.tenantId;
    if (!tenantId) {
      throw forbidden("Tenant context required");
    }
    const caseRecord = await prisma.case.findFirst({
      where: { id: req.params.id, tenantId },
      include: { parties: true, documents: true, escrow: true },
    });
    if (!caseRecord) {
      throw notFound("Case not found");
    }
    res.json({ data: caseRecord });
  },
  update: async (req: Request, res: Response) => {
    if (!req.user) throw forbidden();
    const tenantId = req.tenant?.id ?? req.user.tenantId;
    if (!tenantId) {
      throw forbidden("Tenant context required");
    }
    const updated = await updateCase(tenantId, req.params.id, {
      title: req.body.title,
      stage: req.body.stage,
      assignedToId: req.body.assignedToId,
      slaAt: req.body.slaAt ? new Date(req.body.slaAt) : undefined,
      updatedById: req.user.sub,
    });
    res.json({ data: updated });
  },
  releaseFunds: async (req: Request, res: Response) => {
    if (!req.user) throw forbidden();
    const tenantId = req.tenant?.id ?? req.user.tenantId;
    if (!tenantId) {
      throw forbidden("Tenant context required");
    }
    const caseRecord = await prisma.case.findFirst({
      where: { id: req.params.id, tenantId },
      include: { escrow: true },
    });
    if (!caseRecord || !caseRecord.escrowId) {
      throw notFound("Escrow not linked to case");
    }
    const result = await releaseEscrow({ tenantId, escrowId: caseRecord.escrowId, userId: req.user.sub });
    res.status(202).json({ data: result });
  },
};
