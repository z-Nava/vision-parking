// components/parking/SpotCard.tsx
import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { useSpotStatus } from '../hooks/useSpotStatus';
import type { Spot } from '../utils/spotEvents';

const getStatusColor = (status?: string) => {
  switch (status) {
    case 'Disponible': return '#2ecc71';
    case 'Reservado':  return '#1f6feb';
    case 'Ocupado':    return '#c0392b';
    default:           return '#bdc3c7';
  }
};
const isReservable = (status?: string) => status === 'Disponible';

export default function SpotCard({ spot, lot }: { spot: any; lot: any }) {
  const router = useRouter();
  const { selectedSpot } = useSpotStatus({
    pks_id: spot.pks_id,
    pks_number: spot.pks_number,
    status: { stu_name: spot.status?.stu_name },
  } as Spot);

  const statusName = selectedSpot.status?.stu_name as string | undefined;
    if (statusName === 'Inactivo') return null; // evita renderizar si no hay estado
  const color = getStatusColor(statusName);
  const reservable = isReservable(statusName);

  return (
    <View style={styles.cajonCard}>
      <View>
        <Text style={styles.cajonNombre}>Cajón {selectedSpot.pks_number}</Text>
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
                pks_id: selectedSpot.pks_id,
                cmp_id: lot.cmp_id,
                pkl_id: lot.pkl_id,
                pks_number: selectedSpot.pks_number,
              },
            })
          }
        >
          <Text style={styles.reservarText}>Reservar</Text>
        </TouchableOpacity>
      ) : (
        <Text style={[styles.estadoText, { fontStyle: 'italic' }]}>No disponible</Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  cajonCard: {
    backgroundColor: '#001A3D',
    borderRadius: 10,
    padding: 12,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#0b2a66',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  cajonNombre: { color: '#fff', fontSize: 16, fontWeight: '600', marginBottom: 6 },
  statusBadge: { alignSelf: 'flex-start', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6 },
  statusBadgeText: { color: '#fff', fontWeight: '700' },
  reservarButton: { backgroundColor: '#FACC15', paddingHorizontal: 14, paddingVertical: 8, borderRadius: 8 },
  reservarText: { color: '#00224D', fontWeight: '700' },
  estadoText: { color: '#fff', opacity: 0.8 },
});
