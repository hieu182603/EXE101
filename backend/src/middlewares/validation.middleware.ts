import { Request, Response, NextFunction } from "express";
import { ZodSchema, ZodError, ZodIssue } from "zod";
import { ValidationException } from "@/exceptions/http-exceptions";

/**
 * Middleware to validate request body using Zod schema
 * @param schema - Zod schema to validate against
 */
export const validate = (schema: ZodSchema) => {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      const validated = schema.parse(req.body);
      req.body = validated; // Replace with validated data
      next();
    } catch (error: unknown) {
      if (error instanceof ZodError) {
        const errors = error.issues.map((err: ZodIssue) => ({
          field: err.path.join("."),
          message: err.message,
        }));
        
        throw new ValidationException(
          "Validation failed",
          errors.map((e: { field: string; message: string }) => `${e.field}: ${e.message}`).join(", ")
        );
      }
      next(error);
    }
  };
};

/**
 * Middleware to validate request query parameters using Zod schema
 * @param schema - Zod schema to validate against
 */
export const validateQuery = (schema: ZodSchema) => {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      const validated = schema.parse(req.query);
      req.query = validated as any;
      next();
    } catch (error: unknown) {
      if (error instanceof ZodError) {
        const errors = error.issues.map((err: ZodIssue) => ({
          field: err.path.join("."),
          message: err.message,
        }));
        
        throw new ValidationException(
          "Query validation failed",
          errors.map((e: { field: string; message: string }) => `${e.field}: ${e.message}`).join(", ")
        );
      }
      next(error);
    }
  };
};

/**
 * Middleware to validate request params using Zod schema
 * @param schema - Zod schema to validate against
 */
export const validateParams = (schema: ZodSchema) => {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      const validated = schema.parse(req.params);
      req.params = validated as any;
      next();
    } catch (error: unknown) {
      if (error instanceof ZodError) {
        const errors = error.issues.map((err: ZodIssue) => ({
          field: err.path.join("."),
          message: err.message,
        }));
        
        throw new ValidationException(
          "Params validation failed",
          errors.map((e: { field: string; message: string }) => `${e.field}: ${e.message}`).join(", ")
        );
      }
      next(error);
    }
  };
};

