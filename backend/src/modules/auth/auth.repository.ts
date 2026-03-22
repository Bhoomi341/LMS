import type { Pool, RowDataPacket } from "mysql2/promise";

type RefreshRow = RowDataPacket & {
  id: number;
  user_id: number;
  token_hash: string;
  expires_at: Date;
  revoked_at: Date | null;
};

export class AuthRepository {
  constructor(private pool: Pool) {}

  async insertRefreshToken(input: {
    userId: number;
    tokenHash: string;
    expiresAt: Date;
  }): Promise<void> {
    await this.pool.execute(
      `INSERT INTO refresh_tokens (user_id, token_hash, expires_at) VALUES (:userId, :tokenHash, :expiresAt)`,
      {
        userId: input.userId,
        tokenHash: input.tokenHash,
        expiresAt: input.expiresAt,
      }
    );
  }

  async findValidByHash(tokenHash: string): Promise<RefreshRow | null> {
    const [rows] = await this.pool.query<RefreshRow[]>(
      `SELECT id, user_id, token_hash, expires_at, revoked_at FROM refresh_tokens
       WHERE token_hash = :tokenHash AND revoked_at IS NULL AND expires_at > NOW()
       LIMIT 1`,
      { tokenHash }
    );
    return rows[0] ?? null;
  }

  async revokeByHash(tokenHash: string): Promise<void> {
    await this.pool.execute(
      `UPDATE refresh_tokens SET revoked_at = NOW() WHERE token_hash = :tokenHash AND revoked_at IS NULL`,
      { tokenHash }
    );
  }

  async revokeAllForUser(userId: number): Promise<void> {
    await this.pool.execute(
      `UPDATE refresh_tokens SET revoked_at = NOW() WHERE user_id = :userId AND revoked_at IS NULL`,
      { userId }
    );
  }
}
