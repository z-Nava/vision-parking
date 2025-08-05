// app/parking/available.tsx
import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import BottomNav from '../../components/BottomNav';
import { useRouter } from 'expo-router';
import { useAuth } from '../../hooks/useAuth';
import api from '../../services/api';

type Company = {
  cmp_id: string;
  cmp_name: string;
};

export default function AvailableParking() {
  const router = useRouter();
  const { isLoggedIn } = useAuth();
  const [companies, setCompanies] = useState<Company[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isLoggedIn) {
      router.replace('/auth/login');
      return;
    }

    const fetchCompanies = async () => {
      try {
        const response = await api.get('/companies');
        setCompanies(response.data);
      } catch (error) {
        console.error('Error al obtener estacionamientos:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchCompanies();
  }, [isLoggedIn]);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Estacionamientos disponibles</Text>

      {loading ? (
        <ActivityIndicator color="#FACC15" size="large" />
      ) : (
        <ScrollView style={styles.scroll}>
          {companies.map((company) => (
            <View key={company.cmp_id} style={styles.card}>
              <Text style={styles.lotName}>{company.cmp_name}</Text>
                <TouchableOpacity
                  style={styles.button}
                  onPress={() => router.push({
                    pathname: '/parking/add',
                    params: {
                      cmp_id: company.cmp_id,
                      cmp_name: company.cmp_name
                    }
                  })}
                >
                <Text style={styles.buttonText}>Solicitar acceso</Text>
              </TouchableOpacity>
            </View>
          ))}
        </ScrollView>
      )}
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
    color: 'white',
    fontSize: 22,
    fontWeight: '600',
    marginBottom: 20,
  },
  scroll: {
    flex: 1,
  },
  card: {
    backgroundColor: '#003366',
    borderRadius: 10,
    padding: 15,
    marginBottom: 20,
  },
  lotName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 10,
  },
  button: {
    backgroundColor: '#FFCC00',
    paddingVertical: 10,
    borderRadius: 6,
    marginTop: 10,
    alignItems: 'center',
  },
  buttonText: {
    color: '#00224D',
    fontWeight: '600',
  },
});
