import Redis from "ioredis";
import { loadEnv } from "../config/env";

const env = loadEnv();

export const redis = new Redis(env.REDIS_URL, {
  maxRetriesPerRequest: null,
  enableReadyCheck: false,
});

redis.on("error", (err) => {
  // eslint-disable-next-line no-console
  console.error("Redis error", err);
});
