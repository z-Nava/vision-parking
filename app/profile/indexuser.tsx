import React from 'react';
import { View, Text, StyleSheet, ScrollView, Image, TouchableOpacity, ActivityIndicator } from 'react-native';
import BottomNav from '../../components/BottomNav';
import { useRouter } from 'expo-router';
import { clearSession } from '@/utils/clearSession';
import { useUserData } from '../../hooks/useUserData';

export default function ProfileScreen() {
  const router = useRouter();
  const { username, email, userId, vehicles, companies, loading } = useUserData();

  const user = {
    nombre: username,
    correo: email || 'Correo no disponible',
    avatar: require('../../assets/images/react-logo.png'), // Imagen temporal
  };

  const empresa = companies.length > 0 ? companies[0] : null;

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
          style={[styles.clearSessionButton, { backgroundColor: '#B22222' }]}
          onPress={clearSession}
        >
          <Text style={styles.clearSessionText}>🧹 Cerrar sesión</Text>
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
  clearSessionButton: {
  width: '100%',
  backgroundColor: '#8B0000', // rojo oscuro elegante
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
