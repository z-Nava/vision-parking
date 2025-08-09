// /validation/parking.ts
import { z } from "zod";

const ALLOWED_TYPES = ["application/pdf", "image/png", "image/jpeg"] as const;

export const accessRequestSchema = z.object({
  cma_description: z
    .string()
    .trim()
    .min(5, "Describe brevemente el motivo (mínimo 5 caracteres)")
    .max(500, "Máximo 500 caracteres"),
  file: z
    .any()
    .refine(
      (f) => f && f.uri && f.name && (f.mimeType || f.type),
      "Archivo requerido"
    )
    .refine(
      (f) => ALLOWED_TYPES.includes(f?.mimeType || f?.type),
      "Solo PDF, PNG o JPG"
    ),
});

export type AccessRequestForm = z.infer<typeof accessRequestSchema>;
