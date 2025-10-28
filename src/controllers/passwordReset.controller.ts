import { Request, Response } from "express";
import * as PasswordResetService from "../services/passwordReset.service";

export const sendResetCode = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { email } = req.body;
    if (!email) {
      res.status(400).json({ error: "E-mail é obrigatório." });
      return;
    }

    const result = await PasswordResetService.sendResetCode(email);
    res.status(200).json(result);
  } catch (err: any) {
    console.error("Erro ao enviar código:", err);
    res.status(err.statusCode || 500).json({ error: err.message });
    return;
  }
};

export const validateCode = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { email, code } = req.query;
    if (!email || !code) {
      res.status(400).json({ error: "E-mail e código são obrigatórios." });
      return;
    }

    const result = await PasswordResetService.validateResetCode(
      String(email),
      String(code)
    );
    res.status(200).json(result);
  } catch (err: any) {
    console.error("Erro ao validar código:", err);
    res.status(err.statusCode || 500).json({ error: err.message });
  }
};

export const resetPassword = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { email, code, newPassword } = req.body;
    if (!email || !code || !newPassword) {
      res
        .status(400)
        .json({ error: "E-mail, código e nova senha são obrigatórios." });
      return;
    }
    const result = await PasswordResetService.resetPassword(
      email,
      code,
      newPassword
    );
    res.status(200).json(result);
  } catch (err: any) {
    console.error("Erro ao redefinir senha:", err);
    res.status(err.statusCode || 500).json({ error: err.message });
  }
};
