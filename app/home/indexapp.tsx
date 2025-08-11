// app/home/indexapp.tsx
import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import BottomNav from '../../components/BottomNav';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useUserData } from '../../hooks/useUserData';
import * as SecureStore from 'expo-secure-store';
import api from '../../services/api';

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

  const fetchParkingLots = useCallback(async () => {
    if (!activeCmpId) return;
    try {
      const token = await SecureStore.getItemAsync('auth_token');
      const res = await api.get(`/companies/${activeCmpId}/parking-lots`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const lots = res?.data?.data ?? res?.data ?? [];
      console.log('Cajones obtenidos de', activeCmpId, lots);
      setParkingLots(lots);
    } catch (err) {
      console.error('Error al obtener cajones:', err);
    }
  }, [activeCmpId]);

  // cargar cajones cuando cambie la compañía activa
  useEffect(() => {
    fetchParkingLots();
  }, [fetchParkingLots]);

  const handleRefreshAccess = async () => {
    try {
      setRefreshing(true);
      const usr_id = await SecureStore.getItemAsync('usr_id');
      const token = await SecureStore.getItemAsync('auth_token');
      if (!usr_id || !token) return;

      const res = await api.get(`/users/${usr_id}/companies`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const companiesList = res?.data?.data ?? res?.data ?? [];
      const accepted = Array.isArray(companiesList) && companiesList.length > 0;

      if (accepted) {
        setLocalHasAccess(true);
        await fetchParkingLots();
      }
      console.log('Acceso actualizado:', accepted);
      console.log('Compañías:', companiesList);
    } catch (error) {
      console.error('Error al refrescar acceso:', error);
    } finally {
      setRefreshing(false);
    }
  };

  // Colores por estado según tu API
  const getStatusColor = (status?: string) => {
    switch (status) {
      case 'Disponible': return '#2ecc71'; // verde
      case 'Reservado':  return '#1f6feb'; // azul
      case 'Ocupado':    return '#c0392b'; // rojo
      case 'Inactivo':   return '#7f8c8d'; // gris
      default:           return '#bdc3c7'; // por si acaso
    }
  };

  const isReservable = (status?: string) => status === 'Disponible';

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

        {localHasAccess && parkingLots.map((lot, idx) => (
          <View key={idx}>
            <Text style={styles.sectionTitle}>Estacionamiento: {lot.pkl_name}</Text>
            <View style={styles.cajonesContainer}>
              <ScrollView style={styles.cajonesScroll}>
                {lot.parking_spots
              ?.filter((spot: any) => {
                const statusName = spot.status?.stu_name;
                return ['Disponible', 'Ocupado', 'Reservado'].includes(statusName);
              })
              .map((spot: any, index: number) => {
                const statusName = spot.status?.stu_name as string | undefined;
                const color = getStatusColor(statusName);
                const reservable = isReservable(statusName);

                return (
                  <View key={index} style={styles.cajonCard}>
                    <View>
                      <Text style={styles.cajonNombre}>Cajón {spot.pks_number}</Text>

                      {/* Badge de estado con color */}
                      <View style={[styles.statusBadge, { backgroundColor: color }]}>
                        <Text style={styles.statusBadgeText}>{statusName || '—'}</Text>
                      </View>
                    </View>

                    {reservable ? (
                      <TouchableOpacity
                        style={styles.reservarButton}
                        onPress={() =>
                          router.push({
                            pathname: '/parking/schedule',
                            params: {
                              pks_id: spot.pks_id,
                              cmp_id: lot.cmp_id,
                              pkl_id: lot.pkl_id,
                              pks_number: spot.pks_number,
                            },
                          })
                        }
                      >
                        <Text style={styles.reservarText}>Reservar</Text>
                      </TouchableOpacity>
                    ) : (
                      <Text style={[styles.estadoText, { fontStyle: 'italic' }]}>
                        No disponible
                      </Text>
                    )}
                  </View>
                );
              })}
              </ScrollView>
            </View>
          </View>
        ))}

        {/* Mis vehículos */}
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
  reservarButton: {
    backgroundColor: '#FACC15',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  reservarText: { color: '#00224D', fontWeight: 'bold' },

  container: { flex: 1, backgroundColor: '#00224D', paddingHorizontal: 20, paddingTop: 60, paddingBottom: 80 },
  title: { fontSize: 20, color: 'white', fontWeight: '700', marginBottom: 5 },
  welcome: { fontSize: 20, color: '#FACC15', fontWeight: 'bold', marginBottom: 20 },
  username: { fontWeight: 'bold' },

  sectionTitle: { fontSize: 16, color: '#FACC15', fontWeight: 'bold', marginTop: 10, marginBottom: 10 },

  cajonCard: {
    backgroundColor: '#000',
    borderRadius: 10,
    padding: 15,
    marginBottom: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  cajonNombre: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
  estadoText: { color: '#fff', fontWeight: '600' },

  // Badge de estado
  statusBadge: {
    alignSelf: 'flex-start',
    marginTop: 6,
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 999,
  },
  statusBadgeText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 12,
  },

  vehiculosHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 25, marginBottom: 10 },
  addButton: { backgroundColor: '#FACC15', width: 32, height: 32, borderRadius: 16, alignItems: 'center', justifyContent: 'center' },
  addButtonText: { fontSize: 20, fontWeight: 'bold', color: '#00224D' },
  vehiculosContainer: { flexDirection: 'row', gap: 10, flexWrap: 'wrap' },
  vehiculoCard: { backgroundColor: '#000', borderRadius: 10, padding: 10, width: '48%', marginBottom: 10 },
  placas: { color: '#fff', fontWeight: 'bold', marginBottom: 5 },
  modelo: { color: '#facc15', fontWeight: '600' },

  alertBox: { backgroundColor: '#F87171', padding: 12, borderRadius: 10, marginBottom: 15 },
  alertText: { color: '#fff', fontWeight: '600', textAlign: 'center' },
  cajonesContainer: { maxHeight: 300, marginBottom: 20, borderRadius: 10, overflow: 'hidden' },
  cajonesScroll: { backgroundColor: '#001A3D', borderRadius: 10, padding: 10 },

  company: { fontSize: 16, color: 'white', marginBottom: 10 },
  companyName: { color: '#FACC15', fontWeight: 'bold' },

  refreshButton: {
    marginTop: 10,
    backgroundColor: '#FACC15',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    alignItems: 'center',
    alignSelf: 'center',
  },
  refreshText: { color: '#00224D', fontWeight: 'bold' },
});