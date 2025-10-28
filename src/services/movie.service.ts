import { Prisma, PrismaClient, MovieStatus, Visibility } from "@prisma/client";
import {
  movieSchema,
  movieUpdateSchema,
  movieFilterSchema,
  type MovieInput,
  MovieFilterInput,
} from "../validators/movie.validator";

import { DeleteObjectCommand, PutObjectCommand } from "@aws-sdk/client-s3";
import { s3, safeFileKey, uploadFileToS3 } from "../config/awsConfig";
import { v4 as uuidv4 } from "uuid";
import {
  createEmailSchedule,
  deleteEmailSchedule,
} from "../config/awsScheduler.service";

const prisma = new PrismaClient();

export const createMovie = async (data, files, userId, io?: any) => {
  const parsed = movieSchema.parse(data);

  let imageCoverUrl = parsed.imageCover || null;
  let imagePosterUrl = parsed.imagePoster || null;

  if (files?.imageCover?.[0]) {
    const file = files.imageCover[0];
    const key = safeFileKey(userId, parsed.title, "cover", file.originalname);
    imageCoverUrl = await uploadFileToS3(file, key);
  }

  if (files?.imagePoster?.[0]) {
    const file = files.imagePoster[0];
    const key = safeFileKey(userId, parsed.title, "poster", file.originalname);
    imagePosterUrl = await uploadFileToS3(file, key);
  }

  const movie = await prisma.movie.create({
    data: {
      ...parsed,
      imageCover: imageCoverUrl,
      imagePoster: imagePosterUrl,
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

  if (movie.releaseDate) {
    const releaseDate = new Date(movie.releaseDate);
    const now = new Date();

    if (releaseDate > now) {
      const scheduleName = await createEmailSchedule(releaseDate, {
        to: movie.user.email,
        movie: {
          title: movie.title,
          tagline: movie.tagline,
          description: movie.description,
          releaseDate: movie.releaseDate?.toISOString(),
          linkPreview: movie.linkPreview,
          imagePoster: movie.imagePoster,
        },
      });

      await prisma.movie.update({
        where: { id: movie.id },
        data: { scheduleName },
      });
    }
  }

  if (movie.visibility === "PUBLIC" && movie.status === "PUBLISHED") {
    const notification = await prisma.notification.create({
      data: {
        title: `🎬 Novo filme publicado: ${movie.title}`,
        message: `${movie.user.name} acabou de publicar o filme "${movie.title}".`,
        type: "MOVIE_CREATE",
        link: `/movie/${movie.id}`,
      },
    });

    if (io) {
      io.emit("newMovie", notification);
    }

    console.log("📢 Notificação global criada e emitida:", notification.title);
  }

  return movie;
};

export const getAllMovies = async (
  query: MovieFilterInput,
  userId?: number | string
) => {
  const parsed = movieFilterSchema.parse(query);

  const page = Number(parsed.page) || 1;
  const limit = Number(parsed.limit) || 10;
  const skip = (page - 1) * limit;

  let where: Prisma.MovieWhereInput = {
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

  where.OR = [
    { status: "PUBLISHED", visibility: "PUBLIC" },

    { userId: Number(userId) },
  ];

  if (parsed.visibility) {
    if (parsed.visibility === "PRIVATE") {
      where = {
        ...where,
        AND: [{ userId: Number(userId) }, { visibility: "PRIVATE" }],
      };
    } else if (parsed.visibility === "PUBLIC") {
      where = {
        ...where,
        AND: [{ visibility: "PUBLIC" }],
        OR: [
          { status: "PUBLISHED", visibility: "PUBLIC" },
          { userId: Number(userId), visibility: "PUBLIC" },
        ],
      };
    }
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

  const formattedMovie = {
    ...movie,
    genres: movie.genres.map((g) => ({
      id: g.genre.id,
      name: g.genre.name,
    })),
  };

  return formattedMovie;
};

export const updateMovie = async (
  id: number,
  data: Partial<MovieInput>,
  files?: {
    imageCover?: Express.Multer.File[];
    imagePoster?: Express.Multer.File[];
  },
  userId?: number
) => {
  const parsed = movieUpdateSchema.parse(data);
  const existing = await prisma.movie.findUnique({ where: { id } });

  if (!existing)
    throw Object.assign(new Error("Filme não encontrado."), {
      statusCode: 404,
    });
  if (existing.userId !== userId)
    throw Object.assign(
      new Error("Você não tem permissão para editar este filme."),
      { statusCode: 403 }
    );

  let imageCoverUrl = existing.imageCover;
  let imagePosterUrl = existing.imagePoster;

  if (files?.imageCover?.[0]) {
    const file = files.imageCover[0];
    if (existing.imageCover) {
      const oldKey = existing.imageCover.split(
        `https://${process.env.AWS_BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/`
      )[1];
      if (oldKey) {
        await s3.send(
          new DeleteObjectCommand({
            Bucket: process.env.AWS_BUCKET_NAME!,
            Key: oldKey,
          })
        );
      }
    }

    const key = safeFileKey(
      userId,
      parsed.title || existing.title,
      "cover",
      file.originalname
    );
    imageCoverUrl = await uploadFileToS3(file, key);
  }

  if (files?.imagePoster?.[0]) {
    const file = files.imagePoster[0];
    if (existing.imagePoster) {
      const oldKey = existing.imagePoster.split(
        `https://${process.env.AWS_BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/`
      )[1];
      if (oldKey) {
        await s3.send(
          new DeleteObjectCommand({
            Bucket: process.env.AWS_BUCKET_NAME!,
            Key: oldKey,
          })
        );
      }
    }

    const key = safeFileKey(
      userId,
      parsed.title || existing.title,
      "poster",
      file.originalname
    );
    imagePosterUrl = await uploadFileToS3(file, key);
  }

  const movie = await prisma.movie.update({
    where: { id },
    data: {
      ...parsed,
      imageCover: imageCoverUrl,
      imagePoster: imagePosterUrl,
      releaseDate: parsed.releaseDate
        ? new Date(parsed.releaseDate)
        : existing.releaseDate,
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

  if (parsed.releaseDate) {
    const newDate = new Date(parsed.releaseDate);
    const now = new Date();
    const hasDateChanged =
      !existing.releaseDate ||
      existing.releaseDate.getTime() !== newDate.getTime();

    if (hasDateChanged) {
      if (existing.scheduleName) {
        await deleteEmailSchedule(existing.scheduleName);
      }

      if (newDate > now) {
        const scheduleName = await createEmailSchedule(newDate, {
          to: movie.user.email,
          movie: {
            title: movie.title,
            tagline: movie.tagline,
            description: movie.description,
            releaseDate: newDate.toISOString(),
            linkPreview: movie.linkPreview,
            imagePoster: movie.imagePoster,
          },
        });

        await prisma.movie.update({
          where: { id },
          data: { scheduleName },
        });
      } else {
        if (existing.scheduleName) {
          await deleteEmailSchedule(existing.scheduleName);
          await prisma.movie.update({
            where: { id },
            data: { scheduleName: null },
          });
        }
      }
    }
  }

  return movie;
};

export const deleteMovie = async (id: number, userId?: number) => {
  const existing = await prisma.movie.findUnique({
    where: { id },
    include: { user: true, genres: true },
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

  await prisma.movieGenre.deleteMany({
    where: { movieId: id },
  });

  const images = [existing.imageCover, existing.imagePoster].filter(Boolean);
  for (const img of images) {
    try {
      const key = img!.split(
        `https://${process.env.AWS_BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/`
      )[1];
      await s3.send(
        new DeleteObjectCommand({
          Bucket: process.env.AWS_BUCKET_NAME!,
          Key: key,
        })
      );
    } catch (err) {
      console.warn("Falha ao deletar imagem do S3:", err);
    }
  }

  await prisma.movie.delete({
    where: { id },
  });

  return { message: "Filme e imagens deletados com sucesso." };
};
