// /services/vehicleService.ts
import api from "./api";

export async function getUserVehicles(usr_id: string) {
  const { data } = await api.get(`/users/${usr_id}/vehicles`);
  return data?.data ?? [];
}

export async function createVehicle(payload: {
  usr_id: string;
  veh_plate: string;
  veh_brand: string;
  veh_model: string;
  veh_year: number;
  veh_color: string;
}) {
  try {
    const { data } = await api.post("/vehicles", payload);
    return data;
  } catch (e: any) {
    const p = e?.response?.data || {};
    const err = new Error(p?.message || "No se pudo guardar el vehículo");
    (err as any).code = p?.code;     // p.ej., LNG011 (placa duplicada), VAL011 (formato)
    (err as any).field = p?.field;   // si el backend lo envía
    (err as any).detail = p?.detail;
    throw err;
  }
}
