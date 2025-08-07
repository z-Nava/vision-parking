import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import BottomNav from '../../components/BottomNav';
import { useRouter } from 'expo-router';
import { useUserData } from '../../hooks/useUserData';

export default function HomeScreen() {
  const router = useRouter();
  const { username, vehicles, loading } = useUserData();

  const cajones = [
    { id: 'A1', estado: 'Disponible', color: '#2ecc71', reservable: false },
    { id: 'A2', estado: 'Disponible', color: '#2ecc71', reservable: true },
    { id: 'A3', estado: 'Ocupado', color: '#c0392b', reservable: false },
    { id: 'A4', estado: 'Disponible', color: '#2ecc71', reservable: true },
    { id: 'A5', estado: 'Reservado', color: '#34495e', reservable: false },
  ];

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

        {/* Cajones disponibles */}
        <Text style={styles.sectionTitle}>Cajones disponibles</Text>
        {cajones.map((cajon, index) => (
          <View key={index} style={styles.cajonCard}>
            <View>
              <Text style={styles.cajonNombre}>Cajon {cajon.id}</Text>
              {cajon.reservable && (
                <Text style={styles.reservableText}>Disponible reservación!</Text>
              )}
            </View>
            <View style={[styles.estado, { backgroundColor: cajon.color }]}>
              <Text style={styles.estadoText}>{cajon.estado}</Text>
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

// styles: sin cambios...


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
});
