import { Router } from "express";
import { z } from "zod";
import { loginHandler, refreshHandler, meHandler } from "./auth.controller";
import { validate } from "../../lib/validate";
import { authMiddleware } from "./auth.middleware";

const loginSchema = z.object({ email: z.string().email(), password: z.string().min(8) });
const refreshSchema = z.object({ refreshToken: z.string() });

export const authRouter = Router();

authRouter.post("/login", validate(loginSchema), loginHandler);
authRouter.post("/refresh", validate(refreshSchema), refreshHandler);
authRouter.get("/me", authMiddleware, meHandler);
