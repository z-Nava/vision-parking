import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import BottomNav from '../../components/BottomNav';
import { useRouter } from 'expo-router';
import { useUserData } from '../../hooks/useUserData';
import * as SecureStore from 'expo-secure-store';
import api from '../../services/api';

export default function HomeScreen() {
  const router = useRouter();
  const { username, vehicles, loading, hasAccess, companies, companyName} = useUserData();
  const [parkingLots, setParkingLots] = useState<any[]>([]);

  useEffect(() => {
    const fetchParkingLots = async () => {
      if (companies.length > 0) {
        const cmp_id = companies[0].cmp_id;
        try {
          const token = await SecureStore.getItemAsync('auth_token');
          const res = await api.get(`/companies/${cmp_id}/parking-lots`, {
            headers: { Authorization: `Bearer ${token}` }
          });
          setParkingLots(res.data || []);
        } catch (err) {
          console.error('Error al obtener cajones:', err);
        }
      }
    };

    fetchParkingLots();
  }, [companies]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Activo': return '#2ecc71';
      case 'Reservado': return '#34495e';
      case 'Ocupado': return '#c0392b';
      case 'Inactivo': return '#7f8c8d';
      default: return '#bdc3c7';
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
        <Text style={styles.company}>Compañia: <Text style={styles.companyName}>{companyName}</Text></Text>
        {!hasAccess && (
          <View style={styles.alertBox}>
            <Text style={styles.alertText}>
              Aún no se te ha asignado acceso a ningún estacionamiento. Espera a que un administrador apruebe tu solicitud.
            </Text>
          </View>
        )}

        {hasAccess && parkingLots.map((lot, idx) => (
          <View key={idx}>
            <Text style={styles.sectionTitle}>Estacionamiento: {lot.pkl_name}</Text>
            <View style={styles.cajonesContainer}>
              <ScrollView style={styles.cajonesScroll}>
                {lot.parking_spots.map((spot: any, index: number) => (
                  <View key={index} style={styles.cajonCard}>
                    <View>
                      <Text style={styles.cajonNombre}>Cajón {spot.pks_number}</Text>
                    </View>
                    <View style={[styles.estado, { backgroundColor: getStatusColor(spot.status?.stu_name) }]}>
                      <Text style={styles.estadoText}>{spot.status?.stu_name}</Text>
                    </View>
                  </View>
                ))}
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
  container: {
    flex: 1,
    backgroundColor: '#00224D',
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 80,
  },
  title: {
    fontSize: 20,
    color: 'white',
    fontWeight: '700',
    marginBottom: 5,
  },
  welcome: {
    fontSize: 20,
    color: '#FACC15',
    fontWeight: 'bold',
    marginBottom: 20,
  },
  username: {
    fontWeight: 'bold',
  },
  sectionTitle: {
    fontSize: 16,
    color: '#FACC15',
    fontWeight: 'bold',
    marginTop: 10,
    marginBottom: 10,
  },
  cajonCard: {
    backgroundColor: '#000',
    borderRadius: 10,
    padding: 15,
    marginBottom: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  cajonNombre: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  reservableText: {
    color: '#f1c40f',
    fontSize: 12,
    marginTop: 4,
  },
  estado: {
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 6,
  },
  estadoText: {
    color: '#fff',
    fontWeight: '600',
  },
  vehiculosHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 25,
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
    gap: 10,
    flexWrap: 'wrap',
  },
  vehiculoCard: {
    backgroundColor: '#000',
    borderRadius: 10,
    padding: 10,
    width: '48%',
    marginBottom: 10,
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
  alertBox: {
  backgroundColor: '#F87171',
  padding: 12,
  borderRadius: 10,
  marginBottom: 15,
},
  alertText: {
  color: '#fff',
  fontWeight: '600',
  textAlign: 'center',
},
cajonesContainer: {
  maxHeight: 300,
  marginBottom: 20,
  borderRadius: 10,
  overflow: 'hidden',
},
cajonesScroll: {
  backgroundColor: '#001A3D',
  borderRadius: 10,
  padding: 10,
},
company: {
  fontSize: 16,
  color: 'white',
  marginBottom: 10,
},

companyName: {
  color: '#FACC15',
  fontWeight: 'bold',
}



});
