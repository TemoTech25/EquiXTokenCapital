import type { Request, Response, NextFunction } from "express";
import { forbidden, unauthorized } from "../lib/errors";

export const requireRoles = (...roles: string[]) => {
  return (req: Request, _res: Response, next: NextFunction) => {
    if (!req.user) {
      return next(unauthorized());
    }
    if (roles.length && !roles.includes(req.user.role)) {
      return next(forbidden("Insufficient permissions"));
    }
    next();
  };
};
