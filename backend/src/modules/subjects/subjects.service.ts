import { AppError } from "../../utils/AppError.js";
import { parseYoutubeVideoId } from "../../utils/youtube.js";
import { EnrollmentsRepository } from "./enrollments.repository.js";
import { SubjectsRepository } from "./subjects.repository.js";
import { ProgressRepository } from "../progress/progress.repository.js";

export type TreeVideo = {
  id: number;
  title: string;
  description: string | null;
  youtubeVideoId: string;
  orderIndex: number;
  durationSeconds: number;
  locked: boolean;
  completed: boolean;
  lastPositionSeconds: number;
};

export type TreeSection = {
  id: number;
  title: string;
  orderIndex: number;
  videos: TreeVideo[];
};

export class SubjectsService {
  constructor(
    private subjectsRepo: SubjectsRepository,
    private enrollmentsRepo: EnrollmentsRepository,
    private progressRepo: ProgressRepository
  ) {}

  private computeLockedFlags(
    orderedVideoIds: number[],
    completed: Set<number>,
    hasUser: boolean
  ): Map<number, boolean> {
    const locked = new Map<number, boolean>();
    for (let i = 0; i < orderedVideoIds.length; i++) {
      const vid = orderedVideoIds[i];
      if (i === 0) {
        locked.set(vid, false);
      } else if (!hasUser) {
        locked.set(vid, true);
      } else {
        const prev = orderedVideoIds[i - 1];
        locked.set(vid, !completed.has(prev));
      }
    }
    return locked;
  }

  async listSubjects(): Promise<
    { id: number; title: string; slug: string; description: string | null; createdAt: string }[]
  > {
    const rows = await this.subjectsRepo.listPublished();
    return rows.map((r) => ({
      id: r.id,
      title: r.title,
      slug: r.slug,
      description: r.description,
      createdAt: r.created_at.toISOString(),
    }));
  }

  async getSubject(subjectId: number, userId?: number): Promise<{
    id: number;
    title: string;
    slug: string;
    description: string | null;
    createdAt: string;
  }> {
    const subject = await this.subjectsRepo.findById(subjectId, true);
    if (!subject) throw new AppError(404, "Subject not found");

    if (userId) {
      await this.enrollmentsRepo.ensureEnrollment(userId, subjectId);
    }

    return {
      id: subject.id,
      title: subject.title,
      slug: subject.slug,
      description: subject.description,
      createdAt: subject.created_at.toISOString(),
    };
  }

  async getTree(subjectId: number, userId?: number): Promise<{
    subjectId: number;
    sections: TreeSection[];
  }> {
    const subject = await this.subjectsRepo.findById(subjectId, true);
    if (!subject) throw new AppError(404, "Subject not found");

    if (userId) {
      await this.enrollmentsRepo.ensureEnrollment(userId, subjectId);
    }

    const orderedIds = await this.subjectsRepo.getOrderedVideoIds(subjectId);
    let completed = new Set<number>();
    const progressByVideo = new Map<
      number,
      { lastPositionSeconds: number; completed: boolean }
    >();

    if (userId) {
      completed = await this.progressRepo.getCompletedSet(userId, orderedIds);
      const progressRows = await this.progressRepo.listForSubject(userId, subjectId);
      for (const p of progressRows) {
        progressByVideo.set(p.video_id, {
          lastPositionSeconds: p.last_position_seconds,
          completed: Boolean(p.is_completed),
        });
      }
    }

    const lockedMap = this.computeLockedFlags(orderedIds, completed, Boolean(userId));

    const sections = await this.subjectsRepo.listSections(subjectId);
    const result: TreeSection[] = [];

    for (const sec of sections) {
      const vids = await this.subjectsRepo.listVideosForSection(sec.id);
      const videos: TreeVideo[] = vids.map((v) => {
        const yid = parseYoutubeVideoId(v.youtube_url);
        if (!yid) throw new AppError(500, "Invalid YouTube URL in catalog");
        const prog = progressByVideo.get(v.id);
        return {
          id: v.id,
          title: v.title,
          description: v.description,
          youtubeVideoId: yid,
          orderIndex: v.order_index,
          durationSeconds: v.duration_seconds,
          locked: lockedMap.get(v.id) ?? true,
          completed: prog?.completed ?? false,
          lastPositionSeconds: prog?.lastPositionSeconds ?? 0,
        };
      });
      result.push({
        id: sec.id,
        title: sec.title,
        orderIndex: sec.order_index,
        videos,
      });
    }

    return { subjectId, sections: result };
  }

  async getFirstVideoId(subjectId: number, userId?: number): Promise<{ videoId: number | null }> {
    const subject = await this.subjectsRepo.findById(subjectId, true);
    if (!subject) throw new AppError(404, "Subject not found");

    if (userId) {
      await this.enrollmentsRepo.ensureEnrollment(userId, subjectId);
    }

    const id = await this.subjectsRepo.getFirstVideoId(subjectId);
    return { videoId: id };
  }
}
