import type { Request, Response } from "express";
import { forbidden, notFound } from "../../lib/errors";
import { createInvestment, createOffering, getOfferingById, listOfferings, publishOffering } from "./marketplace.service";

const offeringStatusMap: Record<string, "Live" | "Upcoming" | "Closed"> = {
  DRAFT: "Upcoming",
  LIVE: "Live",
  PAUSED: "Upcoming",
  CLOSED: "Closed",
};

const serializeOffering = (offering: any) => {
  const eligibility = (offering.eligibilityJson ?? []) as string[];
  return {
    id: offering.id,
    title: offering.title,
    issuer: offering.issuer,
    location: offering.location,
    thumbnail: offering.thumbnail ?? undefined,
    targetAmount: offering.targetCents / 100,
    raisedAmount: offering.raisedCents / 100,
    minTicket: offering.minTicketCents / 100,
    status: offeringStatusMap[offering.status] ?? "Upcoming",
    eligibility,
    closingDate: offering.closingDate?.toISOString?.() ?? new Date().toISOString(),
    impactSummary: offering.impactSummary ?? undefined,
    tokenId: offering.tokenId ?? undefined,
  };
};

const serializeInvestment = (investment: any) => ({
  id: investment.id,
  offeringId: investment.offeringId,
  investorId: investment.userId ?? "external",
  amount: investment.amountCents / 100,
  rail: investment.rail === "STABLECOIN" ? "Stablecoin" : "Bank",
  status: investment.status === "CONFIRMED" ? "Completed" : "Pending",
  createdAt: investment.createdAt?.toISOString?.() ?? "",
});

export const marketplaceController = {
  list: async (req: Request, res: Response) => {
    const tenantId = req.tenant?.id ?? req.user?.tenantId;
    if (!tenantId) {
      throw forbidden("Tenant context required");
    }
    const offerings = await listOfferings(tenantId);
    res.json({
      data: offerings.map(serializeOffering),
    });
  },
  detail: async (req: Request, res: Response) => {
    const tenantId = req.tenant?.id ?? req.user?.tenantId;
    if (!tenantId) {
      throw forbidden("Tenant context required");
    }
    const offering = await getOfferingById(tenantId, req.params.id);
    if (!offering) {
      throw notFound("Offering not found");
    }
    res.json({
      data: serializeOffering(offering),
    });
  },
  create: async (req: Request, res: Response) => {
    if (!req.user) throw forbidden();
    const tenantId = req.tenant?.id ?? req.user.tenantId;
    if (!tenantId) {
      throw forbidden("Tenant context required");
    }
    const offering = await createOffering({
      tenantId,
      title: req.body.title,
      location: req.body.location,
      issuer: req.body.issuer,
      thumbnail: req.body.thumbnail,
      targetCents: Math.round((req.body.targetAmount ?? 0) * 100),
      minTicketCents: Math.round((req.body.minTicket ?? 0) * 100),
      impactSummary: req.body.impactSummary,
      eligibility: req.body.eligibility ?? [],
      closingDate: req.body.closingDate ? new Date(req.body.closingDate) : undefined,
      tokenId: req.body.tokenId,
    });
    res.status(201).json({ data: serializeOffering(offering) });
  },
  publish: async (req: Request, res: Response) => {
    if (!req.user) throw forbidden();
    const tenantId = req.tenant?.id ?? req.user.tenantId;
    if (!tenantId) {
      throw forbidden("Tenant context required");
    }
    const offering = await publishOffering(tenantId, req.params.id);
    res.status(202).json({ data: serializeOffering(offering) });
  },
  invest: async (req: Request, res: Response) => {
    if (!req.user) throw forbidden();
    const tenantId = req.tenant?.id ?? req.user.tenantId;
    if (!tenantId) {
      throw forbidden("Tenant context required");
    }
    const railInput = typeof req.body.rail === "string" ? req.body.rail.toUpperCase() : "BANK";
    const investment = await createInvestment(tenantId, req.params.id, {
      userId: req.user.sub,
      amountCents: Math.round((req.body.amount ?? 0) * 100),
      rail: railInput === "STABLECOIN" ? "STABLECOIN" : "BANK",
    });
    res.status(202).json({ data: serializeInvestment(investment) });
  },
};
