import { Router } from "express";
import * as MovieController from "../controllers/movie.controller";
import { requireAuth } from "../middlewares/auth.middleware";

const router = Router();

router.use(requireAuth);

router.post("/create", MovieController.createMovie);
router.get("/list", MovieController.getAllMovies);
router.get("/:id", MovieController.getMovieById);
router.put("/:id", MovieController.updateMovie);
router.delete("/:id", MovieController.deleteMovie);

export default router;
