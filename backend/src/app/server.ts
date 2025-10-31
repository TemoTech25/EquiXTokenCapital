import express, { type Request, type Response, type NextFunction } from "express";
import cors from "cors";
import helmet from "helmet";
import { loadEnv } from "../config/env";
import { createLogger } from "../lib/logger";
import { registerRoutes } from "../routes";
import { requestContextMiddleware } from "../lib/request-context";
import { tenantMiddleware } from "../middleware/tenant.middleware";
import { HttpError } from "../lib/errors";

export const createApp = () => {
  const env = loadEnv();
  const app = express();
  const logger = createLogger();

  app.use(express.json({ limit: "10mb" }));
  app.use(express.urlencoded({ extended: true }));
  app.use(cors({ origin: true, credentials: true }));
  app.use(helmet({ crossOriginResourcePolicy: false }));
  app.use(requestContextMiddleware(logger));
  app.use(tenantMiddleware);

  registerRoutes(app);

  app.use((err: unknown, _req: Request, res: Response, _next: NextFunction) => {
    if (err instanceof HttpError) {
      logger.warn({ err }, "Handled error");
      return res.status(err.status).json({ code: err.code, message: err.message });
    }
    logger.error({ err }, "Unhandled error");
    res.status(500).json({ code: "INTERNAL_ERROR", message: (err as Error)?.message ?? "Internal server error" });
  });

  app.get("/health", (_req, res) => res.json({ status: "ok", env: env.NODE_ENV }));

  return app;
};
