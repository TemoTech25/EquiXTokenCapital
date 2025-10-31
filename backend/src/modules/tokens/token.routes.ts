import { Router } from "express";
import { z } from "zod";
import { authMiddleware } from "../auth/auth.middleware";
import { tokenController } from "./token.controller";
import { validate } from "../../lib/validate";
import { requireIdempotency } from "../../lib/idempotency";
import { requireRoles } from "../../middleware/rbac.middleware";

export const tokenRouter = Router();

tokenRouter.use(authMiddleware);

const rulesSchema = z.object({
  whitelist: z.array(z.string()).default([]),
  transferRestrictions: z.array(z.string()).default([]),
  holdingLimitPercent: z.number().optional(),
  feeSplitsBps: z.array(z.object({ entity: z.string(), bps: z.number().min(0).max(10000) })).optional(),
});

const spvSchema = z.object({
  name: z.string().min(3),
  registrationNumber: z.string().min(3),
  jurisdiction: z.string().min(2),
  shareClass: z.string().min(1),
});

const createSchema = z
  .object({
    name: z.string().min(3),
    description: z.string().optional(),
    symbol: z
      .string()
      .min(2)
      .max(12)
      .regex(/^[A-Z0-9-_]+$/, "Symbol must be uppercase alphanumeric"),
    type: z.enum(["FT", "NFT"]),
    decimals: z.number().int().nonnegative().optional(),
    associatedCaseId: z.string().optional(),
    rules: rulesSchema,
    spv: spvSchema,
    holders: z.array(z.object({ wallet: z.string(), amount: z.number().nonnegative() })).optional(),
    complianceFlags: z
      .array(
        z.object({
          id: z.string(),
          label: z.string(),
          severity: z.enum(["info", "warning", "critical"]).default("info"),
          description: z.string().optional(),
          resolved: z.boolean().default(false),
        }),
      )
      .optional(),
  })
  .refine((data) => data.type === "NFT" || data.decimals !== undefined, {
    message: "Decimals required for fungible tokens",
    path: ["decimals"],
  });

const mintSchema = z
  .object({
    amount: z.string().regex(/^\d+$/, "amount must be numeric").optional(),
    metadata: z.array(z.string()).optional(),
  })
  .refine((data) => data.amount || data.metadata, {
    message: "Provide amount for FT or metadata array for NFT",
    path: ["amount"],
  });

tokenRouter.get("/", tokenController.list);
tokenRouter.get("/:id", tokenController.detail);
tokenRouter.post("/", requireIdempotency, requireRoles("admin", "token_admin"), validate(createSchema), tokenController.create);
tokenRouter.post(
  "/:id/mint",
  requireIdempotency,
  requireRoles("admin", "token_admin"),
  validate(mintSchema),
  tokenController.mint,
);
tokenRouter.patch(
  "/:id/status",
  requireIdempotency,
  requireRoles("admin", "token_admin"),
  validate(z.object({ status: z.string().min(2) })),
  tokenController.updateStatus,
);
