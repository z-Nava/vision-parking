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

export const signinSchema = z.object({
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
    .refine((v) => PASSWORD_REGEX.test(v), {
      message:
        "Debe incluir minúscula, mayúscula, número y símbolo (@$!%*?&), longitud 12–32",
    }),
});

export const verifyCodeSchema = z.object({
  cod_code: z
    .string()
    .trim()
    .min(6, "Debe tener 6 dígitos").max(6, "Debe tener 6 dígitos")
    .regex(/^\d+$/, "Solo números"),
});

export type RegisterForm = z.infer<typeof registerSchema>;
export type VerifyCodeForm = z.infer<typeof verifyCodeSchema>;
export type SigninForm = z.infer<typeof signinSchema>;
