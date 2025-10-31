import type { Request, Response } from "express";
import { z } from "zod";
import { generatePairing, consumePairing } from "./hashconnect";
import { verifySignature, createWalletSession, listWalletSessions } from "./hashpack.service";
import { signJwt } from "../../lib/jwt";
import { forbidden, badRequest } from "../../lib/errors";

const sessionSchema = z.object({
  accountId: z.string().min(3),
  publicKey: z.string().min(10),
  signature: z.string().min(10),
  message: z.string().min(3),
  topic: z.string().uuid(),
});

export const walletController = {
  init: async (req: Request, res: Response) => {
    const tenantId = req.tenant?.id ?? req.user?.tenantId ?? "default-tenant";
    const pairing = await generatePairing(tenantId);
    res.json(pairing);
  },

  session: async (req: Request, res: Response) => {
    const parse = sessionSchema.safeParse(req.body);
    if (!parse.success) {
      return res.status(422).json({ code: "VALIDATION_ERROR", errors: parse.error.flatten().fieldErrors });
    }

    if (!req.user) {
      return res.status(401).json({ code: "UNAUTHENTICATED", message: "Login required" });
    }

    const payload = parse.data;
    const pairing = await consumePairing(payload.topic);
    if (!pairing) {
      throw badRequest("PAIRING_INVALID", "Pairing request expired or invalid.");
    }
    if (pairing.tenantId !== (req.tenant?.id ?? req.user.tenantId)) {
      throw forbidden("Pairing does not belong to this tenant");
    }

    const valid = verifySignature(payload.publicKey, payload.message, payload.signature);
    if (!valid) {
      throw badRequest("SIGNATURE_INVALID", "Invalid signature provided.");
    }

    await createWalletSession(pairing.tenantId, req.user.sub, pairing, payload);

    const accessToken = signJwt({
      sub: req.user.sub,
      tenantId: pairing.tenantId,
      role: req.user.role,
      accountId: payload.accountId,
      publicKey: payload.publicKey,
    });

    res.json({ accessToken });
  },

  me: async (req: Request, res: Response) => {
    if (!req.user) {
      return res.status(401).json({ code: "UNAUTHENTICATED", message: "Login required" });
    }
    const tenantId = req.tenant?.id ?? req.user.tenantId;
    const sessions = await listWalletSessions(tenantId, req.user.sub);
    res.json({ wallets: sessions });
  },
};
