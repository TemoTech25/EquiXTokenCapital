import type { JwtPayload } from "../lib/jwt";

declare global {
  namespace Express {
    interface Request {
      user?: JwtPayload;
      tenant?: {
        id: string;
        network: string;
      };
      log?: import("pino").Logger;
    }
  }
}
