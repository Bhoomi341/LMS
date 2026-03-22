import type { NextFunction, Request, Response } from "express";
import { ProgressService } from "./progress.service.js";

export class ProgressController {
  constructor(private service: ProgressService) {}

  getVideo = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = req.user?.id;
      if (!userId) {
        res.status(401).json({ error: "Unauthorized" });
        return;
      }
      const videoId = Number(req.params.videoId);
      if (!Number.isFinite(videoId)) {
        res.status(400).json({ error: "Invalid video id" });
        return;
      }
      const data = await this.service.getVideoProgress(videoId, userId);
      res.json(data);
    } catch (e) {
      next(e);
    }
  };

  postVideo = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = req.user?.id;
      if (!userId) {
        res.status(401).json({ error: "Unauthorized" });
        return;
      }
      const videoId = Number(req.params.videoId);
      if (!Number.isFinite(videoId)) {
        res.status(400).json({ error: "Invalid video id" });
        return;
      }
      const data = await this.service.saveVideoProgress(videoId, userId, req.body);
      res.json(data);
    } catch (e) {
      next(e);
    }
  };

  getSubject = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = req.user?.id;
      if (!userId) {
        res.status(401).json({ error: "Unauthorized" });
        return;
      }
      const subjectId = Number(req.params.subjectId);
      if (!Number.isFinite(subjectId)) {
        res.status(400).json({ error: "Invalid subject id" });
        return;
      }
      const data = await this.service.subjectProgress(subjectId, userId);
      res.json(data);
    } catch (e) {
      next(e);
    }
  };
}
