import { Request, Response, NextFunction } from "express";
import { ForbiddenException } from "@/exceptions/http-exceptions";
import { defineAbilityFor, Actions } from "./ability.factory";
import { ForbiddenError } from "@casl/ability";

/**
 * Middleware to check user permissions using CASL
 * @param action - The action to check (read, create, update, delete)
 * @param subject - The subject/entity class to check permissions for
 */
export const checkAbility = (action: Actions, subject: any) => {
  return (req: Request & { user?: any }, res: Response, next: NextFunction) => {
    try {
      if (!req.user) {
        throw new Error("User not found in request");
      }

      const user = req.user;
      const ability = defineAbilityFor(user.role?.name || "customer", user);

      // Try to find subject instance in request body or params, otherwise use the class
      let subjectInstance = subject;
      if (req.body && typeof req.body === "object") {
        // Check if body contains an instance of the subject
        subjectInstance = subject;
      }

      try {
        ForbiddenError.from(ability).throwUnlessCan(action, subjectInstance);
        next();
      } catch (err) {
        if (err instanceof ForbiddenError) {
          throw new ForbiddenException("You do not have permission to perform this action.");
        }
        throw err;
      }
    } catch (error) {
      next(error);
    }
  };
};








