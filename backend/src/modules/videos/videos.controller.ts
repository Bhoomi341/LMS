import type { NextFunction, Request, Response } from "express";
import { VideosService } from "./videos.service.js";

export class VideosController {
  constructor(private service: VideosService) {}

  getById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
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
      const data = await this.service.getVideoForUser(videoId, userId);
      res.json(data);
    } catch (e) {
      next(e);
    }
  };
}
