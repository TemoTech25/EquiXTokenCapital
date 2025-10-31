import type { Request, Response } from "express";
import { randomUUID } from "crypto";
import { signJwt, verifyJwt } from "../../lib/jwt";
import { loadEnv } from "../../config/env";
import { redis } from "../../lib/redis";
import { authenticateUser, buildJwtPayload, getUserById } from "./auth.service";
import { badRequest, unauthorized } from "../../lib/errors";

const env = loadEnv();
const refreshKey = (token: string) => `auth:refresh:${token}`;

export const loginHandler = async (req: Request, res: Response) => {
  const tenantId = req.tenant?.id;
  if (!tenantId) {
    throw badRequest("TENANT_REQUIRED", "Tenant context missing. Provide X-Tenant-Id header.");
  }

  const { email, password } = req.body as { email: string; password: string };
  const user = await authenticateUser(tenantId, email, password);
  if (!user) {
    throw unauthorized("Invalid credentials");
  }

  const payload = buildJwtPayload(user);
  const accessToken = signJwt(payload, "15m");
  const refreshToken = randomUUID();
  await redis.set(refreshKey(refreshToken), JSON.stringify(payload), "EX", env.REFRESH_TOKEN_TTL_SECONDS);

  res.json({
    accessToken,
    refreshToken,
    user: {
      id: user.id,
      email: user.email,
      role: user.role,
      tenantId: user.tenantId,
    },
  });
};

export const refreshHandler = async (req: Request, res: Response) => {
  const { refreshToken } = req.body as { refreshToken: string };
  if (!refreshToken) {
    throw badRequest("REFRESH_TOKEN_REQUIRED", "Refresh token required");
  }
  const raw = await redis.get(refreshKey(refreshToken));
  if (!raw) {
    throw unauthorized("Refresh token invalid or expired");
  }
  await redis.del(refreshKey(refreshToken));
  const payload = JSON.parse(raw);
  const accessToken = signJwt(payload, "15m");
  const newRefreshToken = randomUUID();
  await redis.set(refreshKey(newRefreshToken), raw, "EX", env.REFRESH_TOKEN_TTL_SECONDS);
  res.json({ accessToken, refreshToken: newRefreshToken });
};

export const meHandler = async (req: Request, res: Response) => {
  if (!req.user) {
    throw unauthorized();
  }
  const user = await getUserById(req.user.sub);
  if (!user) {
    throw unauthorized();
  }
  res.json({
    user: {
      id: user.id,
      email: user.email,
      role: user.role,
      tenantId: user.tenantId,
    },
  });
};
