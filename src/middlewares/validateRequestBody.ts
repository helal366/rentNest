import { NextFunction, Request, Response } from "express";
import { z } from "zod";

// Use z.ZodObject<any> to match the Zod v4 structure perfectly
export const validateRequestBody = (schema: z.ZodTypeAny) => {
  return async (
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      const parsed = await schema.parseAsync({
        body: req.body,
      });

      // 2. Safely override req.body with the type-cast validated inputs
      req.body = (parsed as any).body;

      next();
    } catch (error) {
      next(error);
    }
  };
};
