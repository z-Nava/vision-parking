// hooks/useUserData.ts
import { useEffect, useState } from 'react';
import * as SecureStore from 'expo-secure-store';
import api from '../services/api';

export function useUserData() {
  const [userId, setUserId] = useState<string | null>(null);
  const [username, setUsername] = useState<string>('');
  const [vehicles, setVehicles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        console.log('useUserData: Iniciando carga de datos del usuario...');
        const usr_id = await SecureStore.getItemAsync('usr_id');
        console.log('useUserData: ID de usuario obtenido:', usr_id);
        const token = await SecureStore.getItemAsync('auth_token');
        console.log('useUserData: Token obtenido:', token);
        if (!usr_id || !token) throw new Error('No auth data');

        setUserId(usr_id);

        // Obtener info del usuario (nombre)
        const userRes = await api.get(`/users/${usr_id}`);
        console.log('useUserData: Datos del usuario obtenidos:', userRes.data);
        setUsername(userRes.data?.usr_name || 'Usuario');
        console.log('useUserData: Nombre de usuario establecido:', userRes.data?.usr_name || 'Usuario');

        // Obtener vehículos
        const vehRes = await api.get(`/users/${usr_id}/vehicles`);
        console.log('useUserData: Vehículos obtenidos:', vehRes.data);
        setVehicles(vehRes.data?.data || []);
      } catch (err) {
        console.error('Error al obtener datos del usuario:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, []);

  return { userId, username, vehicles, loading };
}
