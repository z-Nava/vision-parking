// app/parking/show-parking.tsx
import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import BottomNav from '../../components/BottomNav';
import { useUserData } from '../../hooks/useUserData';

export default function MyParkingsScreen() {
  const router = useRouter();
  const { companies, loading } = useUserData();

  const handleGoToParking = (cmp_id: string, cmp_name: string) => {
    router.push({
      pathname: '/home/indexapp',
      params: { cmp_id, cmp_name, t: Date.now().toString() }, // fuerza recarga en indexapp
    });
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Tus estacionamientos vinculados</Text>

      {loading ? (
        <View style={{ marginTop: 20 }}>
          <ActivityIndicator size="large" color="#FACC15" />
        </View>
      ) : (
        <ScrollView contentContainerStyle={{ paddingBottom: 100 }}>
          {companies.length === 0 ? (
            <Text style={styles.noDataText}>Aún no tienes estacionamientos vinculados.</Text>
          ) : (
            companies.map((parking: any) => (
              <View key={parking.cmp_id} style={styles.card}>
                <Text style={styles.parkingName}>{parking.cmp_name}</Text>
                <Text style={styles.details}>ID de compañía: {parking.cmp_id || 'No definido'}</Text>

                <TouchableOpacity
                  style={styles.goButton}
                  onPress={() => handleGoToParking(parking.cmp_id, parking.cmp_name)}
                >
                  <Text style={styles.goButtonText}>Usar este estacionamiento</Text>
                </TouchableOpacity>
              </View>
            ))
          )}
        </ScrollView>
      )}

      <TouchableOpacity style={styles.fab} onPress={() => router.push('/parking/add-parkings')}>
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
  noDataText: {
    color: '#facc15',
    textAlign: 'center',
    marginTop: 30,
    fontSize: 16,
    fontWeight: '500',
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
    marginBottom: 10,
  },
  goButton: {
    backgroundColor: '#FACC15',
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 4,
  },
  goButtonText: {
    color: '#00224D',
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
