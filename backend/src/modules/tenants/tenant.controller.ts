import type { Request, Response } from "express";

export const tenantController = {
  getTenant: async (req: Request, res: Response) => {
    res.json({ id: req.params.id, name: "Demo Tenant" });
  },
  updateTenant: async (req: Request, res: Response) => {
    res.json({ id: req.params.id, ...req.body });
  },
  inviteUser: async (_req: Request, res: Response) => {
    res.status(202).json({ status: "invitation queued" });
  },
};
