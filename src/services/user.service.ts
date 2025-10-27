import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export const updateTheme = async (
  userId?: number,
  theme?: "LIGHT" | "DARK"
) => {
  if (!userId) {
    const error: any = new Error("Usuário não autenticado.");
    error.statusCode = 401;
    throw error;
  }

  if (!theme || !["LIGHT", "DARK"].includes(theme)) {
    const error: any = new Error(
      "Tema inválido. Valores permitidos: LIGHT ou DARK."
    );
    error.statusCode = 400;
    throw error;
  }

  const user = await prisma.user.findUnique({ where: { id: userId } });

  if (!user) {
    const error: any = new Error("Usuário não encontrado.");
    error.statusCode = 404;
    throw error;
  }

  const updatedUser = await prisma.user.update({
    where: { id: userId },
    data: { theme },
    select: {
      id: true,
      name: true,
      email: true,
      theme: true,
      updatedAt: true,
    },
  });

  return {
    message: "Tema atualizado com sucesso.",
    user: updatedUser,
  };
};
