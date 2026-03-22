import type { Request, Response, NextFunction } from "express";
import { AuthService } from "./auth.service.js";

export class AuthController {
  constructor(private service: AuthService) {}

  register = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const result = await this.service.register(req.body, res);
      res.status(201).json(result);
    } catch (e) {
      next(e);
    }
  };

  login = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const result = await this.service.login(req.body, res);
      res.json(result);
    } catch (e) {
      next(e);
    }
  };

  refresh = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const token = req.cookies?.refresh_token as string | undefined;
      const result = await this.service.refresh(token, res);
      res.json(result);
    } catch (e) {
      next(e);
    }
  };

  logout = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const token = req.cookies?.refresh_token as string | undefined;
      await this.service.logout(token, res);
      res.status(204).send();
    } catch (e) {
      next(e);
    }
  };

  me = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = req.user?.id;
      if (!userId) {
        res.status(401).json({ error: "Unauthorized" });
        return;
      }
      const user = await this.service.me(userId);
      res.json(user);
    } catch (e) {
      next(e);
    }
  };
}
