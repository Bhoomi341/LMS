import type { Pool, ResultSetHeader, RowDataPacket } from "mysql2/promise";

export type ProgressRow = RowDataPacket & {
  id: number;
  user_id: number;
  video_id: number;
  last_position_seconds: number;
  is_completed: number;
  completed_at: Date | null;
};

export class ProgressRepository {
  constructor(private pool: Pool) {}

  async get(userId: number, videoId: number): Promise<ProgressRow | null> {
    const [rows] = await this.pool.query<ProgressRow[]>(
      `SELECT id, user_id, video_id, last_position_seconds, is_completed, completed_at
       FROM video_progress WHERE user_id = :userId AND video_id = :videoId LIMIT 1`,
      { userId, videoId }
    );
    return rows[0] ?? null;
  }

  async saveProgress(input: {
    userId: number;
    videoId: number;
    lastPositionSeconds: number;
    isCompleted: boolean;
  }): Promise<void> {
    const completedAt = input.isCompleted ? new Date() : null;
    await this.pool.execute<ResultSetHeader>(
      `INSERT INTO video_progress (user_id, video_id, last_position_seconds, is_completed, completed_at)
       VALUES (:userId, :videoId, :lastPosition, :isCompleted, :completedAt)
       ON DUPLICATE KEY UPDATE
         last_position_seconds = VALUES(last_position_seconds),
         is_completed = GREATEST(is_completed, VALUES(is_completed)),
         completed_at = CASE
           WHEN GREATEST(is_completed, VALUES(is_completed)) = 1 THEN COALESCE(completed_at, VALUES(completed_at))
           ELSE completed_at
         END`,
      {
        userId: input.userId,
        videoId: input.videoId,
        lastPosition: Math.max(0, Math.floor(input.lastPositionSeconds)),
        isCompleted: input.isCompleted ? 1 : 0,
        completedAt,
      }
    );
  }

  async listForSubject(userId: number, subjectId: number): Promise<ProgressRow[]> {
    const [rows] = await this.pool.query<ProgressRow[]>(
      `SELECT vp.id, vp.user_id, vp.video_id, vp.last_position_seconds, vp.is_completed, vp.completed_at
       FROM video_progress vp
       INNER JOIN videos v ON v.id = vp.video_id
       INNER JOIN sections s ON s.id = v.section_id
       WHERE vp.user_id = :userId AND s.subject_id = :subjectId`,
      { userId, subjectId }
    );
    return rows;
  }

  async getCompletedSet(userId: number, videoIds: number[]): Promise<Set<number>> {
    if (videoIds.length === 0) return new Set();
    const placeholders = videoIds.map(() => "?").join(", ");
    const [rows] = await this.pool.query<(RowDataPacket & { video_id: number })[]>(
      `SELECT video_id FROM video_progress
       WHERE user_id = ? AND is_completed = 1 AND video_id IN (${placeholders})`,
      [userId, ...videoIds]
    );
    return new Set(rows.map((r) => r.video_id));
  }
}
