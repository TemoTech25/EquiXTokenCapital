import { prisma } from "../../db/client";
import { badRequest, notFound } from "../../lib/errors";

export type CreateOfferingInput = {
  tenantId: string;
  title: string;
  location: string;
  issuer: string;
  thumbnail?: string;
  targetCents: number;
  minTicketCents: number;
  impactSummary?: string;
  eligibility: string[];
  closingDate?: Date;
  tokenId?: string;
};

export const listOfferings = async (tenantId: string) => {
  return prisma.offering.findMany({
    where: { tenantId },
    include: {
      investments: true,
      token: true,
    },
    orderBy: { createdAt: "desc" },
  });
};

export const getOfferingById = async (tenantId: string, offeringId: string) => {
  return prisma.offering.findFirst({
    where: { tenantId, id: offeringId },
    include: {
      investments: true,
      token: true,
    },
  });
};

export const createOffering = async (input: CreateOfferingInput) => {
  return prisma.offering.create({
    data: {
      tenantId: input.tenantId,
      title: input.title,
      location: input.location,
      issuer: input.issuer,
      thumbnail: input.thumbnail ?? null,
      targetCents: input.targetCents,
      minTicketCents: input.minTicketCents,
      impactSummary: input.impactSummary ?? null,
      eligibilityJson: input.eligibility ?? [],
      closingDate: input.closingDate ?? null,
      tokenId: input.tokenId ?? null,
    },
  });
};

export const publishOffering = async (tenantId: string, offeringId: string) => {
  const offering = await prisma.offering.findFirst({ where: { id: offeringId, tenantId } });
  if (!offering) {
    throw notFound("Offering not found");
  }
  if (offering.status === "LIVE") {
    return offering;
  }
  return prisma.offering.update({
    where: { id: offeringId },
    data: { status: "LIVE", raisedCents: offering.raisedCents ?? 0 },
  });
};

export const createInvestment = async (tenantId: string, offeringId: string, payload: { userId?: string; amountCents: number; rail: string }) => {
  const offering = await prisma.offering.findFirst({ where: { id: offeringId, tenantId } });
  if (!offering) {
    throw notFound("Offering not found");
  }
  if (offering.status !== "LIVE") {
    throw badRequest("OFFERING_NOT_LIVE", "Offering must be live to accept investments");
  }

  const investment = await prisma.investment.create({
    data: {
      offeringId,
      userId: payload.userId ?? null,
      amountCents: payload.amountCents,
      rail: payload.rail,
      status: "PENDING",
    },
  });

  await prisma.offering.update({
    where: { id: offeringId },
    data: { raisedCents: offering.raisedCents + payload.amountCents },
  });

  return investment;
};
