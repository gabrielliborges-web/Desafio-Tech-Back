import jwt from "jsonwebtoken";
import { env } from "../config/env";

type Payload = { id: string | number };

export function signSession(userId: string | number) {
  return jwt.sign({ id: userId } as Payload, env.JWT_SECRET, {
    expiresIn: `${env.SESSION_EXPIRES_DAYS}d`,
  });
}

export function verifyToken(token: string) {
  return jwt.verify(token, env.JWT_SECRET) as Payload;
}
