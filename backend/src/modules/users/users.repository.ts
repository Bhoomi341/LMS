import type { Pool, ResultSetHeader, RowDataPacket } from "mysql2/promise";

export type UserRow = RowDataPacket & {
  id: number;
  email: string;
  password_hash: string;
  name: string;
  created_at: Date;
  updated_at: Date;
};

export class UsersRepository {
  constructor(private pool: Pool) {}

  async findByEmail(email: string): Promise<UserRow | null> {
    const [rows] = await this.pool.query<UserRow[]>(
      "SELECT id, email, password_hash, name, created_at, updated_at FROM users WHERE email = :email LIMIT 1",
      { email: email.toLowerCase() }
    );
    return rows[0] ?? null;
  }

  async findById(id: number): Promise<Omit<UserRow, "password_hash"> | null> {
    const [rows] = await this.pool.query<
      (RowDataPacket & { id: number; email: string; name: string; created_at: Date; updated_at: Date })[]
    >(
      "SELECT id, email, name, created_at, updated_at FROM users WHERE id = :id LIMIT 1",
      { id }
    );
    return rows[0] ?? null;
  }

  async create(input: { email: string; passwordHash: string; name: string }): Promise<number> {
    const [res] = await this.pool.execute<ResultSetHeader>(
      "INSERT INTO users (email, password_hash, name) VALUES (:email, :passwordHash, :name)",
      {
        email: input.email.toLowerCase(),
        passwordHash: input.passwordHash,
        name: input.name,
      }
    );
    return res.insertId;
  }
}
