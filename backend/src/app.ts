import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import { env } from "./config/env.js";
import { errorMiddleware } from "./middleware/error.middleware.js";
import { authRouter } from "./modules/auth/auth.routes.js";
import { subjectsRouter } from "./modules/subjects/subjects.routes.js";
import { videosRouter } from "./modules/videos/videos.routes.js";
import { progressRouter } from "./modules/progress/progress.routes.js";
import { healthRouter } from "./modules/health/health.routes.js";

export function createApp() {
  const app = express();

  app.use(
    cors({
      origin: env.corsOrigin,
      credentials: true,
    })
  );
  app.use(express.json());
  app.use(cookieParser());

  app.use("/api/health", healthRouter);
  app.use("/api/auth", authRouter);
  app.use("/api/subjects", subjectsRouter);
  app.use("/api/videos", videosRouter);
  app.use("/api/progress", progressRouter);

  app.use((_req, res) => {
    res.status(404).json({ error: "Not found" });
  });

  app.use(errorMiddleware);

  return app;
}
