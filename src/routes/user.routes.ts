import { Router } from "express";
import * as UserController from "../controllers/user.controller";
import { requireAuth } from "../middlewares/auth.middleware";

const router = Router();

router.put("/theme", requireAuth, UserController.updateTheme);

export default router;
