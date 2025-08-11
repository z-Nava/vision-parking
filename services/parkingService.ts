// services/parkingService.ts
import * as SecureStore from 'expo-secure-store';
import api from './api';

type ApiShape<T> = { data?: T } | T;

function unwrap<T>(res: any): T {
  return (res?.data?.data ?? res?.data ?? res) as T;
}

async function authHeaders() {
  const token = await SecureStore.getItemAsync('auth_token');
  if (!token) throw new Error('Sesión expirada. Inicia sesión nuevamente.');
  return { Authorization: `Bearer ${token}` };
}

/** Crear solicitud de acceso a compañía */
export async function createAccessRequest(
  usr_id: string,
  cmp_id: string,
  cma_description: string
): Promise<ApiShape<{ cma_id: string }>> {
  try {
    const headers = await authHeaders();
    const res = await api.post(
      '/company-access-requests',
      { usr_id, cmp_id, cma_description },
      { headers }
    );
    return unwrap<{ cma_id: string }>(res);
  } catch (e: any) {
    const payload = e?.response?.data || {};
    const err = new Error(payload?.message || 'Error al registrar la solicitud');
    (err as any).code = payload?.code;    // p.ej. LNG025/LNG026 o VALxxx
    (err as any).field = payload?.field;  // si tu backend lo envía
    (err as any).detail = payload?.detail;
    throw err;
  }
}

/** Subir archivo ligado a la solicitud (fil_relation_id = cma_id) */
export async function uploadAccessFile(
  file: { uri: string; name?: string; mimeType?: string; type?: string } | any,
  fil_relation_id: string
): Promise<ApiShape<{ fil_id: string }>> {
  const formData = new FormData();
  formData.append('file', {
    uri: file?.uri,
    name: file?.name || 'evidencia',
    type: file?.mimeType || file?.type || 'application/octet-stream',
  } as any);
  formData.append('fil_relation_id', String(fil_relation_id));

  try {
    const headers = await authHeaders();
    const res = await api.post('/files/upload', formData, {
      headers: {
        ...headers,
        'Content-Type': 'multipart/form-data',
      },
    });
    return unwrap<{ fil_id: string }>(res);
  } catch (e: any) {
    const payload = e?.response?.data || {};
    const err = new Error(payload?.message || 'Error al subir el archivo');
    (err as any).code = payload?.code;
    (err as any).detail = payload?.detail;
    throw err;
  }
}
