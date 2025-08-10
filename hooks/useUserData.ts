// hooks/useUserData.ts
import { useEffect, useState } from 'react';
import * as SecureStore from 'expo-secure-store';
import api from '../services/api';

export function useUserData() {
  const [userId, setUserId] = useState<string | null>(null);
  const [username, setUsername] = useState<string>(''); 
  const [email, setEmail] = useState<string>(''); 
  const [vehicles, setVehicles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [hasAccess, setHasAccess] = useState(false);
  const [companies, setCompanies] = useState<any[]>([]);

  const [companyName, setCompanyName] = useState<string | null>(null);
  const [companyId, setCompanyId] = useState<string | null>(null);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        console.log('useUserData: Iniciando carga de datos del usuario...');
        const usr_id = await SecureStore.getItemAsync('usr_id');
        const token = await SecureStore.getItemAsync('auth_token');
        if (!usr_id || !token) throw new Error('No auth data');

        setUserId(usr_id);

        // Obtener info del usuario (nombre)
        const userRes = await api.get(`/info/${usr_id}`);
        setUsername(userRes.data?.usr_name || 'Usuario');
        setEmail(userRes.data?.usr_email || ''); 


        // Obtener vehículos
        const vehRes = await api.get(`/users/${usr_id}/vehicles`);
        setVehicles(vehRes.data?.data || []);

        // Obtener compañías vinculadas
        const companiesRes = await api.get(`/users/${usr_id}/companies`);
        const companyList = companiesRes.data || [];

        setCompanies(companyList);
        setHasAccess(companyList.length > 0);

        // Si hay alguna compañía, guarda nombre e ID
        if (companyList.length > 0) {
          setCompanyName(companyList[0].cmp_name || null);
          setCompanyId(companyList[0].cmp_id || null);
        }
      } catch (err) {
        console.error('Error al obtener datos del usuario:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, []);

  return {
    userId,
    username,
    email,
    vehicles,
    loading,
    hasAccess,
    companies,
    companyName,
    companyId, // <- ahora lo puedes usar directamente para pedir los cajones
  };
}
