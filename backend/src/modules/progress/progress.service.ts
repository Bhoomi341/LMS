import { AppError } from "../../utils/AppError.js";
import { VideosRepository } from "../videos/videos.repository.js";
import { SubjectsRepository } from "../subjects/subjects.repository.js";
import { EnrollmentsRepository } from "../subjects/enrollments.repository.js";
import { ProgressRepository } from "./progress.repository.js";

export class ProgressService {
  constructor(
    private videosRepo: VideosRepository,
    private subjectsRepo: SubjectsRepository,
    private enrollmentsRepo: EnrollmentsRepository,
    private progressRepo: ProgressRepository
  ) {}

  async getVideoProgress(videoId: number, userId: number): Promise<{
    videoId: number;
    lastPositionSeconds: number;
    isCompleted: boolean;
    completedAt: string | null;
  }> {
    const row = await this.videosRepo.findById(videoId);
    if (!row) throw new AppError(404, "Video not found");
    const published = await this.videosRepo.subjectIsPublished(row.subject_id);
    if (!published) throw new AppError(404, "Video not found");

    await this.enrollmentsRepo.ensureEnrollment(userId, row.subject_id);

    const prog = await this.progressRepo.get(userId, videoId);
    return {
      videoId,
      lastPositionSeconds: prog?.last_position_seconds ?? 0,
      isCompleted: Boolean(prog?.is_completed),
      completedAt: prog?.completed_at ? prog.completed_at.toISOString() : null,
    };
  }

  async saveVideoProgress(
    videoId: number,
    userId: number,
    body: { last_position_seconds?: unknown; duration_seconds?: unknown }
  ): Promise<{
    videoId: number;
    lastPositionSeconds: number;
    isCompleted: boolean;
  }> {
    const row = await this.videosRepo.findById(videoId);
    if (!row) throw new AppError(404, "Video not found");
    const published = await this.videosRepo.subjectIsPublished(row.subject_id);
    if (!published) throw new AppError(404, "Video not found");

    await this.enrollmentsRepo.ensureEnrollment(userId, row.subject_id);

    const lastPos = Number(body.last_position_seconds);
    if (!Number.isFinite(lastPos) || lastPos < 0) {
      throw new AppError(400, "last_position_seconds must be a non-negative number");
    }

    const durationFromClient = Number(body.duration_seconds);
    const duration =
      Number.isFinite(durationFromClient) && durationFromClient > 0
        ? durationFromClient
        : row.duration_seconds;

    let isCompleted = false;
    if (duration > 0 && lastPos / duration >= 0.9) {
      isCompleted = true;
    }

    const existing = await this.progressRepo.get(userId, videoId);
    if (existing?.is_completed) {
      isCompleted = true;
    }

    await this.progressRepo.saveProgress({
      userId,
      videoId,
      lastPositionSeconds: lastPos,
      isCompleted,
    });

    return {
      videoId,
      lastPositionSeconds: Math.floor(lastPos),
      isCompleted,
    };
  }

  async subjectProgress(subjectId: number, userId: number): Promise<{
    subjectId: number;
    videos: {
      videoId: number;
      lastPositionSeconds: number;
      isCompleted: boolean;
      completedAt: string | null;
    }[];
  }> {
    const subject = await this.subjectsRepo.findById(subjectId, true);
    if (!subject) throw new AppError(404, "Subject not found");

    await this.enrollmentsRepo.ensureEnrollment(userId, subjectId);

    const rows = await this.progressRepo.listForSubject(userId, subjectId);
    return {
      subjectId,
      videos: rows.map((r) => ({
        videoId: r.video_id,
        lastPositionSeconds: r.last_position_seconds,
        isCompleted: Boolean(r.is_completed),
        completedAt: r.completed_at ? r.completed_at.toISOString() : null,
      })),
    };
  }
}
