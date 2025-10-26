import { Request, Response, NextFunction } from "express";
import { verifyToken } from "../utils/jwt";

export function requireAuth(req: Request, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  const token = authHeader?.split(" ")[1];

  if (!token) {
    return res.status(401).json({ error: "Token não fornecido." });
  }

  try {
    const decoded = verifyToken(token);

    (req as any).userId = decoded.sub;

    next();
  } catch (err) {
    return res.status(401).json({ error: "Token inválido ou expirado." });
  }
}
