import bcrypt from "bcrypt";
import { signSession } from "../utils/jwt";
import { PrismaClient } from "@prisma/client";
import {
  LoginInput,
  loginSchema,
  SignupInput,
  signupSchema,
} from "../validators/auth.schema";

const prisma = new PrismaClient();

export const signup = async (data: SignupInput) => {
  const parsed = signupSchema.parse(data);

  const existing = await prisma.user.findUnique({
    where: { email: parsed.email },
  });
  if (existing) throw new Error("E-mail já cadastrado.");

  const hashed = await bcrypt.hash(parsed.password, 10);

  const user = await prisma.user.create({
    data: { ...parsed, password: hashed },
  });

  const token = signSession(user.id);
  return { user, token };
};

export const login = async (data: LoginInput) => {
  const parsed = loginSchema.parse(data);

  const user = await prisma.user.findUnique({ where: { email: parsed.email } });
  if (!user) throw new Error("Usuário não encontrado.");

  const valid = await bcrypt.compare(parsed.password, user.password);
  if (!valid) throw new Error("Senha incorreta.");

  const token = signSession(user.id);

  return { user, token };
};
