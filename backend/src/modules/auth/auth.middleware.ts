import type { Request, Response, NextFunction } from "express";
import { verifyJwt } from "../../lib/jwt";
import { loadEnv } from "../../config/env";

const env = loadEnv();

export const authMiddleware = (req: Request, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith("Bearer ")) {
    if (env.AUTH_DEV_BYPASS) {
      const devUserId = req.header("x-dev-user-id") ?? env.AUTH_DEV_USER_ID ?? "dev-user";
      const devTenantId = req.header("x-tenant-id") ?? env.AUTH_DEV_TENANT_ID ?? "default-tenant";
      const devRole = req.header("x-dev-role") ?? env.AUTH_DEV_ROLE ?? "admin";
      (req as any).user = {
        sub: devUserId,
        tenantId: devTenantId,
        role: devRole,
      };
      return next();
    }
    return res.status(401).json({ code: "UNAUTHENTICATED", message: "Missing token" });
  }
  try {
    const payload = verifyJwt(authHeader.substring(7));
    (req as any).user = payload;
    next();
  } catch (err) {
    return res.status(401).json({ code: "UNAUTHENTICATED", message: "Invalid token" });
  }
};
