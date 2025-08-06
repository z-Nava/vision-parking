// utils/clearSession.ts
import * as SecureStore from 'expo-secure-store';

export const clearSession = async () => {
  try {
    await SecureStore.deleteItemAsync('auth_token');
    await SecureStore.deleteItemAsync('usr_id');

    console.log('✅ Sesión eliminada correctamente');
  } catch (error) {
    console.error('❌ Error al borrar la sesión:', error);
  }
};
