import jwt, { type SignOptions, type Secret } from "jsonwebtoken";
import { loadEnv } from "../config/env";

const env = loadEnv();

export type JwtPayload = {
  sub: string;
  tenantId: string;
  role: string;
  accountId?: string;
  publicKey?: string;
};

const secret: Secret = env.JWT_SECRET;

export const signJwt = (payload: JwtPayload, expiresIn: string | number = "15m") => {
  const options: SignOptions = {
    algorithm: "HS256",
  };
  (options as { expiresIn?: string | number }).expiresIn = expiresIn;
  return jwt.sign(payload, secret, options);
};

export const verifyJwt = <T = JwtPayload>(token: string): T => {
  return jwt.verify(token, secret) as T;
};
