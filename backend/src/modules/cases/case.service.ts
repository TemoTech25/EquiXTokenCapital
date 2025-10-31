import { prisma } from "../../db/client";
import { badRequest } from "../../lib/errors";

const STAGE_FLOW: Record<string, string[]> = {
  INTAKE: ["KYC"],
  KYC: ["ESCROW"],
  ESCROW: ["CERTS"],
  CERTS: ["LODGEMENT"],
  LODGEMENT: ["REGISTRATION"],
  REGISTRATION: ["CLOSED"],
  CLOSED: [],
};

export const listCases = async (tenantId: string, filters: { stage?: string; municipality?: string; bank?: string; assignee?: string }) => {
  const where: Record<string, unknown> = { tenantId };
  if (filters.stage) where.stage = filters.stage as any;
  if (filters.municipality) where.municipality = filters.municipality;
  if (filters.bank) where.bankRef = filters.bank;
  if (filters.assignee) where.assignedToId = filters.assignee;

  return prisma.case.findMany({
    where,
    include: { parties: true, documents: true, escrow: true },
    orderBy: { createdAt: "desc" },
  });
};

export type CreateCaseInput = {
  tenantId: string;
  title: string;
  municipality: string;
  priceCents: number;
  rail: "BANK" | "STABLECOIN";
  parties: Array<{ type: string; name: string; email?: string; phone?: string }>;
  createdById: string;
};

export const createCase = async (input: CreateCaseInput) => {
  return prisma.$transaction(async (tx: any) => {
    const caseRecord = await tx.case.create({
      data: {
        tenantId: input.tenantId,
        title: input.title,
        municipality: input.municipality,
        priceCents: input.priceCents,
        rail: input.rail,
        stage: "INTAKE",
        parties: {
          create: input.parties.map((party) => ({
            type: party.type as any,
            name: party.name,
            email: party.email,
            phone: party.phone,
          })),
        },
      },
      include: { parties: true },
    });

    await tx.audit.create({
      data: {
        action: "CASE_CREATED",
        subjectType: "CASE",
        subjectId: caseRecord.id,
        metaJson: {
          title: input.title,
          priceCents: input.priceCents,
        },
        userId: input.createdById,
      },
    });

    return caseRecord;
  });
};

export type UpdateCaseInput = {
  title?: string;
  stage?: string;
  assignedToId?: string;
  slaAt?: Date;
  updatedById: string;
};

export const updateCase = async (tenantId: string, caseId: string, input: UpdateCaseInput) => {
  const caseRecord = await prisma.case.findFirst({ where: { id: caseId, tenantId } });
  if (!caseRecord) throw badRequest("CASE_NOT_FOUND", "Case not found");

  let nextStage = caseRecord.stage;
  if (input.stage && input.stage !== caseRecord.stage) {
    const allowed = STAGE_FLOW[caseRecord.stage] ?? [];
    if (!allowed.includes(input.stage)) {
      throw badRequest("INVALID_STAGE_TRANSITION", `${caseRecord.stage} cannot transition to ${input.stage}`);
    }
    nextStage = input.stage;
  }

  return prisma.$transaction(async (tx: any) => {
    const updated = await tx.case.update({
      where: { id: caseId },
      data: {
        title: input.title ?? caseRecord.title,
        stage: nextStage as any,
        assignedToId: input.assignedToId ?? caseRecord.assignedToId,
        slaAt: input.slaAt ?? caseRecord.slaAt,
      },
      include: { parties: true, documents: true, escrow: true },
    });

    await tx.audit.create({
      data: {
        action: input.stage ? "CASE_STAGE_CHANGED" : "CASE_UPDATED",
        subjectType: "CASE",
        subjectId: caseId,
        metaJson: {
          fromStage: caseRecord.stage,
          toStage: nextStage,
          updatedFields: Object.keys(input).filter((key) => key !== "updatedById"),
        },
        userId: input.updatedById,
      },
    });

    return updated;
  });
};
