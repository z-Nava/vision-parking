import React from 'react';
import { View, Text, StyleSheet, ScrollView, Image, TouchableOpacity } from 'react-native';
import BottomNav from '../../components/BottomNav';
import { useRouter } from 'expo-router';

export default function ProfileScreen() {
  const router = useRouter();

  const user = {
    nombre: 'Usuario',
    correo: 'usuario@mail.com',
    avatar: require('../../assets/images/react-logo.png'), // Imagen temporal
  };

  const reservacion = {
    estacionamiento: 'UTT',
    cajon: 'A1',
    fechaInicio: '06/17/2025',
    fechaFin: '06/17/2025',
  };

  const vehiculos = [
    { placas: 'DEF-5678', modelo: 'Silverado 2022' },
    { placas: 'XYZ-9334', modelo: 'Tacoma 2016' },
  ];

  const handleCancelar = () => {
    alert('Reservación cancelada (simulada)');
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

        {/* Reservación */}
        <Text style={styles.sectionTitle}>Tus reservaciones</Text>
        <View style={styles.reservationCard}>
          <Text style={styles.detail}>Estacionamiento: {reservacion.estacionamiento}</Text>
          <Text style={styles.detail}>Cajon: {reservacion.cajon}</Text>
          <Text style={styles.detail}>Fecha de inicio: {reservacion.fechaInicio}</Text>
          <Text style={styles.detail}>Fecha de fin: {reservacion.fechaFin}</Text>

          <TouchableOpacity style={styles.cancelButton} onPress={() => {
            handleCancelar();
            router.push('/parking/cancel'); // Regresar a la pantalla principal
          }}>
            <Text style={styles.cancelText}>Cancelar reservación</Text>
          </TouchableOpacity>
        </View>

        {/* Vehículos */}
        <View style={styles.vehiculosHeader}>
          <Text style={styles.sectionTitle}>Mis vehículos</Text>
          <TouchableOpacity style={styles.addButton} onPress={() => router.push('/vehicle/add')}>
            <Text style={styles.addButtonText}>＋</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.vehiculosContainer}>
          {vehiculos.map((v, i) => (
            <View key={i} style={styles.vehiculoCard}>
              <Text style={styles.placas}>{v.placas}</Text>
              <Text style={styles.modelo}>{v.modelo}</Text>
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
  cancelButton: {
    marginTop: 10,
    backgroundColor: '#b91c1c',
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: 'center',
  },
  cancelText: {
    color: '#fff',
    fontWeight: '600',
  },
  vehiculosHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
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
});
