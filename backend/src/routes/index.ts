import type { Express } from "express";
import { authRouter } from "../modules/auth/auth.routes";
import { tenantRouter } from "../modules/tenants/tenant.routes";
import { caseRouter } from "../modules/cases/case.routes";
import { documentRouter } from "../modules/documents/document.routes";
import { escrowRouter } from "../modules/escrow/escrow.routes";
import { tokenRouter } from "../modules/tokens/token.routes";
import { marketplaceRouter } from "../modules/marketplace/marketplace.routes";
import { walletRouter } from "../modules/wallet/hashpack.routes";

export const registerRoutes = (app: Express) => {
  app.use("/api/v1/auth", authRouter);
  app.use("/api/v1/tenants", tenantRouter);
  app.use("/api/v1/cases", caseRouter);
  app.use("/api/v1/documents", documentRouter);
  app.use("/api/v1/escrows", escrowRouter);
  app.use("/api/v1/tokens", tokenRouter);
  app.use("/api/v1/offerings", marketplaceRouter);
  app.use("/api/v1/wallet", walletRouter);
};
