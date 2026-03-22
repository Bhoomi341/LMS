import jwt from "jsonwebtoken";
import { ACCESS_TOKEN_TTL_SEC, env } from "../config/env.js";

export type AccessPayload = { sub: number; email: string; typ: "access" };

export function signAccessToken(userId: number, email: string): string {
  const payload: AccessPayload = { sub: userId, email, typ: "access" };
  return jwt.sign(payload, env.jwtAccessSecret, { expiresIn: ACCESS_TOKEN_TTL_SEC });
}

export function verifyAccessToken(token: string): AccessPayload {
  const decoded = jwt.verify(token, env.jwtAccessSecret) as AccessPayload;
  if (decoded.typ !== "access") throw new Error("Invalid access token");
  return decoded;
}

export type RefreshPayload = { sub: number; typ: "refresh" };

export function signRefreshToken(userId: number): string {
  const payload: RefreshPayload = { sub: userId, typ: "refresh" };
  return jwt.sign(payload, env.jwtRefreshSecret, { expiresIn: "30d" });
}

export function verifyRefreshToken(token: string): RefreshPayload {
  const decoded = jwt.verify(token, env.jwtRefreshSecret) as RefreshPayload;
  if (decoded.typ !== "refresh") throw new Error("Invalid refresh token");
  return decoded;
}
