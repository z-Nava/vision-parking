// services/authService.ts
import api from './api';

export const login = async (email: string, password: string) => {
  const { data } = await api.post('/signin', {
    usr_email: email,
    usr_password: password,
  });
  return data;
};


export const register = async (name: string, email: string, password: string) => {
  const {data} = await api.post('/signup', {
    usr_name: name,
    usr_email: email,
    usr_password: password,
  });

  return data;
};


// Agrega logout o perfil si tu API lo soporta
