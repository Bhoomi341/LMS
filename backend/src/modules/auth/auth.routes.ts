import { Router } from "express";
import { requireAuth } from "../../middleware/auth.middleware.js";
import { AuthController } from "./auth.controller.js";
import { AuthService } from "./auth.service.js";
import { AuthRepository } from "./auth.repository.js";
import { UsersRepository } from "../users/users.repository.js";
import { pool } from "../../config/database.js";

const usersRepo = new UsersRepository(pool);
const authRepo = new AuthRepository(pool);
const service = new AuthService(usersRepo, authRepo);
const controller = new AuthController(service);

export const authRouter = Router();

authRouter.post("/register", controller.register);
authRouter.post("/login", controller.login);
authRouter.post("/refresh", controller.refresh);
authRouter.post("/logout", controller.logout);
authRouter.get("/me", requireAuth, controller.me);
