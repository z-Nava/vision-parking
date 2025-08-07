import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import api from '../../services/api';

export default function CompaniesScreen() {
  const [companies, setCompanies] = useState([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const fetchCompanies = async () => {
      try {
        const res = await api.get('/companies');
        setCompanies(res.data); // Asegúrate que tu endpoint devuelve una lista directamente
      } catch (error) {
        console.error('Error al obtener compañías disponibles:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchCompanies();
  }, []);

  const handleRequestAccess = (cmp_id: string) => {
    router.push(`/parking/add?cmp_id=${cmp_id}`);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Compañías disponibles</Text>

      {loading ? (
        <ActivityIndicator size="large" color="#facc15" />
      ) : (
        <ScrollView contentContainerStyle={styles.scrollContent}>
          {companies.map((company: any) => (
            <View key={company.cmp_id} style={styles.card}>
              <Text style={styles.name}>{company.cmp_name}</Text>
              <Text style={styles.detail}>Registrada el: {new Date(company.cmp_date).toLocaleDateString()}</Text>

              <TouchableOpacity
                style={styles.requestButton}
                onPress={() => handleRequestAccess(company.cmp_id)}
              >
                <Text style={styles.requestText}>Solicitar acceso</Text>
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
    paddingTop: 60,
    paddingHorizontal: 20,
    paddingBottom: 80,
  },
  title: {
    color: '#facc15',
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  scrollContent: {
    paddingBottom: 100,
  },
  card: {
    backgroundColor: '#003366',
    borderRadius: 12,
    padding: 15,
    marginBottom: 20,
  },
  name: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 6,
  },
  detail: {
    color: '#ccc',
    fontSize: 13,
    marginBottom: 10,
  },
  requestButton: {
    backgroundColor: '#FACC15',
    borderRadius: 8,
    paddingVertical: 10,
    alignItems: 'center',
  },
  requestText: {
    color: '#00224D',
    fontWeight: 'bold',
  },
});
