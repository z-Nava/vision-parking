import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import BottomNav from '../../components/BottomNav';

export default function MyParkingsScreen() {
  const router = useRouter();

  const parkings = [
    {
      nombre: 'Universidad Tecnologica de Torreon',
      token: 'abcd-1234-xyz',
      alias: 'UTT',
      ubicacion: 'Carretera Torreon-Matamoros',
    },
    {
      nombre: 'Milwaukee Tool Torreon',
      token: 'xyxA-2013-nva',
      alias: 'MW',
      ubicacion: 'Boulevard San Pedro',
    },
  ];

  const handleGoToParking = (alias: string) => {
    alert(`Navegar a: ${alias}`);
    // router.push(`/parking/detail/${alias}`); ← cuando esté disponible
  };

  const handleDelete = (alias: string) => {
    alert(`Eliminar estacionamiento: ${alias}`);
    // Aquí podrías integrar lógica para eliminar desde API
  };

  return (
    <View style={styles.container}>
      <ScrollView>
        <Text style={styles.title}>Tus estacionamientos vinculados</Text>

        {parkings.map((parking, index) => (
          <View key={index} style={styles.card}>
            <Text style={styles.parkingName}>{parking.nombre}</Text>
            <Text style={styles.details}>Token: {parking.token}</Text>
            <Text style={styles.details}>Alias: {parking.alias}</Text>
            <Text style={styles.details}>Ubicación: {parking.ubicacion}</Text>

            <TouchableOpacity
              style={styles.goButton}
              onPress={() => handleGoToParking(parking.alias)}
            >
              <Text style={styles.goButtonText}>Ir a este estacionamiento</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.deleteButton}
              onPress={() => handleDelete(parking.alias)}
            >
              <Text style={styles.deleteButtonText}>Eliminar</Text>
            </TouchableOpacity>
          </View>
        ))}
      </ScrollView>

      {/* Botón flotante */}
      <TouchableOpacity style={styles.fab} onPress={() => router.push('/parking/add')}>
        <Text style={styles.fabText}>＋</Text>
      </TouchableOpacity>

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
    fontSize: 18,
    fontWeight: '600',
    color: '#fff',
    marginBottom: 20,
  },
  card: {
    backgroundColor: '#003366',
    borderRadius: 12,
    padding: 15,
    marginBottom: 20,
  },
  parkingName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 8,
  },
  details: {
    color: '#ddd',
    marginBottom: 4,
  },
  goButton: {
    backgroundColor: '#FACC15',
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 10,
  },
  goButtonText: {
    color: '#00224D',
    fontWeight: '600',
  },
  deleteButton: {
    backgroundColor: '#b91c1c',
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 10,
  },
  deleteButtonText: {
    color: '#fff',
    fontWeight: '600',
  },
  fab: {
    position: 'absolute',
    bottom: 85,
    right: 20,
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#FACC15',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 10,
  },
  fabText: {
    fontSize: 24,
    color: '#00224D',
    fontWeight: 'bold',
  },
});
