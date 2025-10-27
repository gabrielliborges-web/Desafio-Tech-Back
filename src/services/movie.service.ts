import { Prisma, PrismaClient, MovieStatus, Visibility } from "@prisma/client";
import {
  movieSchema,
  movieUpdateSchema,
  movieFilterSchema,
  type MovieInput,
} from "../validators/movie.validator";

const prisma = new PrismaClient();

export const createMovie = async (data: MovieInput) => {
  const parsed = movieSchema.parse(data);

  const movie = await prisma.movie.create({
    data: {
      ...parsed,
      releaseDate: parsed.releaseDate
        ? new Date(parsed.releaseDate)
        : undefined,
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

  console.log(userId);

  const page = Number(parsed.page) || 1;
  const limit = Number(parsed.limit) || 10;
  const skip = (page - 1) * limit;

  const where: Prisma.MovieWhereInput = {
    ...(parsed.search && {
      OR: [
        { title: { contains: parsed.search, mode: "insensitive" } },
        { originalTitle: { contains: parsed.search, mode: "insensitive" } },
        { tagline: { contains: parsed.search, mode: "insensitive" } },
      ],
    }),
    ...(parsed.visibility && {
      visibility: parsed.visibility as Visibility,
    }),
    ...(parsed.genre && {
      genres: {
        some: {
          genre: {
            name: { equals: parsed.genre, mode: Prisma.QueryMode.insensitive },
          },
        },
      },
    }),
  };

  if (parsed.status === "DRAFT") {
    where.status = "DRAFT";
    if (userId) where.userId = Number(userId);
  } else if (parsed.status === "PUBLISHED") {
    where.status = "PUBLISHED";
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

export const updateMovie = async (id: number, data: Partial<MovieInput>) => {
  const parsed = movieUpdateSchema.parse(data);

  const existing = await prisma.movie.findUnique({
    where: { id },
  });

  if (!existing) throw new Error("Filme não encontrado.");

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

export const deleteMovie = async (id: number) => {
  const existing = await prisma.movie.findUnique({
    where: { id },
    include: { genres: true },
  });

  if (!existing) throw new Error("Filme não encontrado.");

  await prisma.movie.delete({
    where: { id },
  });

  return { message: "Filme deletado com sucesso." };
};
