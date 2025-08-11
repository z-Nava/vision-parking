// hooks/useUserData.ts
import { useEffect, useState } from 'react';
import * as SecureStore from 'expo-secure-store';
import api from '../services/api';

export function useUserData() {
  const [userId, setUserId] = useState<string | null>(null);
  const [username, setUsername] = useState<string>('');
  const [email, setEmail] = useState<string>('');
  const [vehicles, setVehicles] = useState<any[]>([]);
  const [companies, setCompanies] = useState<any[]>([]);
  const [hasAccess, setHasAccess] = useState(false);

  const [companyName, setCompanyName] = useState<string | null>(null);
  const [companyId, setCompanyId] = useState<string | null>(null);

  const [reservations, setReservations] = useState<any[]>([]);
  const [loadingReservations, setLoadingReservations] = useState(false);

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    const fetchUserData = async () => {
      try {
        console.log('useUserData: Iniciando carga de datos del usuario...');
        const usr_id = await SecureStore.getItemAsync('usr_id');
        const token = await SecureStore.getItemAsync('auth_token');

        // Si aún no hay sesión, salimos limpio
        if (!usr_id || !token) {
          if (mounted) {
            setLoading(false);
          }
          console.warn('useUserData: No auth data (usr_id/token).');
          return;
        }

        const headers = { Authorization: `Bearer ${token}` };
        if (mounted) setUserId(usr_id);

        // 1) Info de usuario
        const userRes = await api.get(`/info/${usr_id}`, { headers });
        if (mounted) {
          setUsername(userRes.data?.usr_name || 'Usuario');
          setEmail(userRes.data?.usr_email || '');
        }

        // 2) Vehículos
        const vehRes = await api.get(`/users/${usr_id}/vehicles`, { headers });
        if (mounted) setVehicles(vehRes.data?.data || vehRes.data || []);

        // 3) Compañías
        const companiesRes = await api.get(`/users/${usr_id}/companies`, { headers });
        const companyList = companiesRes?.data?.data ?? companiesRes?.data ?? [];
        if (mounted) {
          setCompanies(companyList);
          setHasAccess(companyList.length > 0);
          if (companyList.length > 0) {
            setCompanyName(companyList[0].cmp_name || null);
            setCompanyId(companyList[0].cmp_id || null);
          }
        }

        // 4) Reservas
        try {
          if (mounted) setLoadingReservations(true);
          const rsvRes = await api.get(`/users/${usr_id}/reservations`, { headers });
          const list = rsvRes?.data?.data ?? rsvRes?.data ?? [];
          if (mounted) setReservations(Array.isArray(list) ? list : []);
        } finally {
          if (mounted) setLoadingReservations(false);
        }
      } catch (err: any) {
        // Si el backend devuelve 401/403, probablemente token inválido/expirado
        const status = err?.response?.status;
        if (status === 401 || status === 403) {
          console.warn('useUserData: sesión inválida. Considera redirigir a /');
        }
        console.error('Error al obtener datos del usuario:', err);
      } finally {
        if (mounted) setLoading(false);
      }
    };

    fetchUserData();
    return () => { mounted = false; };
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
    companyId,
    reservations,
    loadingReservations,
  };
}
