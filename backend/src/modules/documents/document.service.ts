import crypto from "crypto";
import { prisma } from "../../db/client";
import { badRequest, notFound } from "../../lib/errors";
import { storeFileOnHfs } from "../hedera/hfs";

export type UploadDocumentInput = {
  tenantId: string;
  caseId?: string;
  name: string;
  type: "OTP" | "DEED" | "RECEIPT" | "CERT" | "OTHER";
  s3Key?: string;
  contentBase64?: string;
  metadata?: Record<string, unknown>;
  uploadedById: string;
};

export const listDocuments = async (tenantId: string, filters: { caseId?: string; type?: string; anchored?: string; signed?: string }) => {
  return prisma.document.findMany({
    where: {
      tenantId,
      caseId: filters.caseId,
      type: filters.type as any,
      anchoredHcsMsgId: filters.anchored === "true" ? { not: null } : filters.anchored === "false" ? null : undefined,
      signedAt: filters.signed === "true" ? { not: null } : filters.signed === "false" ? null : undefined,
    },
    orderBy: { createdAt: "desc" },
  });
};

export const uploadDocument = async (input: UploadDocumentInput) => {
  if (!input.s3Key && !input.contentBase64) {
    throw badRequest("DOCUMENT_SOURCE_REQUIRED", "Provide either s3Key or contentBase64");
  }
  let s3Key = input.s3Key ?? "";
  let sha256 = "";
  if (input.contentBase64) {
    const buffer = Buffer.from(input.contentBase64, "base64");
    sha256 = crypto.createHash("sha256").update(buffer).digest("hex");
    if (!input.s3Key) {
      const fileMemo = `${input.type}:${input.name}`.slice(0, 100);
      const fileId = await storeFileOnHfs(buffer, fileMemo);
      s3Key = `hfs://${fileId}`;
    }
  } else if (input.s3Key) {
    sha256 = crypto.createHash("sha256").update(input.s3Key).digest("hex");
    s3Key = input.s3Key;
  }

  const document = await prisma.document.create({
    data: {
      tenantId: input.tenantId,
      caseId: input.caseId,
      name: input.name,
      type: input.type,
      s3Key,
      sha256,
    },
  });

  await prisma.audit.create({
    data: {
      action: "DOCUMENT_UPLOADED",
      subjectType: "DOCUMENT",
      subjectId: document.id,
      metaJson: {
        name: input.name,
        caseId: input.caseId,
        type: input.type,
        metadata: input.metadata ?? {},
      },
      userId: input.uploadedById,
    },
  });

  return document;
};

export const markSigned = async (tenantId: string, documentId: string, signedAt: Date, userId: string) => {
  const document = await prisma.document.update({
    where: { id: documentId, tenantId },
    data: { signedAt },
  });

  await prisma.audit.create({
    data: {
      action: "DOCUMENT_SIGNED",
      subjectType: "DOCUMENT",
      subjectId: documentId,
      metaJson: {},
      userId,
    },
  });

  return document;
};

export const markAnchored = async (tenantId: string, documentId: string, hcsMsgId: string, userId: string) => {
  const document = await prisma.document.update({ where: { id: documentId, tenantId }, data: { anchoredHcsMsgId: hcsMsgId } });

  await prisma.audit.create({
    data: {
      action: "DOCUMENT_ANCHORED",
      subjectType: "DOCUMENT",
      subjectId: documentId,
      metaJson: { hcsMsgId },
      userId,
    },
  });

  return document;
};

export const getDocument = async (tenantId: string, documentId: string) => {
  const document = await prisma.document.findFirst({ where: { id: documentId, tenantId } });
  if (!document) {
    throw notFound("Document not found");
  }
  return document;
};
