import { Response } from "express";
import { AuthenticatedRequest } from "../middlewares/auth.middleware";
import * as UserService from "../services/user.service";

export const updateTheme = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  try {
    const userId = req.user?.id;
    const { theme } = req.body;

    const result = await UserService.updateTheme(userId, theme);
    res.status(200).json(result);
  } catch (error: any) {
    console.error("Erro ao atualizar tema:", error.message);

    res.status(error.statusCode || 400).json({
      error: error.message || "Erro ao atualizar tema do usuário.",
    });
  }
};
