import { Router } from "express";
import { requireAuth } from "../../middleware/auth.middleware.js";
import { pool } from "../../config/database.js";
import { VideosRepository } from "./videos.repository.js";
import { SubjectsRepository } from "../subjects/subjects.repository.js";
import { EnrollmentsRepository } from "../subjects/enrollments.repository.js";
import { ProgressRepository } from "../progress/progress.repository.js";
import { VideosService } from "./videos.service.js";
import { VideosController } from "./videos.controller.js";

const videosRepo = new VideosRepository(pool);
const subjectsRepo = new SubjectsRepository(pool);
const enrollmentsRepo = new EnrollmentsRepository(pool);
const progressRepo = new ProgressRepository(pool);
const service = new VideosService(videosRepo, subjectsRepo, enrollmentsRepo, progressRepo);
const controller = new VideosController(service);

export const videosRouter = Router();

videosRouter.get("/:videoId", requireAuth, controller.getById);
