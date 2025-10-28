import { Request, Response } from "express";
import * as MovieService from "../services/movie.service";
import { z } from "zod";
import {
  movieSchema,
  movieUpdateSchema,
  movieFilterSchema,
} from "../validators/movie.validator";
import { AuthenticatedRequest } from "../middlewares/auth.middleware";
import { parseArray, parseGenres } from "../utils/parseArray";

export const createMovie = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const userId = (req as any).user?.id;

    if (!userId) {
      res.status(401).json({ error: "Usuário não autenticado.", userId });
      return;
    }

    const raw = req.body;

    const parsedBody = {
      ...raw,
      duration: raw.duration ? Number(raw.duration) : undefined,
      indicativeRating: raw.indicativeRating
        ? Number(raw.indicativeRating)
        : undefined,
      revenue: raw.revenue ? Number(raw.revenue) : undefined,
      budget: raw.budget ? Number(raw.budget) : undefined,
      profit: raw.profit ? Number(raw.profit) : undefined,
      ratingAvg: raw.ratingAvg ? Number(raw.ratingAvg) : undefined,
      releaseDate: raw.releaseDate
        ? new Date(raw.releaseDate).toISOString()
        : undefined,
      actors: parseArray(raw.actors),
      producers: parseArray(raw.producers),
      genres: parseGenres(raw),
      userId,
    };

    const result = await MovieService.createMovie(
      parsedBody,
      req.files as any,
      userId
    );
    res.status(201).json(result);
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      res.status(400).json({
        errors: error.issues.map((i) => ({
          path: i.path.join("."),
          message: i.message,
        })),
        body: req.body,
      });
      return;
    }

    console.error("Erro ao criar filme:", error);
    res.status(error.statusCode || 500).json({
      error: error.message || "Erro interno ao criar filme.",
      body: req.body,
    });
    return;
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
    const userId = req.user?.id;

    const raw = req.body;
    const parsedBody = {
      ...raw,
      duration: raw.duration ? Number(raw.duration) : undefined,
      indicativeRating: raw.indicativeRating
        ? Number(raw.indicativeRating)
        : undefined,
      revenue: raw.revenue ? Number(raw.revenue) : undefined,
      budget: raw.budget ? Number(raw.budget) : undefined,
      profit: raw.profit ? Number(raw.profit) : undefined,
      ratingAvg: raw.ratingAvg ? Number(raw.ratingAvg) : undefined,
      releaseDate: raw.releaseDate
        ? new Date(raw.releaseDate).toISOString()
        : undefined,
      actors: parseArray(raw.actors),
      producers: parseArray(raw.producers),
      genres: parseGenres(raw),
    };

    const result = await MovieService.updateMovie(
      movieId,
      parsedBody,
      req.files as any,
      userId
    );
    res.status(200).json(result);
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      res.status(400).json({
        errors: error.issues.map((i) => ({
          path: i.path.join("."),
          message: i.message,
        })),
        body: req.body,
      });
      return;
    }

    console.error("Erro ao atualizar filme:", error.message);
    res.status(error.statusCode || 500).json({
      error: error.message || "Erro interno ao atualizar filme.",
    });
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
