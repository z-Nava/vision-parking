import { z } from "zod";

// AAA-000-A (9 chars incl. guiones)
const PLATE_REGEX = /^[A-Z]{3}-\d{3}-[A-Z]$/;

export const vehicleSchema = z.object({
  veh_brand: z.string().trim()
    .min(2, "Marca demasiado corta")
    .max(50, "Máximo 50 caracteres"),
  veh_model: z.string().trim()
    .min(1, "Modelo requerido") // si quieres 2: cambia a .min(2)
    .max(50, "Máximo 50 caracteres"),
  veh_year: z.string().trim()
    .regex(/^\d{4}$/, "Año inválido (4 dígitos)")
    .refine((y) => {
      const n = Number(y);
      const thisYear = new Date().getFullYear();
      return n >= 1980 && n <= thisYear + 1;
    }, "Año fuera de rango"),
  veh_color: z.string().trim()
    .min(3, "Color demasiado corto") // <- antes era 1
    .max(30, "Máximo 30 caracteres"),
  veh_plate: z.string().trim()
    .transform((v) => v.toUpperCase())
    .refine((v) => PLATE_REGEX.test(v), "Formato de placa inválido (AAA-000-A)"),
});

export type VehicleForm = z.infer<typeof vehicleSchema>;
