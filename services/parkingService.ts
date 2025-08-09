// /services/parkingService.ts
import api from "./api";

export async function createAccessRequest(usr_id: string, cmp_id: string, cma_description: string) {
  try {
    const { data } = await api.post("/company-access-requests", {
      usr_id,
      cmp_id,
      cma_description,
    });
    return data; // esperado: { data: { cma_id } }
  } catch (e: any) {
    const payload = e?.response?.data || {};
    const err = new Error(payload?.message || "Error al registrar la solicitud");
    (err as any).code = payload?.code;   // p.ej. LNG025/LNG026 o VALxxx
    (err as any).field = payload?.field; // si tu backend lo envía
    (err as any).detail = payload?.detail;
    throw err;
  }
}

export async function uploadAccessFile(file: any, fil_relation_id: string) {
  const formData = new FormData();
  formData.append("file", {
    uri: file.uri,
    name: file.name,
    type: file.mimeType || file.type || "application/octet-stream",
  } as any);
  formData.append("fil_relation_id", String(fil_relation_id));

  try {
    const { data } = await api.post("/files/upload", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return data;
  } catch (e: any) {
    const payload = e?.response?.data || {};
    const err = new Error(payload?.message || "Error al subir el archivo");
    (err as any).code = payload?.code;
    (err as any).detail = payload?.detail;
    throw err;
  }
}
