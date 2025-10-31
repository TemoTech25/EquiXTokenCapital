import { Router } from "express";
import { z } from "zod";
import { authMiddleware } from "../auth/auth.middleware";
import { tenantController } from "./tenant.controller";
import { validate } from "../../lib/validate";

const updateSchema = z.object({ name: z.string().optional(), themeJson: z.any().optional() });

export const tenantRouter = Router();

tenantRouter.use(authMiddleware);

tenantRouter.get("/:id", tenantController.getTenant);
tenantRouter.patch("/:id", validate(updateSchema), tenantController.updateTenant);
tenantRouter.post("/:id/invite", tenantController.inviteUser);
