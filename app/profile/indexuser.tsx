// app/user/indexuser.tsx  (ProfileScreen)
import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Image, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import BottomNav from '../../components/BottomNav';
import { useRouter } from 'expo-router';
import * as SecureStore from 'expo-secure-store';
import api from '../../services/api';
import { clearSession } from '@/utils/clearSession';
import { useUserData } from '../../hooks/useUserData';

function formatDateRange(isoStart?: string, isoEnd?: string) {
  if (!isoStart || !isoEnd) return '—';
  try {
    const start = new Date(isoStart);
    const end = new Date(isoEnd);
    const f = (d: Date) =>
      d.toLocaleString('es-MX', {
        weekday: 'short',
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    return `${f(start)}  →  ${f(end)}`;
  } catch {
    return `${isoStart} → ${isoEnd}`;
  }
}

function statusColor(status?: string) {
  switch (status) {
    case 'Realizada': return '#1f6feb'; // azul
    case 'Activa':    return '#2ecc71'; // verde
    case 'Cancelada': return '#7f8c8d'; // gris
    case 'Rechazada': return '#c0392b'; // rojo
    default:          return '#34495e'; // neutro
  }
}

export default function ProfileScreen() {
  const router = useRouter();
  const {
    username,
    email,
    vehicles,
    companies,
    loading,
    reservations,
    loadingReservations,
  } = useUserData();

  const [loggingOut, setLoggingOut] = useState(false);

  const user = {
    nombre: username,
    correo: email || 'Correo no disponible',
    avatar: require('../../assets/images/app_icon_64x64.png'), // Imagen por defecto
  };

  const empresa = companies.length > 0 ? companies[0] : null;

  const handleLogout = async () => {
    if (loggingOut) return;
    setLoggingOut(true);
    try {
      const token = await SecureStore.getItemAsync('auth_token');
      const usr_id = await SecureStore.getItemAsync('usr_id');

      if (token) {
        try {
          await api.post(
            '/logout',
            { usr_id }, // si tu middleware toma el usr del token, esto es opcional pero útil
            { headers: { Authorization: `Bearer ${token}` } }
          );
        } catch (err: any) {
          // No bloqueamos el cierre de sesión local por un error del servidor
          console.warn('Error al cerrar sesión en servidor:', err?.response?.data || err?.message);
        }
      }

      // Siempre limpia sesión local
      await clearSession();
      router.replace('/');
    } catch (e) {
      Alert.alert('Error', 'No se pudo cerrar sesión correctamente.');
    } finally {
      setLoggingOut(false);
    }
  };

  return (
    <View style={styles.container}>
      <ScrollView>

        {/* Perfil */}
        <View style={styles.profile}>
          <Image source={user.avatar} style={styles.avatar} />
          <Text style={styles.username}>{user.nombre}</Text>
          <Text style={styles.email}>{user.correo}</Text>
        </View>

        {/* Empresa */}
        <Text style={styles.sectionTitle}>Empresa vinculada</Text>
        {empresa ? (
          <View style={styles.reservationCard}>
            <Text style={styles.detail}>Nombre: {empresa.cmp_name}</Text>
            <Text style={styles.detail}>ID: {empresa.cmp_id || 'N/A'}</Text>
          </View>
        ) : (
          <Text style={styles.noDataText}>No estás vinculado a ninguna empresa.</Text>
        )}

        {/* Mis reservaciones */}
        <Text style={styles.sectionTitle}>Mis reservaciones</Text>
        {loadingReservations ? (
          <ActivityIndicator size="large" color="#facc15" />
        ) : reservations.length === 0 ? (
          <Text style={styles.noDataText}>No tienes reservaciones registradas.</Text>
        ) : (
          reservations.map((rsv) => {
            const statusName = rsv.status?.stu_name as string | undefined;
            const color = statusColor(statusName);
            const spot = rsv.parking_spot;
            const lot = spot?.parking_lot;

            return (
              <View key={rsv.rsv_id} style={styles.rsvCard}>
                <View style={styles.rsvHeaderRow}>
                  <Text style={styles.rsvTitle}>Cajón {spot?.pks_number ?? '—'}</Text>
                  <View style={[styles.badge, { backgroundColor: color }]}>
                    <Text style={styles.badgeText}>{statusName ?? '—'}</Text>
                  </View>
                </View>

                <Text style={styles.rsvDetail}>
                  {formatDateRange(rsv.rsv_initial_date, rsv.rsv_end_date)}
                </Text>
                <Text style={styles.rsvDetail}>Motivo: {rsv.rsv_reason || '—'}</Text>
                <Text style={styles.rsvDetail}>Compañía: {empresa.cmp_name ?? '—'}</Text>
              </View>
            );
          })
        )}

        {/* Vehículos */}
        <View style={styles.vehiculosHeader}>
          <Text style={styles.sectionTitle}>Mis vehículos</Text>
          <TouchableOpacity style={styles.addButton} onPress={() => router.push('/vehicle/add')}>
            <Text style={styles.addButtonText}>＋</Text>
          </TouchableOpacity>
        </View>

        {loading ? (
          <ActivityIndicator size="large" color="#facc15" />
        ) : vehicles.length === 0 ? (
          <Text style={styles.noDataText}>No tienes vehículos registrados.</Text>
        ) : (
          <View style={styles.vehiculosContainer}>
            {vehicles.map((v, i) => (
              <View key={i} style={styles.vehiculoCard}>
                <Text style={styles.placas}>{v.veh_plate}</Text>
                <Text style={styles.modelo}>
                  {v.veh_brand} {v.veh_model} {v.veh_year}
                </Text>
                <Text style={styles.modelo}>Color: {v.veh_color}</Text>
              </View>
            ))}
          </View>
        )}

        <TouchableOpacity
          style={[styles.clearSessionButton, { backgroundColor: '#B22222', opacity: loggingOut ? 0.7 : 1 }]}
          onPress={handleLogout}
          disabled={loggingOut}
        >
          {loggingOut ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.clearSessionText}>🧹 Cerrar sesión</Text>
          )}
        </TouchableOpacity>
      </ScrollView>

      <BottomNav />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#00224D',
    paddingTop: 60,
    paddingHorizontal: 20,
    paddingBottom: 80,
  },
  profile: {
    alignItems: 'center',
    marginBottom: 30,
  },
  avatar: {
    width: 90,
    height: 90,
    borderRadius: 45,
    marginBottom: 10,
  },
  username: {
    color: 'white',
    fontSize: 18,
    fontWeight: '600',
  },
  email: {
    color: '#ccc',
    fontSize: 14,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FACC15',
    marginBottom: 10,
  },
  reservationCard: {
    backgroundColor: '#003366',
    borderRadius: 10,
    padding: 15,
    marginBottom: 25,
  },
  detail: {
    color: '#fff',
    marginBottom: 5,
  },

  // ===== Reservas =====
  rsvCard: {
    backgroundColor: '#001A3D',
    borderRadius: 10,
    padding: 12,
    marginBottom: 12,
  },
  rsvHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  rsvTitle: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
  rsvDetail: { color: '#e5e7eb', marginTop: 2 },

  badge: {
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 999,
  },
  badgeText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 12,
  },

  // ===== Vehículos =====
  vehiculosHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 18,
    marginBottom: 10,
  },
  addButton: {
    backgroundColor: '#FACC15',
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  addButtonText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#00224D',
  },
  vehiculosContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  vehiculoCard: {
    backgroundColor: '#000',
    borderRadius: 10,
    padding: 10,
    width: '48%',
  },
  placas: {
    color: '#fff',
    fontWeight: 'bold',
    marginBottom: 5,
  },
  modelo: {
    color: '#facc15',
    fontWeight: '600',
  },

  // ===== Otros =====
  clearSessionButton: {
    width: '100%',
    backgroundColor: '#8B0000',
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 20,
  },
  clearSessionText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 16,
  },
  noDataText: {
    color: '#ccc',
    fontStyle: 'italic',
    marginBottom: 15,
    textAlign: 'center',
  },
});
