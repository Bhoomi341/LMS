import type { NextFunction, Request, Response } from "express";
import { AppError } from "../utils/AppError.js";

export function errorMiddleware(
  err: unknown,
  _req: Request,
  res: Response,
  _next: NextFunction
): void {
  if (err instanceof AppError) {
    res.status(err.statusCode).json({
      error: err.message,
      code: err.code,
    });
    return;
  }

  console.error(err);
  res.status(500).json({ error: "Internal server error" });
}
