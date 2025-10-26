import { RequestHandler } from "express";
import { verifyToken } from "../utils/jwt";

export const requireAuth: RequestHandler = (req, res, next) => {
  const authHeader = req.headers.authorization;
  const token = authHeader?.split(" ")[1];

  if (!token) {
    res.status(401).json({ error: "Token não fornecido." });
    return;
  }

  try {
    const decoded = verifyToken(token);
    (req as any).userId = decoded.sub;
    next();
  } catch {
    res.status(401).json({ error: "Token inválido ou expirado." });
  }
};
