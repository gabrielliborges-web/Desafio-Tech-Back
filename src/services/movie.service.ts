import { Prisma, PrismaClient, MovieStatus, Visibility } from "@prisma/client";
import {
  movieSchema,
  movieUpdateSchema,
  movieFilterSchema,
  type MovieInput,
} from "../validators/movie.validator";

import { PutObjectCommand } from "@aws-sdk/client-s3";
import { s3 } from "../config/awsConfig";
import { v4 as uuidv4 } from "uuid";

const prisma = new PrismaClient();

export const createMovie = async (
  data: MovieInput,
  files?: {
    imageCover?: Express.Multer.File[];
    imagePoster?: Express.Multer.File[];
  },
  userId?: number
) => {
  const parsed = movieSchema.parse(data);

  let imageCoverUrl = parsed.imageCover || null;
  let imagePosterUrl = parsed.imagePoster || null;

  if (files?.imageCover?.[0]) {
    const file = files.imageCover[0];
    const uniqueKey = `usuarios/${userId}/movies/${
      parsed.title
    }/cover/${uuidv4()}-${file.originalname}`.replace(/\s+/g, "");
    await s3.send(
      new PutObjectCommand({
        Bucket: process.env.AWS_BUCKET_NAME!,
        Key: uniqueKey,
        Body: file.buffer,
        ContentType: file.mimetype,
      })
    );
    imageCoverUrl = `https://${process.env.AWS_BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/${uniqueKey}`;
  }

  if (files?.imagePoster?.[0]) {
    const file = files.imagePoster[0];
    const uniqueKey = `usuarios/${userId}/movies/${
      parsed.title
    }/poster/${uuidv4()}-${file.originalname}`.replace(/\s+/g, "");
    await s3.send(
      new PutObjectCommand({
        Bucket: process.env.AWS_BUCKET_NAME!,
        Key: uniqueKey,
        Body: file.buffer,
        ContentType: file.mimetype,
      })
    );
    imagePosterUrl = `https://${process.env.AWS_BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/${uniqueKey}`;
  }

  const movie = await prisma.movie.create({
    data: {
      ...parsed,
      imageCover: imageCoverUrl || null,
      imagePoster: imagePosterUrl || null,
      releaseDate: parsed.releaseDate
        ? new Date(parsed.releaseDate)
        : undefined,
      userId: userId!,
      genres: {
        create: parsed.genres?.map((g) => ({
          genre: {
            connectOrCreate: {
              where: { name: g.name },
              create: { name: g.name },
            },
          },
        })),
      },
    },
    include: {
      genres: { include: { genre: true } },
      user: { select: { id: true, name: true, email: true } },
    },
  });

  return movie;
};

export const getAllMovies = async (query: any, userId?: number | string) => {
  const parsed = movieFilterSchema.parse(query);

  console.log("User ID recebido:", userId);
  console.log("Filtros recebidos:", parsed);

  const page = Number(parsed.page) || 1;
  const limit = Number(parsed.limit) || 10;
  const skip = (page - 1) * limit;

  const where: Prisma.MovieWhereInput = {
    ...(parsed.search && {
      OR: [
        { title: { contains: parsed.search, mode: "insensitive" } },
        { originalTitle: { contains: parsed.search, mode: "insensitive" } },
        { tagline: { contains: parsed.search, mode: "insensitive" } },
        { description: { contains: parsed.search, mode: "insensitive" } },
        { director: { contains: parsed.search, mode: "insensitive" } },
      ],
    }),

    ...(parsed.originalTitle && {
      originalTitle: { contains: parsed.originalTitle, mode: "insensitive" },
    }),

    ...(parsed.director && {
      director: { contains: parsed.director, mode: "insensitive" },
    }),

    ...(parsed.language && {
      language: { contains: parsed.language, mode: "insensitive" },
    }),

    ...(parsed.country && {
      country: { contains: parsed.country, mode: "insensitive" },
    }),

    ...(parsed.visibility && { visibility: parsed.visibility as Visibility }),

    ...(parsed.genre && {
      genres: {
        some: {
          genre: { name: { equals: parsed.genre, mode: "insensitive" } },
        },
      },
    }),

    ...(parsed.indicativeRating && {
      indicativeRating: { lte: Number(parsed.indicativeRating) },
    }),

    ...(parsed.releaseDateStart || parsed.releaseDateEnd
      ? {
          releaseDate: {
            ...(parsed.releaseDateStart && {
              gte: new Date(parsed.releaseDateStart),
            }),
            ...(parsed.releaseDateEnd && {
              lte: new Date(parsed.releaseDateEnd),
            }),
          },
        }
      : {}),

    ...(parsed.minDuration || parsed.maxDuration
      ? {
          duration: {
            ...(parsed.minDuration && { gte: Number(parsed.minDuration) }),
            ...(parsed.maxDuration && { lte: Number(parsed.maxDuration) }),
          },
        }
      : {}),

    ...(parsed.minBudget || parsed.maxBudget
      ? {
          budget: {
            ...(parsed.minBudget && { gte: Number(parsed.minBudget) }),
            ...(parsed.maxBudget && { lte: Number(parsed.maxBudget) }),
          },
        }
      : {}),

    ...(parsed.minRevenue || parsed.maxRevenue
      ? {
          revenue: {
            ...(parsed.minRevenue && { gte: Number(parsed.minRevenue) }),
            ...(parsed.maxRevenue && { lte: Number(parsed.maxRevenue) }),
          },
        }
      : {}),

    ...(parsed.minProfit || parsed.maxProfit
      ? {
          profit: {
            ...(parsed.minProfit && { gte: Number(parsed.minProfit) }),
            ...(parsed.maxProfit && { lte: Number(parsed.maxProfit) }),
          },
        }
      : {}),

    ...(parsed.minRatingAvg || parsed.maxRatingAvg
      ? {
          ratingAvg: {
            ...(parsed.minRatingAvg && { gte: Number(parsed.minRatingAvg) }),
            ...(parsed.maxRatingAvg && { lte: Number(parsed.maxRatingAvg) }),
          },
        }
      : {}),

    ...(parsed.createdAtStart || parsed.createdAtEnd
      ? {
          createdAt: {
            ...(parsed.createdAtStart && {
              gte: new Date(parsed.createdAtStart),
            }),
            ...(parsed.createdAtEnd && { lte: new Date(parsed.createdAtEnd) }),
          },
        }
      : {}),

    ...(parsed.userId && {
      user: {
        name: { contains: parsed.userId, mode: "insensitive" },
      },
    }),
  };

  if (parsed.status === "DRAFT") {
    where.status = "DRAFT";
    if (userId) where.userId = Number(userId);
  } else {
    where.status = "PUBLISHED";
  }

  const [movies, total] = await Promise.all([
    prisma.movie.findMany({
      where,
      skip,
      take: limit,
      orderBy: parsed.orderBy
        ? { [parsed.orderBy]: parsed.order ?? "asc" }
        : { createdAt: "desc" },
      include: {
        genres: { include: { genre: true } },
        user: { select: { id: true, name: true } },
      },
    }),
    prisma.movie.count({ where }),
  ]);

  return {
    data: movies,
    parsed,
    meta: {
      userId: userId,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    },
  };
};

export const getMovieById = async (
  id: string | number,
  userId?: number | string
) => {
  const movieId = Number(id);
  if (isNaN(movieId)) throw new Error("ID inválido.");

  const movie = await prisma.movie.findUnique({
    where: { id: movieId },
    include: {
      genres: { include: { genre: true } },
      ratings: true,
      comments: { include: { user: true, replies: true } },
      user: { select: { id: true, name: true, email: true } },
    },
  });

  if (!movie) throw new Error("Filme não encontrado.");

  if (movie.status === "DRAFT" && movie.userId !== Number(userId)) {
    const err = new Error("Acesso negado. Este filme é um rascunho privado.");
    (err as any).statusCode = 403;
    throw err;
  }

  return movie;
};

export const updateMovie = async (
  id: number,
  data: Partial<MovieInput>,
  userId?: number
) => {
  const parsed = movieUpdateSchema.parse(data);

  const existing = await prisma.movie.findUnique({
    where: { id },
  });

  if (!existing) {
    const error: any = new Error("Filme não encontrado.");
    error.statusCode = 404;
    throw error;
  }

  if (existing.userId !== userId) {
    const error: any = new Error(
      "Você não tem permissão para editar este filme."
    );
    error.statusCode = 403;
    throw error;
  }

  const movie = await prisma.movie.update({
    where: { id },
    data: {
      ...parsed,
      genres: parsed.genres
        ? {
            deleteMany: { movieId: id },
            create: parsed.genres.map((g) => ({
              genre: {
                connectOrCreate: {
                  where: { name: g.name },
                  create: { name: g.name },
                },
              },
            })),
          }
        : undefined,
    },
    include: {
      genres: { include: { genre: true } },
      user: { select: { id: true, name: true, email: true } },
    },
  });

  return movie;
};

export const deleteMovie = async (id: number, userId?: number) => {
  const existing = await prisma.movie.findUnique({
    where: { id },
    include: { user: true },
  });

  if (!existing) {
    const error: any = new Error("Filme não encontrado.");
    error.statusCode = 404;
    throw error;
  }

  if (existing.userId !== userId) {
    const error: any = new Error(
      "Você não tem permissão para deletar este filme."
    );
    error.statusCode = 403;
    throw error;
  }

  await prisma.movie.delete({ where: { id } });

  return { message: "Filme deletado com sucesso." };
};
