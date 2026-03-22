import { Router } from "express";
import { optionalAuth } from "../../middleware/auth.middleware.js";
import { pool } from "../../config/database.js";
import { SubjectsRepository } from "./subjects.repository.js";
import { EnrollmentsRepository } from "./enrollments.repository.js";
import { ProgressRepository } from "../progress/progress.repository.js";
import { SubjectsService } from "./subjects.service.js";
import { SubjectsController } from "./subjects.controller.js";

const subjectsRepo = new SubjectsRepository(pool);
const enrollmentsRepo = new EnrollmentsRepository(pool);
const progressRepo = new ProgressRepository(pool);
const service = new SubjectsService(subjectsRepo, enrollmentsRepo, progressRepo);
const controller = new SubjectsController(service);

export const subjectsRouter = Router();

subjectsRouter.get("/", controller.list);
subjectsRouter.get("/:subjectId", optionalAuth, controller.getById);
subjectsRouter.get("/:subjectId/tree", optionalAuth, controller.tree);
subjectsRouter.get("/:subjectId/first-video", optionalAuth, controller.firstVideo);
