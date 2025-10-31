import type { Request, Response } from "express";
import { listDocuments, uploadDocument, markSigned, markAnchored } from "./document.service";
import { badRequest, forbidden } from "../../lib/errors";

export const documentController = {
  list: async (req: Request, res: Response) => {
    const tenantId = req.tenant?.id ?? req.user?.tenantId;
    if (!tenantId) {
      throw forbidden("Tenant context required");
    }
    const items = await listDocuments(tenantId, {
      caseId: req.query.caseId as string | undefined,
      type: req.query.type as string | undefined,
      anchored: req.query.anchored as string | undefined,
      signed: req.query.signed as string | undefined,
    });
    res.json({ items });
  },
  upload: async (req: Request, res: Response) => {
    if (!req.user) {
      throw forbidden("User context required");
    }
    const tenantId = req.tenant?.id ?? req.user.tenantId;
    if (!tenantId) {
      throw forbidden("Tenant context required");
    }
    const document = await uploadDocument({
      tenantId,
      caseId: req.body.caseId,
      name: req.body.name,
      type: req.body.type,
      s3Key: req.body.s3Key,
      contentBase64: req.body.contentBase64,
      metadata: req.body.metadata,
      uploadedById: req.user.sub,
    });
    res.status(201).json(document);
  },
  esign: async (req: Request, res: Response) => {
    if (!req.user) {
      throw forbidden("User context required");
    }
    const tenantId = req.tenant?.id ?? req.user.tenantId;
    if (!tenantId) {
      throw forbidden("Tenant context required");
    }
    const completedAt = req.body?.signedAt ? new Date(req.body.signedAt) : new Date();
    const document = await markSigned(tenantId, req.params.id, completedAt, req.user.sub);
    res.status(200).json({ document });
  },
  anchor: async (req: Request, res: Response) => {
    if (!req.user) {
      throw forbidden("User context required");
    }
    const tenantId = req.tenant?.id ?? req.user.tenantId;
    if (!tenantId) {
      throw forbidden("Tenant context required");
    }
    const { hcsMsgId } = req.body ?? {};
    if (!hcsMsgId || typeof hcsMsgId !== "string") {
      throw badRequest("HCS_MSG_REQUIRED", "Provide hcsMsgId from Hedera consensus topic");
    }
    const document = await markAnchored(tenantId, req.params.id, hcsMsgId, req.user.sub);
    res.status(200).json({ document });
  },
};
