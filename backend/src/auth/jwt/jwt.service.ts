import { Service } from "typedi";
import { AccountDetailsDto } from "../dtos/account.dto";
import jwt, { JwtPayload } from "jsonwebtoken";
import { RefreshToken } from "./refreshToken.entity";
import { Account } from "../account/account.entity";
import { AccountNotFoundException } from "@/exceptions/http-exceptions";

const JWT_SECRET = process.env.JWT_SECRET || "default-dev-jwt-secret-change-in-production";
const REFRESH_TOKEN_SECRET = process.env.REFRESH_TOKEN_SECRET || "default-dev-refresh-secret-change-in-production";

// Log warning if using default secrets
if (!process.env.JWT_SECRET || !process.env.REFRESH_TOKEN_SECRET) {
  console.warn("⚠️ WARNING: Using default JWT secrets. Please set JWT_SECRET and REFRESH_TOKEN_SECRET environment variables in production!");
}

@Service()
export class JwtService {

  private accountToPayload(account: Account): AccountDetailsDto{
    return {
      username: account.username,
      phone: account.phone || "01234567878989", // Use actual phone or fallback
      role: account.role,
    };
  }

  generateAccessToken(account: Account): string {
    const payload = this.accountToPayload(account);
    return jwt.sign(payload, JWT_SECRET, { expiresIn: "1d" });
  }

  async generateRefreshToken(account: Account): Promise<string> {
    const payload = this.accountToPayload(account);
    const token = jwt.sign(payload, REFRESH_TOKEN_SECRET, { expiresIn: "7d" });
    const oldRefreshToken = await RefreshToken.find({
      where: {
        account,
      },
    });
    if (oldRefreshToken.length > 0) {
      await Promise.all(oldRefreshToken.map((t) => t.softRemove()));
    }
    const refreshToken = new RefreshToken();
    refreshToken.token = token;
    refreshToken.account = account;
    refreshToken.expiredAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
    await refreshToken.save();
    return token;
  }

  async verifyRefreshToken(token: string): Promise<RefreshToken | null> {
    try {
      const decoded = jwt.verify(token, REFRESH_TOKEN_SECRET) as {
        username: string;
      };
      const account = await Account.findOne({
        where: {
          username: decoded.username
        }
      });
      if(!account) throw new AccountNotFoundException;
      const refreshToken = await RefreshToken.findOne({
        where: {
          token,
          account,
        },
      });
      if (!refreshToken) return null;
      if (refreshToken.expiredAt < new Date()) {
        await refreshToken.softRemove();
        return null;
      }
      return refreshToken;
    } catch (error) {
      console.error("Refresh token verification failed:", error);
      return null;
    }
  }

  verifyAccessToken(token: string): JwtPayload | null {
    try {
      return jwt.verify(token, JWT_SECRET) as JwtPayload;
    } catch (error) {
      console.error("Access token verification failed:", error);
      return null;
    }
  }

  //use on logouts
  async revokeRefreshToken(token: string): Promise<RefreshToken | null> {
    const refreshToken = await this.verifyRefreshToken(token);
    if (!refreshToken) return null;
    await refreshToken.softRemove();
    return refreshToken;
  }

  async refreshAccessToken(token: string): Promise<string | null> {
    const refreshToken = await RefreshToken.findOne({
      where: {
        token
      }
    });
    if(!refreshToken || refreshToken.expiredAt < new Date()){
      if(refreshToken) await refreshToken.softRemove()
      return null;
    }
    const account = refreshToken.account;
    return this.generateAccessToken(account);
  }

  async getRefreshToken(account: Account): Promise<RefreshToken | null>{
    return await RefreshToken.findOne({
      where: {
        account
      },
    });
  }
}
