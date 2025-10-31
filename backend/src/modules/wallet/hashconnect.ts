import crypto from "crypto";
import { redis } from "../../lib/redis";

const PAIRING_TTL_SECONDS = 300; // 5 minutes

const pairingKey = (topic: string) => `wallet:pairing:${topic}`;

export type StoredPairing = {
  tenantId: string;
  pairingString: string;
  expiresAt: number;
};

export const generatePairing = async (tenantId: string) => {
  const topic = crypto.randomUUID();
  const pairingString = crypto.randomBytes(24).toString("hex");
  const expiresAt = Date.now() + PAIRING_TTL_SECONDS * 1000;

  const stored: StoredPairing = { tenantId, pairingString, expiresAt };
  await redis.set(pairingKey(topic), JSON.stringify(stored), "EX", PAIRING_TTL_SECONDS);

  return {
    topic,
    pairingString,
    expiresAt: new Date(expiresAt).toISOString(),
  };
};

export const consumePairing = async (topic: string) => {
  const raw = await redis.get(pairingKey(topic));
  if (!raw) return null;
  await redis.del(pairingKey(topic));
  return JSON.parse(raw) as StoredPairing;
};
