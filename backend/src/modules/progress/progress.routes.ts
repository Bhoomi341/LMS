import { Router } from "express";
import { requireAuth } from "../../middleware/auth.middleware.js";
import { pool } from "../../config/database.js";
import { VideosRepository } from "../videos/videos.repository.js";
import { SubjectsRepository } from "../subjects/subjects.repository.js";
import { EnrollmentsRepository } from "../subjects/enrollments.repository.js";
import { ProgressRepository } from "./progress.repository.js";
import { ProgressService } from "./progress.service.js";
import { ProgressController } from "./progress.controller.js";

const videosRepo = new VideosRepository(pool);
const subjectsRepo = new SubjectsRepository(pool);
const enrollmentsRepo = new EnrollmentsRepository(pool);
const progressRepo = new ProgressRepository(pool);
const service = new ProgressService(videosRepo, subjectsRepo, enrollmentsRepo, progressRepo);
const controller = new ProgressController(service);

export const progressRouter = Router();

progressRouter.get("/videos/:videoId", requireAuth, controller.getVideo);
progressRouter.post("/videos/:videoId", requireAuth, controller.postVideo);
progressRouter.get("/subjects/:subjectId", requireAuth, controller.getSubject);
