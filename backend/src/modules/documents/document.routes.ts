import { Router } from "express";
import { z } from "zod";
import { authMiddleware } from "../auth/auth.middleware";
import { documentController } from "./document.controller";
import { validate } from "../../lib/validate";
import { requireIdempotency } from "../../lib/idempotency";
import { requireRoles } from "../../middleware/rbac.middleware";

export const documentRouter = Router();

documentRouter.use(authMiddleware);

const uploadSchema = z.object({
  caseId: z.string().optional(),
  name: z.string().min(3),
  type: z.enum(["OTP", "DEED", "RECEIPT", "CERT", "OTHER"]),
  s3Key: z.string().optional(),
  contentBase64: z.string().optional(),
  metadata: z.record(z.any()).optional(),
});

const esignSchema = z.object({
  signedAt: z.string().datetime({ message: "signedAt must be ISO datetime" }).optional(),
});

const anchorSchema = z.object({
  hcsMsgId: z.string().min(8),
});

documentRouter.get("/", documentController.list);
documentRouter.post(
  "/",
  requireIdempotency,
  requireRoles("admin", "case_admin", "conveyancer"),
  validate(uploadSchema),
  documentController.upload,
);
documentRouter.post(
  "/:id/esign",
  requireRoles("admin", "case_admin"),
  validate(esignSchema),
  documentController.esign,
);
documentRouter.post(
  "/:id/anchor",
  requireRoles("admin", "case_admin"),
  validate(anchorSchema),
  documentController.anchor,
);
