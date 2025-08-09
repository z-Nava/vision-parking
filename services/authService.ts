// services/authService.ts
import api from './api';

/** LOGIN */
export const login = async (email: string, password: string) => {
  const platform = 'VISION_PARKING_MOVIL';
  try {
    const { data } = await api.post('/signin', {
      usr_email: email,
      usr_password: password,
      pry_name: platform,
    });
    return data; // { message, data: { usr_id, usr_email } }
  } catch (e: any) {
    const payload = e?.response?.data || {};
    const err = new Error(payload?.message || 'Error al iniciar sesión');
    (err as any).code = payload?.code;
    (err as any).field = payload?.field;
    (err as any).detail = payload?.detail;
    throw err;
  }
};

/** REGISTER */
export const register = async (name: string, email: string, password: string) => {
  const platform = 'VISION_PARKING_MOVIL';
  try {
    const { data } = await api.post('/signup', {
      usr_name: name,
      usr_email: email,
      usr_password: password,
      pry_name: platform,
    });
    return data;
  } catch (e: any) {
    const payload = e?.response?.data || {};
    const err = new Error(payload?.message || 'Error en el registro');
    (err as any).code = payload?.code;
    (err as any).field = payload?.field;
    (err as any).detail = payload?.detail;
    throw err;
  }
};

/** VERIFY CODE */
export const verifyCode = async (usr_id: string, cod_code: number) => {
  try {
    const { data } = await api.post('/verify', { usr_id, cod_code });
    return data; // esperado: { tok_token } o { data: { tok_token } }
  } catch (e: any) {
    const payload = e?.response?.data || {};
    const err = new Error(payload?.message || 'Error al verificar código');
    (err as any).code = payload?.code;   // AUTH011/012/013...
    (err as any).field = payload?.field;
    (err as any).detail = payload?.detail;
    throw err;
  }
};

/** CHECK CONFIGURATED */
export const getConfigurated = async (usr_id: string) => {
  try {
    const { data } = await api.get(`/configurated/${usr_id}`);
    return data; // { isConfigurated: boolean }
  } catch (e: any) {
    const payload = e?.response?.data || {};
    const err = new Error(payload?.message || 'Error al consultar configuración');
    (err as any).code = payload?.code;
    throw err;
  }
};
