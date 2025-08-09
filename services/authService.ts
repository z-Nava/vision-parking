// /services/authService.ts
import api from './api';

export const login = async (email: string, password: string) => {
  const platform = 'VISION_PARKING_MOVIL';
  console.log('Iniciando sesión con:', { email, platform });
  try {
    const { data } = await api.post('/signin', {
      usr_email: email,
      usr_password: password,
      pry_name: platform,
    });
    return data;
  } catch (e: any) {
    const payload = e?.response?.data || {};
    const err = new Error(payload?.message || 'Error al iniciar sesión');
    (err as any).code = payload?.code;
    (err as any).field = payload?.field;
    (err as any).detail = payload?.detail;
    throw err;
  }
};

export const register = async (name: string, email: string, password: string) => {
  const platform = 'VISION_PARKING_MOVIL';
  console.log('Registrando usuario:', { name, email, platform });
  try {
    const { data } = await api.post('/signup', {
      usr_name: name,
      usr_email: email,
      usr_password: password,
      pry_name: platform,
    });
    console.log('Respuesta del registro:', data);
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
