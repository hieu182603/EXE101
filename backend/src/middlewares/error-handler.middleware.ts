import { Request, Response, NextFunction } from "express";
import { HttpException, BaseException, ValidationException } from "@/exceptions/http-exceptions";
import { HttpMessages } from "@/exceptions/http-messages.constant";
import { JsonWebTokenError } from "jsonwebtoken";
import { instanceToPlain } from "class-transformer";

/**
 * Express error handler middleware
 * Handles all errors and returns consistent error responses
 */
export const errorHandler = (
  error: any,
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  if (res.headersSent) {
    return next(error);
  }

  console.log("");
  console.log("🔴 ERROR HANDLER TRIGGERED");
  console.log("Error object:", error);
  console.log("Error message:", error.message);
  console.log("Error type:", error.constructor?.name);

  let status: number = error.httpCode || error.status || 500;
  let message: string | string[] = error.message || "Something went wrong";

  // Handle BaseException instances (includes ValidationException)
  if (error instanceof BaseException) {
    status = error.status;
    message = error.userMessage || error.message;
  }
  // Handle HttpException instances
  else if (error instanceof HttpException) {
    status = error.httpCode;
    message = error.message;
  }

  // Handle JWT errors
  if (error instanceof JsonWebTokenError) {
    status = 401;
    message = HttpMessages._UNAUTHORIZED;
  }

  const parsed = instanceToPlain(error);
  const validatorErrors: string[] = [];

  // Handle validation errors from class-validator
  if (parsed.errors && Array.isArray(parsed.errors) && parsed.errors.length > 0) {
    for (const i of parsed.errors) {
      const keys = Object.keys(i.constraints || {});
      if (keys.length > 0) {
        validatorErrors.push(i.constraints[keys[0]]);
      }
    }
    if (validatorErrors.length > 0) {
      message = validatorErrors;
    }
  }

  // Log full error details for debugging
  if (status === 400) {
    console.log("📋 Full error details:", JSON.stringify(parsed, null, 2));
  }

  const response = {
    success: false,
    statusCode: status,
    message: Array.isArray(message) ? message[0] : message,
    errors: Array.isArray(message) ? message : undefined,
  };

  res.status(status).json(response);
};
