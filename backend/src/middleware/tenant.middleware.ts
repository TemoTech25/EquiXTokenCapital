import type { Request, Response, NextFunction } from "express";
import { loadEnv } from "../config/env";

const env = loadEnv();

export const tenantMiddleware = (req: Request, _res: Response, next: NextFunction) => {
  const headerTenant = req.header("x-tenant-id") ?? req.header("x-tenant") ?? req.user?.tenantId;
  req.tenant = {
    id: headerTenant ?? "default-tenant",
    network: env.HEDERA_NETWORK,
  };
  next();
};
