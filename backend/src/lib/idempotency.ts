import type { Request, Response, NextFunction } from "express";
import { redis } from "./redis";
import { loadEnv } from "../config/env";

const env = loadEnv();

const keyPrefix = "idem:";

export const requireIdempotency = async (req: Request, res: Response, next: NextFunction) => {
  const key = req.header("Idempotency-Key");
  if (!key) {
    return res.status(400).json({ code: "IDEMPOTENCY_KEY_REQUIRED", message: "Provide Idempotency-Key header" });
  }
  const redisKey = `${keyPrefix}${key}`;
  const exists = await redis.set(redisKey, "1", "EX", env.IDEMPOTENCY_TTL_SECONDS, "NX");
  if (!exists) {
    return res.status(409).json({ code: "IDEMPOTENT_REPLAY", message: "Duplicate request" });
  }
  res.on("finish", () => {
    if (res.statusCode >= 400) {
      void redis.del(redisKey);
    }
  });
  next();
};
