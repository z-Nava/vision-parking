// /validation/auth.ts
import { z } from "zod";

const PASSWORD_REGEX =
  /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{12,32}$/;

export const registerSchema = z.object({
  usr_name: z
    .string()
    .trim()
    .min(4, "Mínimo 4 caracteres")
    .max(30, "Máximo 30 caracteres"),
  usr_email: z
    .string()
    .trim()
    .email("Correo inválido")
    .min(10, "Mínimo 10 caracteres")
    .max(45, "Máximo 45 caracteres"),
  usr_password: z
    .string()
    .min(12, "Mínimo 12 caracteres")
    .max(32, "Máximo 32 caracteres")
    .refine((val) => PASSWORD_REGEX.test(val), {
      message:
        "Debe incluir minúscula, mayúscula, número y símbolo (@$!%*?&), longitud 12–32",
    }),
});

export type RegisterForm = z.infer<typeof registerSchema>;
