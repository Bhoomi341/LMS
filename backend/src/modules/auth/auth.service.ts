import type { Response } from "express";
import jwt from "jsonwebtoken";
import { REFRESH_TOKEN_TTL_MS, env } from "../../config/env.js";
import { AppError } from "../../utils/AppError.js";
import { hashPassword, verifyPassword } from "../../utils/password.js";
import { signAccessToken, signRefreshToken, verifyRefreshToken } from "../../utils/jwt.js";
import { hashOpaqueToken } from "../../utils/tokenHash.js";
import { AuthRepository } from "./auth.repository.js";
import { UsersRepository } from "../users/users.repository.js";

const REFRESH_COOKIE = "refresh_token";

export class AuthService {
  constructor(
    private usersRepo: UsersRepository,
    private authRepo: AuthRepository
  ) {}

  private setRefreshCookie(res: Response, refreshToken: string, expiresAt: Date): void {
    res.cookie(REFRESH_COOKIE, refreshToken, {
      httpOnly: true,
      secure: env.cookieSecure,
      sameSite: "lax",
      path: "/api/auth",
      expires: expiresAt,
    });
  }

  private clearRefreshCookie(res: Response): void {
    res.clearCookie(REFRESH_COOKIE, {
      httpOnly: true,
      secure: env.cookieSecure,
      sameSite: "lax",
      path: "/api/auth",
    });
  }

  async register(
    body: { email: string; password: string; name: string },
    res: Response
  ): Promise<{ accessToken: string; user: { id: number; email: string; name: string } }> {
    const email = body.email?.trim().toLowerCase();
    const password = body.password ?? "";
    const name = body.name?.trim() ?? "";
    if (!email || !password || !name) {
      throw new AppError(400, "email, password, and name are required");
    }
    if (password.length < 8) {
      throw new AppError(400, "Password must be at least 8 characters");
    }

    const existing = await this.usersRepo.findByEmail(email);
    if (existing) throw new AppError(409, "Email already registered");

    const passwordHash = await hashPassword(password);
    const userId = await this.usersRepo.create({ email, passwordHash, name });

    const accessToken = signAccessToken(userId, email);
    const refreshToken = signRefreshToken(userId);
    const tokenHash = hashOpaqueToken(refreshToken);
    const decoded = jwt.decode(refreshToken) as { exp?: number } | null;
    const expSec = decoded?.exp;
    const expiresAt = expSec
      ? new Date(expSec * 1000)
      : new Date(Date.now() + REFRESH_TOKEN_TTL_MS);

    await this.authRepo.insertRefreshToken({ userId, tokenHash, expiresAt });
    this.setRefreshCookie(res, refreshToken, expiresAt);

    return {
      accessToken,
      user: { id: userId, email, name },
    };
  }

  async login(
    body: { email: string; password: string },
    res: Response
  ): Promise<{ accessToken: string; user: { id: number; email: string; name: string } }> {
    const email = body.email?.trim().toLowerCase();
    const password = body.password ?? "";
    if (!email || !password) {
      throw new AppError(400, "email and password are required");
    }

    const user = await this.usersRepo.findByEmail(email);
    if (!user) throw new AppError(401, "Invalid email or password");

    const ok = await verifyPassword(password, user.password_hash);
    if (!ok) throw new AppError(401, "Invalid email or password");

    const accessToken = signAccessToken(user.id, user.email);
    const refreshToken = signRefreshToken(user.id);
    const tokenHash = hashOpaqueToken(refreshToken);
    const decoded = jwt.decode(refreshToken) as { exp?: number } | null;
    const expSec = decoded?.exp;
    const expiresAt = expSec
      ? new Date(expSec * 1000)
      : new Date(Date.now() + REFRESH_TOKEN_TTL_MS);

    await this.authRepo.insertRefreshToken({ userId: user.id, tokenHash, expiresAt });
    this.setRefreshCookie(res, refreshToken, expiresAt);

    return {
      accessToken,
      user: { id: user.id, email: user.email, name: user.name },
    };
  }

  async refresh(
    refreshTokenCookie: string | undefined,
    res: Response
  ): Promise<{ accessToken: string }> {
    if (!refreshTokenCookie) {
      throw new AppError(401, "Missing refresh token");
    }

    let payload;
    try {
      payload = verifyRefreshToken(refreshTokenCookie);
    } catch {
      throw new AppError(401, "Invalid refresh token");
    }

    const tokenHash = hashOpaqueToken(refreshTokenCookie);
    const row = await this.authRepo.findValidByHash(tokenHash);
    if (!row || row.user_id !== payload.sub) {
      throw new AppError(401, "Refresh token revoked or unknown");
    }

    const user = await this.usersRepo.findById(payload.sub);
    if (!user) throw new AppError(401, "User not found");

    const accessToken = signAccessToken(user.id, user.email);
    return { accessToken };
  }

  async logout(refreshTokenCookie: string | undefined, res: Response): Promise<void> {
    if (refreshTokenCookie) {
      try {
        verifyRefreshToken(refreshTokenCookie);
        const tokenHash = hashOpaqueToken(refreshTokenCookie);
        await this.authRepo.revokeByHash(tokenHash);
      } catch {
        /* ignore invalid token on logout */
      }
    }
    this.clearRefreshCookie(res);
  }

  async me(userId: number): Promise<{ id: number; email: string; name: string }> {
    const user = await this.usersRepo.findById(userId);
    if (!user) throw new AppError(404, "User not found");
    return { id: user.id, email: user.email, name: user.name };
  }
}
