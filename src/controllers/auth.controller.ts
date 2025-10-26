import { Request, Response } from "express";
import * as AuthService from "../services/auth.service";
import { z } from "zod";
import { signupSchema, loginSchema } from "../validators/auth.schema";

export const signup = async (req: Request, res: Response): Promise<void> => {
  try {
    const parsed = signupSchema.parse(req.body);

    const result = await AuthService.signup(parsed);

    res.status(201).json(result);
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

export const login = async (req: Request, res: Response): Promise<void> => {
  try {
    const parsed = loginSchema.parse(req.body);

    const result = await AuthService.login(parsed);

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
