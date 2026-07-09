import { NextFunction, Request, Response } from "express";
import { StatusCodes } from "http-status-codes";
import { AppError } from "./globalErrorHelper.js";
import { envVars } from "../config/index.js";

export const globalErrorHandler = (
  error: unknown,
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  let statusCode = StatusCodes.INTERNAL_SERVER_ERROR;
  let message = "Something went wrong";
  let details: any = null;

  const errorObj = error instanceof Error ? error : new Error("Unknown error");
  const isPrismaKnownError = (
    error: unknown,
  ): error is {
    code: string;
    meta?: Record<string, unknown>;
  } => {
    return typeof error === "object" && error !== null && "code" in error;
  };

  const isPrismaValidationError = (error: unknown): boolean => {
    return (
      typeof error === "object" &&
      error !== null &&
      error.constructor?.name === "PrismaClientValidationError"
    );
  };

  // ✅ Handle AppError FIRST
  if (error instanceof AppError) {
    statusCode = error.statusCode;
    message = error.message;
  }
  // ✅ Known request error
  else if (isPrismaValidationError(error)) {
    statusCode = StatusCodes.BAD_REQUEST;
    message = "Missing or invalid fields.";
  }
  // ✅ Prisma Errors
  else if (isPrismaKnownError(error)) {
    statusCode = StatusCodes.BAD_REQUEST;
    message = "Missing or invalid fields.";
  } else if (isPrismaKnownError(error)) {
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
  } else if (isPrismaKnownError(error)) {
    statusCode = StatusCodes.SERVICE_UNAVAILABLE;
    message = "Database connection failed.";
  } else if (isPrismaKnownError(error)) {
    message = "Unexpected database error.";
  }

  // ✅ JSON error
  else if (error instanceof SyntaxError) {
    statusCode = StatusCodes.BAD_REQUEST;
    message = "Invalid JSON format.";
  }

  // ✅ Generic Error
  else if (error instanceof Error) {
    message = error.message;
  }

  // 🔥 DEV vs PROD
  if (envVars.NODE_ENV === "development") {
    return res.status(statusCode).json({
      success: false,
      statusCode,
      message,
      details,
      stack: errorObj.stack, // ✅ safe now
      error: errorObj,
    });
  }

  return res.status(statusCode).json({
    success: false,
    statusCode,
    message,
  });
};
