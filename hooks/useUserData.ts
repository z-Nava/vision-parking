// hooks/useUserData.ts
import { useEffect, useState, useCallback, useRef } from 'react';
import * as SecureStore from 'expo-secure-store';
import api from '../services/api';
import { useFocusEffect } from 'expo-router';

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

  const mountedRef = useRef(true);
  useEffect(() => {
    return () => { mountedRef.current = false; };
  }, []);

  const refreshUserData = useCallback(async () => {
    try {
      setLoading(true);
      const usr_id = await SecureStore.getItemAsync('usr_id');
      const token = await SecureStore.getItemAsync('auth_token');

      if (!usr_id || !token) {
        if (mountedRef.current) {
          setUserId(null);
          setUsername('');
          setEmail('');
          setVehicles([]);
          setCompanies([]);
          setHasAccess(false);
          setCompanyName(null);
          setCompanyId(null);
          setReservations([]);
        }
        return;
      }

      const headers = { Authorization: `Bearer ${token}` };
      if (mountedRef.current) setUserId(usr_id);

      // 1) Info de usuario
      const userRes = await api.get(`/info/${usr_id}`, { headers });
      if (mountedRef.current) {
        setUsername(userRes.data?.usr_name || 'Usuario');
        setEmail(userRes.data?.usr_email || '');
      }

      // 2) Vehículos
      const vehRes = await api.get(`/users/${usr_id}/vehicles`, { headers });
      if (mountedRef.current) setVehicles(vehRes.data?.data || vehRes.data || []);

      // 3) Compañías
      const companiesRes = await api.get(`/users/${usr_id}/companies`, { headers });
      const companyList = companiesRes?.data?.data ?? companiesRes?.data ?? [];
      if (mountedRef.current) {
        setCompanies(companyList);
        setHasAccess(companyList.length > 0);
        if (companyList.length > 0) {
          setCompanyName(companyList[0].cmp_name || null);
          setCompanyId(companyList[0].cmp_id || null);
        } else {
          setCompanyName(null);
          setCompanyId(null);
        }
      }

      // 4) Reservas
      try {
        if (mountedRef.current) setLoadingReservations(true);
        const rsvRes = await api.get(`/users/${usr_id}/reservations`, { headers });
        const list = rsvRes?.data?.data ?? rsvRes?.data ?? [];
        if (mountedRef.current) setReservations(Array.isArray(list) ? list : []);
      } finally {
        if (mountedRef.current) setLoadingReservations(false);
      }
    } catch (err: any) {
      const status = err?.response?.status;
      if (status === 401 || status === 403) {
        console.warn('useUserData: sesión inválida (401/403).');
      }
      console.error('useUserData error:', err?.response?.data || err?.message || err);
    } finally {
      if (mountedRef.current) setLoading(false);
    }
  }, []);

  // Carga inicial
  useEffect(() => {
    refreshUserData();
  }, [refreshUserData]);

  // Recarga al ganar foco (clave para tabs / volver desde config)
  useFocusEffect(
    useCallback(() => {
      refreshUserData();
      // no cleanup necesario aquí
    }, [refreshUserData])
  );

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
    refreshUserData, // por si quieres refrescar manualmente
  };
}
