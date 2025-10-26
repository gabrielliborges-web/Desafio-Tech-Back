import { z } from "zod";

export const signupSchema = z.object({
  name: z.string().min(3, "O nome deve ter pelo menos 3 caracteres."),
  email: z.string().email("E-mail inválido."),
  password: z
    .string()
    .min(8, "A senha deve ter pelo menos 8 caracteres.")
    .regex(/[A-Z]/, "A senha deve conter pelo menos uma letra maiúscula.")
    .regex(/[a-z]/, "A senha deve conter pelo menos uma letra minúscula.")
    .regex(/[0-9]/, "A senha deve conter pelo menos um número.")
    .regex(/[@$!%*?&]/, "A senha deve conter pelo menos um símbolo especial."),
  theme: z.enum(["LIGHT", "DARK"]).optional().default("LIGHT"),
});

export const loginSchema = z.object({
  email: z.string().email("E-mail inválido."),
  password: z.string().min(8, "Senha deve ter pelo menos 8 caracteres."),
});

export type SignupInput = z.infer<typeof signupSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
