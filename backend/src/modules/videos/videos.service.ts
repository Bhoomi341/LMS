import { AppError } from "../../utils/AppError.js";
import { parseYoutubeVideoId } from "../../utils/youtube.js";
import { VideosRepository } from "./videos.repository.js";
import { SubjectsRepository } from "../subjects/subjects.repository.js";
import { EnrollmentsRepository } from "../subjects/enrollments.repository.js";
import { ProgressRepository } from "../progress/progress.repository.js";

export class VideosService {
  constructor(
    private videosRepo: VideosRepository,
    private subjectsRepo: SubjectsRepository,
    private enrollmentsRepo: EnrollmentsRepository,
    private progressRepo: ProgressRepository
  ) {}

  async getVideoForUser(videoId: number, userId: number): Promise<{
    id: number;
    subjectId: number;
    sectionId: number;
    title: string;
    description: string | null;
    youtubeVideoId: string;
    youtubeUrl: string;
    durationSeconds: number;
    locked: boolean;
    progress: {
      lastPositionSeconds: number;
      isCompleted: boolean;
      completedAt: string | null;
    } | null;
    navigation: { prevVideoId: number | null; nextVideoId: number | null };
  }> {
    const row = await this.videosRepo.findById(videoId);
    if (!row) throw new AppError(404, "Video not found");

    const published = await this.videosRepo.subjectIsPublished(row.subject_id);
    if (!published) throw new AppError(404, "Video not found");

    await this.enrollmentsRepo.ensureEnrollment(userId, row.subject_id);

    const orderedIds = await this.subjectsRepo.getOrderedVideoIds(row.subject_id);
    const idx = orderedIds.indexOf(videoId);
    if (idx === -1) throw new AppError(404, "Video not found");

    const completed = await this.progressRepo.getCompletedSet(userId, orderedIds);
    let locked = false;
    if (idx > 0) {
      const prevId = orderedIds[idx - 1];
      locked = !completed.has(prevId);
    }

    if (locked) {
      throw new AppError(403, "Complete the previous lesson to unlock this video");
    }

    const yid = parseYoutubeVideoId(row.youtube_url);
    if (!yid) throw new AppError(500, "Invalid YouTube URL in catalog");

    const prog = await this.progressRepo.get(userId, videoId);

    return {
      id: row.id,
      subjectId: row.subject_id,
      sectionId: row.section_id,
      title: row.title,
      description: row.description,
      youtubeVideoId: yid,
      youtubeUrl: row.youtube_url,
      durationSeconds: row.duration_seconds,
      locked: false,
      progress: prog
        ? {
            lastPositionSeconds: prog.last_position_seconds,
            isCompleted: Boolean(prog.is_completed),
            completedAt: prog.completed_at ? prog.completed_at.toISOString() : null,
          }
        : null,
      navigation: {
        prevVideoId: idx > 0 ? orderedIds[idx - 1] : null,
        nextVideoId: idx < orderedIds.length - 1 ? orderedIds[idx + 1] : null,
      },
    };
  }
}
