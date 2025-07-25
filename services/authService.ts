// services/authService.ts
import api from './api';

export const login = async (email: string, password: string) => {
  const response = await api.post('/login', { email, password });
  return response.data;
};

export const register = async (name: string, email: string, password: string) => {
  const response = await api.post('/signup', {
    usr_name: name,
    usr_email: email,
    usr_password: password,
  });

  return response.data;
};


// Agrega logout o perfil si tu API lo soporta
