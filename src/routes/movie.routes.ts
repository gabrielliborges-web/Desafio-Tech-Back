import { Router } from "express";
import * as MovieController from "../controllers/movie.controller";
import { requireAuth } from "../middlewares/auth.middleware";
import { upload } from "@/config/multer/multerConfig";

const router = Router();

router.post(
  "/movie/create",
  requireAuth,
  upload.fields([
    { name: "imageCover", maxCount: 1 },
    { name: "imagePoster", maxCount: 1 },
  ]),
  MovieController.createMovie
);
router.get("/list", requireAuth, MovieController.getAllMovies);
router.get("/:id", requireAuth, MovieController.getMovieById);
router.put("/:id", requireAuth, MovieController.updateMovie);
router.delete("/:id", requireAuth, MovieController.deleteMovie);

export default router;
