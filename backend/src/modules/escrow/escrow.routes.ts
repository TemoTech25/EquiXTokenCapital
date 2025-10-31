import { Router } from "express";
import { z } from "zod";
import { authMiddleware } from "../auth/auth.middleware";
import { escrowController } from "./escrow.controller";
import { requireRoles } from "../../middleware/rbac.middleware";
import { validate } from "../../lib/validate";
import { requireIdempotency } from "../../lib/idempotency";

export const escrowRouter = Router();

escrowRouter.use(authMiddleware);

const createSchema = z.object({
  caseId: z.string(),
  rail: z.enum(["BANK", "STABLECOIN"]),
  amountTinybars: z
    .union([z.string().regex(/^\d+$/), z.number().int().positive()])
    .transform((val) => (typeof val === "number" ? val.toString() : val)),
  conditions: z
    .array(
      z.object({
        code: z.string(),
        description: z.string().optional(),
      }),
    )
    .optional(),
  splits: z
    .array(
      z.object({
        accountId: z.string(),
        bps: z.number().int().min(0).max(10_000),
      }),
    )
    .optional(),
  approvals: z
    .array(
      z.object({
        approverId: z.string(),
        status: z.enum(["PENDING", "APPROVED", "REJECTED"]).optional(),
      }),
    )
    .optional(),
  contractId: z.string().min(5),
});

const fundSchema = z.object({
  reference: z.string().optional(),
});

escrowRouter.get("/", escrowController.list);
escrowRouter.post("/", requireIdempotency, requireRoles("admin", "escrow_manager"), validate(createSchema), escrowController.create);
escrowRouter.get("/:id", escrowController.detail);
escrowRouter.post(
  "/:id/fund",
  requireIdempotency,
  requireRoles("admin", "escrow_manager"),
  validate(fundSchema),
  escrowController.fund,
);
escrowRouter.post(
  "/:id/release",
  requireIdempotency,
  requireRoles("admin", "escrow_manager"),
  escrowController.release,
);
