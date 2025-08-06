// services/authService.ts
import api from './api';

export const login = async (email: string, password: string) => {
  const platform = 'VISION_PARKING_MOVIL';
  console.log('Iniciando sesión con:', { email, password, platform });
  const { data } = await api.post('/signin', {
    usr_email: email,
    usr_password: password,
    pry_name: platform,
  });
  console.log('Respuesta del login:', data);
  return data;
};


export const register = async (name: string, email: string, password: string) => {
  const platform = 'VISION_PARKING_MOVIL';
  console.log('Registrando usuario:', { name, email, password, platform });
  const {data} = await api.post('/signup', {
    usr_name: name,
    usr_email: email,
    usr_password: password,
    pry_name: platform,
  });
  console.log('Respuesta del registro:', data);
  return data;
};


// Agrega logout o perfil si tu API lo soporta
 