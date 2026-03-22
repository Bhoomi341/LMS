import type { Pool, ResultSetHeader } from "mysql2/promise";

export class EnrollmentsRepository {
  constructor(private pool: Pool) {}

  async ensureEnrollment(userId: number, subjectId: number): Promise<void> {
    await this.pool.execute<ResultSetHeader>(
      `INSERT IGNORE INTO enrollments (user_id, subject_id) VALUES (:userId, :subjectId)`,
      { userId, subjectId }
    );
  }

  async isEnrolled(userId: number, subjectId: number): Promise<boolean> {
    const [rows] = await this.pool.query<{ c: number }[]>(
      `SELECT COUNT(*) AS c FROM enrollments WHERE user_id = :userId AND subject_id = :subjectId`,
      { userId, subjectId }
    );
    return Number(rows[0]?.c ?? 0) > 0;
  }
}
