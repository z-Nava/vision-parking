// app/home/indexapp.tsx
import React, { useEffect, useState, useCallback, useMemo } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import BottomNav from '../../components/BottomNav';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useUserData } from '../../hooks/useUserData';
import * as SecureStore from 'expo-secure-store';
import api from '../../services/api';

// ⬇️ usa tu componente
import SpotCard from '../../components/SpotCard';

export default function HomeScreen() {
  const router = useRouter();
  const { username, vehicles, loading, hasAccess, companies } = useUserData();

  // params desde show-parking (opcional)
  const params = useLocalSearchParams();
  const cmpIdFromNav = Array.isArray(params?.cmp_id) ? params.cmp_id[0] : (params?.cmp_id as string | undefined);
  const cmpNameFromNav = Array.isArray(params?.cmp_name) ? params.cmp_name[0] : (params?.cmp_name as string | undefined);

  const [activeCmpId, setActiveCmpId] = useState<string | null>(null);
  const [activeCmpName, setActiveCmpName] = useState<string | null>(null);

  const [parkingLots, setParkingLots] = useState<any[]>([]);
  const [refreshing, setRefreshing] = useState(false);

  // acceso local para ocultar alerta cuando el backend te acepte
  const [localHasAccess, setLocalHasAccess] = useState<boolean>(hasAccess);

  const counters = useMemo(() => {
  const acc = { disponibles: 0, reservados: 0, ocupados: 0, total: 0 };
    for (const lot of parkingLots || []) {
      for (const spot of lot?.parking_spots || []) {
        const s = spot?.status?.stu_name;
        if (s === 'Inactivo') continue; // excluye inactivos
        acc.total += 1;
        if (s === 'Disponible') acc.disponibles += 1;
        else if (s === 'Reservado') acc.reservados += 1;
        else if (s === 'Ocupado') acc.ocupados += 1;
      }
    }
    return acc;
  }, [parkingLots]);
  
  useEffect(() => setLocalHasAccess(hasAccess), [hasAccess]);

  // decide compañía activa: 1) params, 2) primera del hook
  useEffect(() => {
    if (cmpIdFromNav) {
      setActiveCmpId(cmpIdFromNav);
      setActiveCmpName(cmpNameFromNav || null);
    } else {
      const first = companies?.[0];
      setActiveCmpId(first?.cmp_id ?? null);
      setActiveCmpName(first?.cmp_name ?? null);
    }
  }, [cmpIdFromNav, cmpNameFromNav, companies]);

  /** Helper para inyectar el Bearer desde esta vista (sin interceptores) */
  const getAuthHeaders = useCallback(async () => {
    const token = await SecureStore.getItemAsync('auth_token');
    if (!token) throw new Error('No hay token de sesión. Inicia sesión de nuevo.');
    return { Authorization: `Bearer ${token}` };
  }, []);

  const fetchParkingLots = useCallback(async () => {
    if (!activeCmpId) return;
    try {
      const headers = await getAuthHeaders();
      const res = await api.get(`/companies/${activeCmpId}/parking-lots`, { headers });
      const lots = res?.data?.data ?? res?.data ?? [];
      setParkingLots(lots);
    } catch (err: any) {
      console.error('Error al obtener cajones:', err);
      Alert.alert('Error', err?.message || 'No se pudieron obtener los cajones.');
    }
  }, [activeCmpId, getAuthHeaders]);

  // cargar cajones cuando cambie la compañía activa
  useEffect(() => {
    fetchParkingLots();
  }, [fetchParkingLots]);

  // Colores por estado según tu API (si aún usas en otros lados)
  const getStatusColor = (status?: string) => {
    switch (status) {
      case 'Disponible': return '#2ecc71'; // verde
      case 'Reservado':  return '#1f6feb'; // azul
      case 'Ocupado':    return '#c0392b'; // rojo
      default:           return '#bdc3c7'; // por si acaso
    }
  };
  const isReservable = (status?: string) => status === 'Disponible';

  const handleRefreshAccess = async () => {
    try {
      setRefreshing(true);
      const usr_id = await SecureStore.getItemAsync('usr_id');
      if (!usr_id) throw new Error('No hay usuario en sesión');

      const headers = await getAuthHeaders();
      const res = await api.get(`/users/${usr_id}/companies`, { headers });

      const companiesList = res?.data?.data ?? res?.data ?? [];
      const accepted = Array.isArray(companiesList) && companiesList.length > 0;

      if (accepted) {
        setLocalHasAccess(true);
        await fetchParkingLots();
      }
    } catch (error: any) {
      console.error('Error al refrescar acceso:', error);
      Alert.alert('Error', error?.message || 'No se pudo refrescar el acceso.');
    } finally {
      setRefreshing(false);
    }
  };

  if (loading) {
    return (
      <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color="#FACC15" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView>
        <Text style={styles.title}>VisionParking</Text>
        <Text style={styles.welcome}>Hola! <Text style={styles.username}>{username}</Text></Text>

        {/* Compañía activa */}
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 10 }}>
          <Text style={styles.company}>
            Compañia: <Text style={styles.companyName}>{activeCmpName || 'Sin compañía'}</Text>
          </Text>
        </View>

        {!localHasAccess && (
          <View style={styles.alertBox}>
            <Text style={styles.alertText}>
              Aún no se te ha asignado acceso a ningún estacionamiento. Espera a que un administrador apruebe tu solicitud.
            </Text>
            <TouchableOpacity
              style={styles.refreshButton}
              onPress={handleRefreshAccess}
              disabled={refreshing}
            >
              {refreshing ? (
                <ActivityIndicator size="small" color="#00224D" />
              ) : (
                <Text style={styles.refreshText}>Revisar acceso</Text>
              )}
            </TouchableOpacity>
          </View>
        )}

        {/* Conteos en vivo (sin Inactivo) */}
        

        {localHasAccess && parkingLots.map((lot, idx) => (
          <View key={idx}>
            <Text style={styles.sectionTitle}>Estacionamiento: {lot.pkl_name}</Text>
            {localHasAccess && (
              <View style={styles.countsRow}>
                <View style={[styles.countCard, { borderColor: '#2ecc71' }]}>
                  <Text style={styles.countNumber}>{counters.disponibles}</Text>
                  <Text style={styles.countLabel}>Disponibles</Text>
                </View>
                <View style={[styles.countCard, { borderColor: '#1f6feb' }]}>
                  <Text style={styles.countNumber}>{counters.reservados}</Text>
                  <Text style={styles.countLabel}>Reservados</Text>
                </View>
                <View style={[styles.countCard, { borderColor: '#c0392b' }]}>
                  <Text style={styles.countNumber}>{counters.ocupados}</Text>
                  <Text style={styles.countLabel}>Ocupados</Text>
                </View>
                <View style={[styles.countCard, { borderColor: '#9ca3af' }]}>
                  <Text style={styles.countNumber}>{counters.total}</Text>
                  <Text style={styles.countLabel}>Total</Text>
                </View>
              </View>
            )}
            <View style={styles.cajonesContainer}>
              <ScrollView style={styles.cajonesScroll}>
                {lot.parking_spots
                  ?.filter((spot: any) => spot.status?.stu_name !== 'Inactivo') // ⬅️ solo muestra activos
                  .map((spot: any) => (
                    <SpotCard key={spot.pks_id} spot={spot} lot={lot} />
                  ))}
              </ScrollView>
            </View>
          </View>
        ))}

        {/* Mis vehículos — SIN CAMBIOS */}
        <View style={styles.vehiculosHeader}>
          <Text style={styles.sectionTitle}>Mis vehículos</Text>
          <TouchableOpacity style={styles.addButton} onPress={() => router.push('/vehicle/add')}>
            <Text style={styles.addButtonText}>＋</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.vehiculosContainer}>
          {vehicles.map((vehiculo, index) => (
            <View key={index} style={styles.vehiculoCard}>
              <Text style={styles.placas}>{vehiculo.veh_plate}</Text>
              <Text style={styles.modelo}>{vehiculo.veh_model} {vehiculo.veh_year}</Text>
            </View>
          ))}
        </View>
      </ScrollView>

      <BottomNav />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#00224D', padding: 20, paddingTop: 60 },
  title: { color: '#FACC15', fontSize: 20, fontWeight: 'bold', marginBottom: 6 },
  welcome: { color: '#fff', marginBottom: 10 },
  username: { fontWeight: '700', color: '#fff' },
  company: { color: '#fff' },
  companyName: { color: '#FACC15', fontWeight: '700' },

  alertBox: { backgroundColor: '#001A3D', padding: 12, borderRadius: 10, marginBottom: 12, borderWidth: 1, borderColor: '#0b2a66' },
  alertText: { color: '#fff', marginBottom: 8 },
  refreshButton: { backgroundColor: '#FACC15', paddingVertical: 8, paddingHorizontal: 12, borderRadius: 8, alignSelf: 'flex-start' },
  refreshText: { color: '#00224D', fontWeight: '700' },

  sectionTitle: { color: '#fff', fontSize: 16, fontWeight: '700', marginTop: 12, marginBottom: 8 },
  cajonesContainer: { backgroundColor: '#001A3D', borderRadius: 10, borderWidth: 1, borderColor: '#0b2a66' },
  cajonesScroll: { maxHeight: 360, padding: 10 },

  countsRow: {flexDirection: 'row', gap: 10, marginBottom: 12, },
  countCard: {flex: 1, backgroundColor: '#001A3D', borderRadius: 10, paddingVertical: 10, alignItems: 'center', borderWidth: 1.5,},
  countNumber: {color: '#fff', fontSize: 18, fontWeight: '800', marginBottom: 2,},
  countLabel: {color: '#9ca3af', fontSize: 12, fontWeight: '600',},

  // ——— Zona vehículos (SIN CAMBIOS) ———
  vehiculosHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 5, marginBottom: 10 },
  addButton: { backgroundColor: '#FACC15', width: 32, height: 32, borderRadius: 16, alignItems: 'center', justifyContent: 'center' },
  addButtonText: { fontSize: 20, fontWeight: 'bold', color: '#00224D' },
  vehiculosContainer: { flexDirection: 'row', gap: 10, flexWrap: 'wrap' },
  vehiculoCard: { backgroundColor: '#000', borderRadius: 10, padding: 10, width: '48%', marginBottom: 10 },
  placas: { color: '#fff', fontWeight: 'bold', marginBottom: 5 },
  modelo: { color: '#facc15', fontWeight: '600' },


});
