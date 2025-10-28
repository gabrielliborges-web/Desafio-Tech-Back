import { MovieStatus, Visibility } from "@prisma/client";
import { z } from "zod";

export const movieStatusEnum = z.enum(["DRAFT", "PUBLISHED"]);
export const visibilityEnum = z.enum(["PUBLIC", "PRIVATE"]);

export const movieSchema = z.object({
  title: z.string().min(1, "O título é obrigatório."),
  tagline: z.string().min(1, "A tagline é obrigatória."),
  originalTitle: z.string().optional(),
  description: z
    .string()
    .max(2000, "A descrição pode ter no máximo 2000 caracteres.")
    .optional(),

  releaseDate: z
    .string()
    .or(z.date())
    .optional()
    .refine(
      (val) => !val || !isNaN(new Date(val as any).getTime()),
      "Data de lançamento inválida."
    ),

  duration: z
    .number()
    .int("A duração deve ser um número inteiro (em minutos).")
    .positive("A duração deve ser positiva.")
    .refine((n) => typeof n === "number" && !isNaN(n), {
      message: "A duração deve ser um número válido.",
    })
    .optional(),

  indicativeRating: z
    .number()
    .int()
    .min(0, "A classificação indicativa deve ser no mínimo 0.")
    .max(18, "A classificação indicativa deve ser no máximo 18.")
    .optional(),

  imageCover: z.string().optional().nullable(),
  imagePoster: z.string().optional().nullable(),

  linkPreview: z
    .string()
    .url("O link do trailer deve ser uma URL válida.")
    .optional(),

  actors: z
    .array(z.string().min(1, "Nome do ator inválido."))
    .optional()
    .default([]),

  director: z.string().optional(),
  producers: z
    .array(z.string().min(1, "Nome do produtor inválido."))
    .optional()
    .default([]),

  language: z.string().optional(),
  country: z.string().optional(),

  budget: z.number().nonnegative("O orçamento deve ser positivo.").optional(),

  revenue: z.number().nonnegative("A receita deve ser positiva.").optional(),

  profit: z.number().optional(),

  ratingAvg: z
    .number()
    .min(0, "A nota média deve ser no mínimo 0.")
    .max(100, "A nota média deve ser no máximo 100.")
    .optional(),
  status: z.nativeEnum(MovieStatus).default(MovieStatus.DRAFT),
  visibility: z.nativeEnum(Visibility).default(Visibility.PUBLIC),

  genres: z
    .array(
      z.object({
        id: z.number().int().positive().optional(),
        name: z.string().min(1, "O nome do gênero é obrigatório."),
      })
    )
    .optional()
    .default([]),

  // userId: z.number().int().positive("O ID do usuário é obrigatório."),
});

export const movieUpdateSchema = movieSchema.partial();

export const movieFilterSchema = z.object({
  page: z.preprocess(
    (v) => (v !== undefined && v !== "" ? Number(v) : undefined),
    z.number().optional()
  ),
  limit: z.preprocess(
    (v) => (v !== undefined && v !== "" ? Number(v) : undefined),
    z.number().optional()
  ),

  search: z.string().optional(),
  originalTitle: z.string().optional(),
  director: z.string().optional(),
  language: z.string().optional(),
  country: z.string().optional(),

  status: z.enum(["DRAFT", "PUBLISHED"]).optional(),
  visibility: z.enum(["PRIVATE", "PUBLIC"]).optional(),
  genre: z.string().optional(),

  orderBy: z
    .enum([
      "title",
      "releaseDate",
      "ratingAvg",
      "createdAt",
      "budget",
      "profit",
    ])
    .optional(),
  order: z.enum(["asc", "desc"]).optional(),

  releaseDateStart: z.string().optional(),
  releaseDateEnd: z.string().optional(),

  indicativeRating: z.preprocess(
    (v) => (v !== undefined && v !== "" ? Number(v) : undefined),
    z.number().optional()
  ),

  minDuration: z.preprocess(
    (v) => (v !== undefined && v !== "" ? Number(v) : undefined),
    z.number().optional()
  ),
  maxDuration: z.preprocess(
    (v) => (v !== undefined && v !== "" ? Number(v) : undefined),
    z.number().optional()
  ),

  minBudget: z.preprocess(
    (v) => (v !== undefined && v !== "" ? Number(v) : undefined),
    z.number().optional()
  ),
  maxBudget: z.preprocess(
    (v) => (v !== undefined && v !== "" ? Number(v) : undefined),
    z.number().optional()
  ),

  minRevenue: z.preprocess(
    (v) => (v !== undefined && v !== "" ? Number(v) : undefined),
    z.number().optional()
  ),
  maxRevenue: z.preprocess(
    (v) => (v !== undefined && v !== "" ? Number(v) : undefined),
    z.number().optional()
  ),

  minProfit: z.preprocess(
    (v) => (v !== undefined && v !== "" ? Number(v) : undefined),
    z.number().optional()
  ),
  maxProfit: z.preprocess(
    (v) => (v !== undefined && v !== "" ? Number(v) : undefined),
    z.number().optional()
  ),

  minRatingAvg: z.preprocess(
    (v) => (v !== undefined && v !== "" ? Number(v) : undefined),
    z.number().optional()
  ),
  maxRatingAvg: z.preprocess(
    (v) => (v !== undefined && v !== "" ? Number(v) : undefined),
    z.number().optional()
  ),

  userId: z.string().optional(),

  createdAtStart: z.string().optional(),
  createdAtEnd: z.string().optional(),
});

export type MovieInput = z.infer<typeof movieSchema>;
export type MovieUpdateInput = z.infer<typeof movieUpdateSchema>;
export type MovieFilterInput = z.infer<typeof movieFilterSchema>;
