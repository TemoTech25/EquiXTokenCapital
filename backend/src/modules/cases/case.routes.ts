import { Router } from "express";
import { z } from "zod";
import { authMiddleware } from "../auth/auth.middleware";
import { caseController } from "./case.controller";
import { validate } from "../../lib/validate";
import { requireIdempotency } from "../../lib/idempotency";
import { requireRoles } from "../../middleware/rbac.middleware";

export const caseRouter = Router();

caseRouter.use(authMiddleware);

const createSchema = z.object({
  title: z.string().min(3),
  municipality: z.string().min(2),
  priceCents: z.number().int().positive(),
  rail: z.enum(["BANK", "STABLECOIN"]),
  parties: z
    .array(
      z.object({
        type: z.enum(["BUYER", "SELLER", "CONVEYANCER", "AGENT", "MUNICIPALITY", "BANK", "DEVELOPER"]),
        name: z.string().min(2),
        email: z.string().email().optional(),
        phone: z.string().optional(),
      }),
    )
    .min(2),
});

const updateSchema = z.object({
  title: z.string().optional(),
  stage: z
    .enum(["INTAKE", "KYC", "ESCROW", "CERTS", "LODGEMENT", "REGISTRATION", "CLOSED"])
    .optional(),
  assignedToId: z.string().optional(),
  slaAt: z.string().datetime().optional(),
});

caseRouter.get("/", caseController.list);
caseRouter.post("/", requireIdempotency, requireRoles("admin", "case_admin"), validate(createSchema), caseController.create);
caseRouter.get("/:id", caseController.detail);
caseRouter.patch(
  "/:id",
  requireIdempotency,
  requireRoles("admin", "case_admin", "conveyancer"),
  validate(updateSchema),
  caseController.update,
);
caseRouter.post(
  "/:id/release-funds",
  requireIdempotency,
  requireRoles("admin", "escrow_manager"),
  caseController.releaseFunds,
);
