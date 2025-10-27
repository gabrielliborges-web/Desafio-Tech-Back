import { Router } from "express";
import * as UserController from "../controllers/user.controller";
import { requireAuth } from "../middlewares/auth.middleware";

const router = Router();

router.put("/:id/theme", requireAuth, UserController.updateTheme);

export default router;
