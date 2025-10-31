import { Router } from "express";
import { authMiddleware } from "../auth/auth.middleware";
import { walletController } from "./hashpack.controller";

export const walletRouter = Router();

walletRouter.use(authMiddleware);

walletRouter.post("/init", walletController.init);
walletRouter.post("/session", walletController.session);
walletRouter.get("/me", walletController.me);
