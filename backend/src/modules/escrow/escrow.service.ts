import { prisma } from "../../db/client";
import { badRequest, notFound } from "../../lib/errors";
import { callEscrowRelease } from "../hedera/scs";

export type CreateEscrowInput = {
  tenantId: string;
  caseId: string;
  rail: "BANK" | "STABLECOIN";
  amountTinybars: bigint;
  conditions: Array<{ code: string; description?: string }>;
  splits: Array<{ accountId: string; bps: number }>;
  approvals: Array<{ approverId: string; status: "PENDING" | "APPROVED" | "REJECTED" }>;
  createdById: string;
  contractId: string;
};

export const createEscrow = async (input: CreateEscrowInput) => {
  return prisma.$transaction(async (tx: any) => {
    const caseRecord = await tx.case.findFirst({ where: { id: input.caseId, tenantId: input.tenantId }, include: { escrow: true } });
    if (!caseRecord) {
      throw notFound("Case not found for escrow");
    }
    if (caseRecord.escrowId) {
      throw badRequest("ESCROW_EXISTS", "Escrow already linked to this case");
    }

    const approvals = (input.approvals ?? []).map((approval) => ({
      ...approval,
      status: approval.status ?? "PENDING",
    }));

    const escrow = await tx.escrow.create({
      data: {
        caseId: input.caseId,
        rail: input.rail,
        amountTinybars: input.amountTinybars,
        status: "DRAFT",
        conditionsJson: input.conditions ?? [],
        splitsJson: input.splits ?? [],
        approvalsJson: approvals,
        ledgerRef: input.contractId,
      },
    });

    await tx.case.update({ where: { id: caseRecord.id }, data: { escrowId: escrow.id } });

    await tx.audit.create({
      data: {
        action: "ESCROW_CREATED",
        subjectType: "ESCROW",
        subjectId: escrow.id,
        metaJson: {
          caseId: caseRecord.id,
          rail: input.rail,
          amountTinybars: input.amountTinybars.toString(),
        },
        userId: input.createdById,
      },
    });

    return escrow;
  });
};

export const listEscrows = async (tenantId: string) => {
  return prisma.escrow.findMany({
    where: { case: { tenantId } },
    include: { case: true },
    orderBy: { createdAt: "desc" },
  });
};

export const getEscrow = async (tenantId: string, escrowId: string) => {
  const escrow = await prisma.escrow.findFirst({
    where: {
      id: escrowId,
      case: { tenantId },
    },
    include: { case: true },
  });
  if (!escrow) {
    throw notFound("Escrow not found");
  }
  return escrow;
};

export const markEscrowFunded = async (tenantId: string, escrowId: string, fundedById: string, reference: string) => {
  return prisma.$transaction(async (tx: any) => {
    const escrow = await tx.escrow.findFirst({
      where: { id: escrowId, case: { tenantId } },
    });
    if (!escrow) {
      throw notFound("Escrow not found");
    }
    if (escrow.status === "FUNDED") {
      return escrow;
    }
    const updated = await tx.escrow.update({ where: { id: escrowId }, data: { status: "FUNDED" } });

    await tx.audit.create({
      data: {
        action: "ESCROW_FUNDED",
        subjectType: "ESCROW",
        subjectId: escrowId,
        metaJson: {
          reference,
        },
        userId: fundedById,
      },
    });

    return updated;
  });
};

export type ReleaseEscrowInput = {
  tenantId: string;
  escrowId: string;
  userId: string;
};

export const releaseEscrow = async ({ tenantId, escrowId, userId }: ReleaseEscrowInput) => {
  return prisma.$transaction(async (tx: any) => {
    const escrow = await tx.escrow.findFirst({
      where: { id: escrowId, case: { tenantId } },
      include: { case: true },
    });
    if (!escrow) {
      throw notFound("Escrow not found");
    }
    if (escrow.status !== "FUNDED") {
      throw badRequest("ESCROW_NOT_FUNDED", "Escrow must be funded before release");
    }
    const approvals = (escrow.approvalsJson as Array<{ status: string }>) ?? [];
    const pendingApproval = approvals.find((approval) => approval.status !== "APPROVED");
    if (pendingApproval) {
      throw badRequest("APPROVALS_INCOMPLETE", "All approvers must approve before release");
    }
    if (!escrow.ledgerRef) {
      throw badRequest("CONTRACT_ID_MISSING", "Escrow contract not configured");
    }

    const splits = (escrow.splitsJson as Array<{ accountId: string; bps: number }>) ?? [];

    const grossAmount = escrow.amountTinybars as bigint;

    const releaseResult = await callEscrowRelease({
      contractId: escrow.ledgerRef,
      caseId: escrow.caseId,
      amountTinybars: grossAmount,
      beneficiaries: splits,
    });

    const updated = await tx.escrow.update({
      where: { id: escrowId },
      data: {
        status: "RELEASED",
        ledgerRef: `${escrow.ledgerRef}|${releaseResult.transactionId}`,
      },
    });

    await tx.audit.create({
      data: {
        action: "ESCROW_RELEASED",
        subjectType: "ESCROW",
        subjectId: escrowId,
        metaJson: {
          transactionId: releaseResult.transactionId,
          status: releaseResult.status,
        },
        userId,
      },
    });

    return {
      escrow: updated,
      releaseResult,
    };
  });
};
