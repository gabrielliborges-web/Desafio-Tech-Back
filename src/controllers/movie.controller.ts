import { Request, Response } from "express";
import * as MovieService from "../services/movie.service";
import { z } from "zod";
import {
  movieSchema,
  movieUpdateSchema,
  movieFilterSchema,
} from "../validators/movie.validator";
import { AuthenticatedRequest } from "@/middlewares/auth.middleware";

export const createMovie = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const parsed = movieSchema.parse(req.body);
    // console.log(parsed);
    const result = await MovieService.createMovie(parsed);
    res.status(201).json(result);
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      res.status(400).json({
        errors: error.issues.map((i) => ({
          path: i.path.join("."),
          message: i.message,
          expected: (i as any).expected,
          received: (i as any).received,
        })),
        body: req.body,
      });
      return;
    }

    res.status(400).json({ error: error.message, body: req.body });
  }
};

export const getAllMovies = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  try {
    const parsed = movieFilterSchema.parse(req.query);
    const result = await MovieService.getAllMovies(parsed, req.user?.id);
    res.status(200).json(result);
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      res.status(400).json({
        errors: error.issues.map((i) => i.message),
      });
      return;
    }
    res.status(400).json({ error: error.message });
  }
};

export const getMovieById = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  try {
    const result = await MovieService.getMovieById(req.params.id, req.user?.id);
    res.status(200).json(result);
  } catch (error: any) {
    console.error("Erro ao buscar filme:", error.message);

    if (error.statusCode === 403) {
      res.status(403).json({ error: error.message });
      return;
    }

    res.status(400).json({ error: error.message });
  }
};

export const updateMovie = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  try {
    const { id } = req.params;

    const movieId = Number(id);

    const parsed = movieUpdateSchema.parse(req.body);
    const result = await MovieService.updateMovie(
      movieId,
      parsed,
      req.user?.id
    );
    res.status(200).json(result);
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      res.status(400).json({
        errors: error.issues.map((i) => i.message),
      });
      return;
    }
    res.status(400).json({ error: error.message });
  }
};

export const deleteMovie = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  try {
    const id = Number(req.params.id);
    const userId = req.user?.id;

    const result = await MovieService.deleteMovie(id, userId);
    res.status(200).json(result);
  } catch (error: any) {
    console.error("Erro ao deletar filme:", error.message);

    res.status(error.statusCode || 400).json({
      error: error.message || "Erro ao deletar o filme.",
    });
  }
};
