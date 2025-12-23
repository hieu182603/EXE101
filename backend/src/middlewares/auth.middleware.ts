import { Request, Response, NextFunction } from "express";
import { Container, Service } from "typedi";
import { JwtService } from "../jwt/jwt.service";
import { AccountDetailsDto } from "@/auth/dtos/account.dto";
import { HttpException } from "@/exceptions/http-exceptions";
import { HttpMessages } from "@/exceptions/http-messages.constant";

interface RequestWithUser extends Request {
  user?: AccountDetailsDto;
}

/**
 * Express middleware for authentication
 * Verifies JWT token and attaches user to request
 */
export const Auth = (req: RequestWithUser, res: Response, next: NextFunction): any => {
  const jwtService = Container.get(JwtService);
  const authHeader = req.header("Authorization") || req.headers.authorization;

  if (!authHeader) {
    return next(new HttpException(401, HttpMessages._UNAUTHORIZED));
  }
  
  // Extract token from "Bearer [token]" format
  const token = authHeader.startsWith('Bearer ') ? authHeader.substring(7) : authHeader;
  
  try {
    const payload = jwtService.verifyAccessToken(token) as AccountDetailsDto | null;
    if (!payload) {
      return next(new HttpException(401, HttpMessages._UNAUTHORIZED));
    }
    req.user = payload;
    return next();
  } catch (err) {
    console.error("JWT verification error:", err);
    return next(new HttpException(401, HttpMessages._UNAUTHORIZED));
  }
};

/**
 * Express middleware for admin authorization
 * Verifies JWT token and checks if user is admin
 */
export const Admin = (req: RequestWithUser, res: Response, next: NextFunction): any => {
  const jwtService = Container.get(JwtService);
  const authHeader = req.header("Authorization") || req.headers.authorization;

  let user: AccountDetailsDto;

  if (!authHeader) {
    return next(new HttpException(401, HttpMessages._UNAUTHORIZED));
  }

  // Extract token from "Bearer [token]" format
  const token = authHeader.startsWith('Bearer ') ? authHeader.substring(7) : authHeader;

  try {
    user = jwtService.verifyAccessToken(token) as AccountDetailsDto;
    if (!user) {
      return next(new HttpException(401, HttpMessages._UNAUTHORIZED));
    }
    req.user = user;
  } catch (err) {
    console.error("JWT verification error:", err);
    return next(new HttpException(401, HttpMessages._UNAUTHORIZED));
  }
  
  if (!user || !user.role || !user.role.name) {
    return next(new HttpException(403, "Forbidden"));
  }
  if (user.role.name !== "admin") {
    return next(new HttpException(403, "Forbidden"));
  }
  return next();
};

// Export class-based versions for backward compatibility if needed
@Service()
export class AuthMiddleware {
  constructor(private readonly jwtService: JwtService) {}

  use(req: RequestWithUser, res: Response, next: NextFunction): any {
    return Auth(req, res, next);
  }
}

@Service()
export class AdminMiddleware {
  constructor(private readonly jwtService: JwtService) {}

  use(req: RequestWithUser, res: Response, next: NextFunction): any {
    return Admin(req, res, next);
  }
}
