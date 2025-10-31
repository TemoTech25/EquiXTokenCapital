import { PublicKey } from "@hashgraph/sdk";
import { prisma } from "../../db/client";
import type { WalletSessionPayload } from "./hashpack.types";
import type { StoredPairing } from "./hashconnect";

export const verifySignature = (publicKeyHex: string, message: string, signatureBase64: string): boolean => {
  try {
    const publicKey = PublicKey.fromString(publicKeyHex);
    const messageBytes = Buffer.from(message);
    const signatureBytes = Buffer.from(signatureBase64, "base64");
    return publicKey.verify(messageBytes, signatureBytes);
  } catch (err) {
    return false;
  }
};

export const createWalletSession = async (
  tenantId: string,
  userId: string,
  pairing: StoredPairing,
  payload: WalletSessionPayload,
) => {
  await prisma.walletSession.create({
    data: {
      tenantId,
      userId,
      accountId: payload.accountId,
      publicKey: payload.publicKey,
      topic: payload.topic,
    },
  });
};

export const listWalletSessions = async (tenantId: string, userId: string) => {
  return prisma.walletSession.findMany({
    where: { tenantId, userId },
    orderBy: { createdAt: "desc" },
  });
};
