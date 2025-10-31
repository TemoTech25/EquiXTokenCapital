import { type Request, type Response, type NextFunction } from "express";
import { randomUUID } from "crypto";
import type pino from "pino";

declare global {
  // eslint-disable-next-line no-var
  var requestContext: Map<string, unknown> | undefined;
}

export const requestContextMiddleware = (logger: pino.Logger) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const requestId = req.headers["x-request-id"]?.toString() ?? randomUUID();
    res.setHeader("x-request-id", requestId);

    req.log = logger.child({ requestId, path: req.path });
    next();
  };
};
