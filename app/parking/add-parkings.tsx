// app/parking/add-parking.tsx
import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import * as SecureStore from 'expo-secure-store';
import api from '../../services/api';

export default function CompaniesScreen() {
  const [companies, setCompanies] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  // Helper para obtener headers con Bearer
  const getAuthHeaders = useCallback(async () => {
    const token = await SecureStore.getItemAsync('auth_token');
    if (!token) throw new Error('No hay token de sesión. Inicia sesión nuevamente.');
    return { Authorization: `Bearer ${token}` };
  }, []);

  useEffect(() => {
    const fetchCompanies = async () => {
      try {
        const headers = await getAuthHeaders();
        const res = await api.get('/companies', { headers });
        const list = res?.data?.data ?? res?.data ?? [];
        setCompanies(Array.isArray(list) ? list : []);
      } catch (error: any) {
        console.error('Error al obtener compañías disponibles:', error);
        Alert.alert('Error', error?.message || 'No se pudieron cargar las compañías.');
      } finally {
        setLoading(false);
      }
    };
    fetchCompanies();
  }, [getAuthHeaders]);

  const handleRequestAccess = (cmp_id: string, cmp_name?: string) => {
    // puedes enviar también el nombre si te sirve para la siguiente pantalla
    router.push({
      pathname: '/parking/add',
      params: { cmp_id, cmp_name },
    });
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
              {company.cmp_date ? (
                <Text style={styles.detail}>
                  Registrada el: {new Date(company.cmp_date).toLocaleDateString()}
                </Text>
              ) : null}

              <TouchableOpacity
                style={styles.requestButton}
                onPress={() => handleRequestAccess(company.cmp_id, company.cmp_name)}
              >
                <Text style={styles.requestText}>Solicitar acceso</Text>
              </TouchableOpacity>
            </View>
          ))}

          {companies.length === 0 && (
            <Text style={{ color: '#ccc', textAlign: 'center', marginTop: 20 }}>
              No hay compañías disponibles por ahora.
            </Text>
          )}
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
