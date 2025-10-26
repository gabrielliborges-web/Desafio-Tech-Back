import jwt from "jsonwebtoken";
import { env } from "../config/env";

type Payload = { sub: string };

export function signSession(userId: string) {
  return jwt.sign({ sub: userId } as Payload, env.JWT_SECRET, {
    expiresIn: `${env.SESSION_EXPIRES_DAYS}d`,
  });
}

export function verifyToken(token: string) {
  return jwt.verify(token, env.JWT_SECRET) as Payload;
}
