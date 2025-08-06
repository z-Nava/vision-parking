import api from './api';
import * as SecureStore from 'expo-secure-store';

export const getUserInfo = async () => {
  const usr_id = await SecureStore.getItemAsync('usr_id');
  const token = await SecureStore.getItemAsync('token');

  if (!usr_id || !token) {
    throw new Error('Usuario no autenticado.');
  }

  const response = await api.get(`/users/${usr_id}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  return response.data.data;
};
