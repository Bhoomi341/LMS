import type { Pool, RowDataPacket } from "mysql2/promise";

export type VideoDetailRow = RowDataPacket & {
  id: number;
  section_id: number;
  subject_id: number;
  title: string;
  description: string | null;
  youtube_url: string;
  order_index: number;
  duration_seconds: number;
};

export class VideosRepository {
  constructor(private pool: Pool) {}

  async findById(videoId: number): Promise<VideoDetailRow | null> {
    const [rows] = await this.pool.query<VideoDetailRow[]>(
      `SELECT v.id, v.section_id, s.subject_id, v.title, v.description, v.youtube_url, v.order_index, v.duration_seconds
       FROM videos v
       INNER JOIN sections s ON s.id = v.section_id
       WHERE v.id = :videoId
       LIMIT 1`,
      { videoId }
    );
    return rows[0] ?? null;
  }

  async subjectIsPublished(subjectId: number): Promise<boolean> {
    const [rows] = await this.pool.query<RowDataPacket & { c: number }[]>(
      `SELECT COUNT(*) AS c FROM subjects WHERE id = :subjectId AND is_published = 1`,
      { subjectId }
    );
    return Number(rows[0]?.c ?? 0) > 0;
  }
}
