import { Router } from "express";
import * as MovieController from "../controllers/movie.controller";
import { requireAuth } from "../middlewares/auth.middleware";

const router = Router();

router.post("/create", requireAuth, MovieController.createMovie);
router.get("/list", requireAuth, MovieController.getAllMovies);
router.get("/:id", requireAuth, MovieController.getMovieById);
router.put("/:id", requireAuth, MovieController.updateMovie);
router.delete("/:id", requireAuth, MovieController.deleteMovie);

export default router;
