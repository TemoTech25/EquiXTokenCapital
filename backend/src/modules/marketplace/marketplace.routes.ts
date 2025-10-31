import { Router } from "express";
import { authMiddleware } from "../auth/auth.middleware";
import { marketplaceController } from "./marketplace.controller";

export const marketplaceRouter = Router();

marketplaceRouter.use(authMiddleware);

marketplaceRouter.get("/", marketplaceController.list);
marketplaceRouter.get("/:id", marketplaceController.detail);
marketplaceRouter.post("/", marketplaceController.create);
marketplaceRouter.post("/:id/publish", marketplaceController.publish);
marketplaceRouter.post("/:id/invest", marketplaceController.invest);
