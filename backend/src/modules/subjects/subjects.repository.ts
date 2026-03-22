import type { Pool, RowDataPacket } from "mysql2/promise";

export type SubjectSummary = RowDataPacket & {
  id: number;
  title: string;
  slug: string;
  description: string | null;
  is_published: number;
  created_at: Date;
};

export type SectionRow = RowDataPacket & {
  id: number;
  subject_id: number;
  title: string;
  order_index: number;
};

export type VideoRow = RowDataPacket & {
  id: number;
  section_id: number;
  title: string;
  description: string | null;
  youtube_url: string;
  order_index: number;
  duration_seconds: number;
};

export class SubjectsRepository {
  constructor(private pool: Pool) {}

  async listPublished(): Promise<SubjectSummary[]> {
    const [rows] = await this.pool.query<SubjectSummary[]>(
      `SELECT id, title, slug, description, is_published, created_at
       FROM subjects WHERE is_published = 1 ORDER BY created_at DESC`
    );
    return rows;
  }

  async findById(id: number, onlyPublished: boolean): Promise<SubjectSummary | null> {
    const [rows] = await this.pool.query<SubjectSummary[]>(
      onlyPublished
        ? `SELECT id, title, slug, description, is_published, created_at FROM subjects WHERE id = :id AND is_published = 1 LIMIT 1`
        : `SELECT id, title, slug, description, is_published, created_at FROM subjects WHERE id = :id LIMIT 1`,
      { id }
    );
    return rows[0] ?? null;
  }

  async listSections(subjectId: number): Promise<SectionRow[]> {
    const [rows] = await this.pool.query<SectionRow[]>(
      `SELECT id, subject_id, title, order_index FROM sections WHERE subject_id = :subjectId ORDER BY order_index ASC, id ASC`,
      { subjectId }
    );
    return rows;
  }

  async listVideosForSection(sectionId: number): Promise<VideoRow[]> {
    const [rows] = await this.pool.query<VideoRow[]>(
      `SELECT id, section_id, title, description, youtube_url, order_index, duration_seconds
       FROM videos WHERE section_id = :sectionId ORDER BY order_index ASC, id ASC`,
      { sectionId }
    );
    return rows;
  }

  /** Flat subject-wide order: sections by order_index, then videos by order_index. */
  async getOrderedVideoIds(subjectId: number): Promise<number[]> {
    const [rows] = await this.pool.query<RowDataPacket & { id: number }[]>(
      `SELECT v.id FROM videos v
       INNER JOIN sections s ON s.id = v.section_id
       WHERE s.subject_id = :subjectId
       ORDER BY s.order_index ASC, s.id ASC, v.order_index ASC, v.id ASC`,
      { subjectId }
    );
    return rows.map((r) => r.id);
  }

  async getFirstVideoId(subjectId: number): Promise<number | null> {
    const ids = await this.getOrderedVideoIds(subjectId);
    return ids[0] ?? null;
  }
}
