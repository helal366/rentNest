import { NextFunction, Request, Response } from "express";
import { StatusCodes } from "http-status-codes";
import { Prisma } from "../../generated/prisma/client";
import { envVars } from "../config";
import { AppError } from "./globalErrorHelper";

export const globalErrorHandler = (
  error: unknown,
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  let statusCode = StatusCodes.INTERNAL_SERVER_ERROR;
  let message = "Something went wrong";
  let details: any = null;

  // ✅ Handle AppError FIRST
  if (error instanceof AppError) {
    statusCode = error.statusCode;
    message = error.message;
  }

  // ✅ Prisma Errors
  else if (error instanceof Prisma.PrismaClientValidationError) {
    statusCode = StatusCodes.BAD_REQUEST;
    message = "Missing or invalid fields.";
  } else if (error instanceof Prisma.PrismaClientKnownRequestError) {
    statusCode = StatusCodes.BAD_REQUEST;

    switch (error.code) {
      case "P2002":
        const target = (error.meta?.target as string[])?.join(", ");
        message = `Duplicate value for field(s): ${target}`;
        break;

      case "P2003":
        message = `Invalid foreign key: ${error.meta?.field_name}`;
        break;

      case "P2025":
        message = "Resource not found.";
        statusCode = StatusCodes.NOT_FOUND;
        break;

      default:
        message = "Database error occurred.";
    }

    details = error.meta;
  } else if (error instanceof Prisma.PrismaClientInitializationError) {
    statusCode = StatusCodes.SERVICE_UNAVAILABLE;
    message = "Database connection failed.";
  } else if (error instanceof Prisma.PrismaClientUnknownRequestError) {
    message = "Unexpected database error.";
  }

  // ✅ JSON error
  else if (error instanceof SyntaxError) {
    statusCode = StatusCodes.BAD_REQUEST;
    message = "Invalid JSON format.";
  }

  // ✅ Unknown error fallback
  else if (error instanceof Error) {
    message = error.message;
  }

  // 🔥 DEV vs PROD response
  if (envVars.NODE_ENV === "development") {
    return res.status(statusCode).json({
      success: false,
      statusCode,
      message,
      details,
      stack: (error as Error)?.stack,
      error,
    });
  }

  // 🚀 PRODUCTION SAFE RESPONSE
  return res.status(statusCode).json({
    success: false,
    statusCode,
    message,
  });
};
