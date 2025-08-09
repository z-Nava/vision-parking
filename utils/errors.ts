// /utils/errors.ts
import type { FieldValues, UseFormSetError, Path } from "react-hook-form";

export function mapApiErrorToForm<T extends FieldValues>(
  err: any,
  setError: UseFormSetError<T>
) {
  const code: string | undefined = err?.code;
  const field = err?.field as Path<T> | undefined;
  const message: string | undefined = err?.message;

  // Si la API envía el campo, úsalo directo
  if (field) {
    setError(field, { message: message ?? "Dato inválido" });
    return true;
  }

  // Compatibilidad con tus códigos más comunes sin 'field'
  if (code === "AUTH002") {
    setError("usr_email" as Path<T>, { message: message ?? "Correo ya registrado" });

    return true;
  }
  if (code === "AUTH008") {
    setError("usr_name" as Path<T>, { message: message ?? "Usuario ya existe" });
    return true;
  }
  if (code === "AUTH001") {
    // credenciales incorrectas → lo pegamos en password
    setError("usr_password" as Path<T>, { message: message ?? "Credenciales incorrectas" });
    return true;
  }
   if (code === "AUTH011" || code === "AUTH012" || code === "AUTH013") {
    setError("cod_code" as Path<T>, { message: message ?? "Código inválido o expirado" });
    return true;
  }
  if (code === "LNG025") { // ya existe una solicitud pendiente
    setError("cma_description" as Path<T>, { message: message ?? "Ya existe una solicitud pendiente" });
    return true;
  }

  // Otros códigos → que el caller muestre alerta global
  return false;
}
