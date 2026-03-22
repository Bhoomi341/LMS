import type { NextFunction, Request, Response } from "express";
import { SubjectsService } from "./subjects.service.js";

export class SubjectsController {
  constructor(private service: SubjectsService) {}

  list = async (_req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const data = await this.service.listSubjects();
      res.json(data);
    } catch (e) {
      next(e);
    }
  };

  getById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const subjectId = Number(req.params.subjectId);
      if (!Number.isFinite(subjectId)) {
        res.status(400).json({ error: "Invalid subject id" });
        return;
      }
      const data = await this.service.getSubject(subjectId, req.user?.id);
      res.json(data);
    } catch (e) {
      next(e);
    }
  };

  tree = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const subjectId = Number(req.params.subjectId);
      if (!Number.isFinite(subjectId)) {
        res.status(400).json({ error: "Invalid subject id" });
        return;
      }
      const data = await this.service.getTree(subjectId, req.user?.id);
      res.json(data);
    } catch (e) {
      next(e);
    }
  };

  firstVideo = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const subjectId = Number(req.params.subjectId);
      if (!Number.isFinite(subjectId)) {
        res.status(400).json({ error: "Invalid subject id" });
        return;
      }
      const data = await this.service.getFirstVideoId(subjectId, req.user?.id);
      res.json(data);
    } catch (e) {
      next(e);
    }
  };
}
