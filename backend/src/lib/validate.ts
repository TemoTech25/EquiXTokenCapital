import { type Request, type Response, type NextFunction } from "express";
import type { ZodSchema } from "zod";

export const validate = (schema: ZodSchema) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const result = schema.safeParse(req.body);
    if (!result.success) {
      return res.status(422).json({ code: "VALIDATION_ERROR", errors: result.error.flatten().fieldErrors });
    }
    req.body = result.data;
    next();
  };
};
