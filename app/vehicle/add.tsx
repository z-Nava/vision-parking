import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView, Alert } from 'react-native';
import BottomNav from '../../components/BottomNav';
import * as SecureStore from 'expo-secure-store';
import api from '../../services/api';

export default function AddVehicleScreen() {
  const [marca, setMarca] = useState('');
  const [modelo, setModelo] = useState('');
  const [anio, setAnio] = useState('');
  const [color, setColor] = useState('');
  const [placas, setPlacas] = useState('');
  const [vehiculos, setVehiculos] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchVehiculos = async () => {
      try {
        const usr_id = await SecureStore.getItemAsync('usr_id');
        if (!usr_id) return;

        const res = await api.get(`/users/${usr_id}/vehicles`);
        setVehiculos(res.data.data || []);
      } catch (error) {
        console.error('Error al obtener vehículos:', error);
      }
    };

    fetchVehiculos();
  }, []);

  const handleSaveVehicle = async () => {
    if (!marca || !modelo || !anio || !color || !placas) {
      return Alert.alert('Campos incompletos', 'Por favor completa todos los campos');
    }

    try {
      const usr_id = await SecureStore.getItemAsync('usr_id');
      if (!usr_id) throw new Error('Usuario no autenticado');

      setLoading(true);

      await api.post('/vehicles', {
        usr_id,
        veh_plate: placas,
        veh_brand: marca,
        veh_model: modelo,
        veh_year: Number(anio),
        veh_color: color
      });

      Alert.alert('Éxito', 'Vehículo guardado correctamente');

      // Limpiar formulario
      setMarca('');
      setModelo('');
      setAnio('');
      setColor('');
      setPlacas('');

      // Recargar vehículos
      const res = await api.get(`/users/${usr_id}/vehicles`);
      setVehiculos(res.data.data || []);
    } catch (error: any) {
      console.error('Error al guardar vehículo:', error);
      Alert.alert('Error', error?.response?.data?.message || 'No se pudo guardar el vehículo');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <ScrollView>

        <Text style={styles.sectionTitle}>Mis vehículos</Text>
        <View style={styles.vehiculosContainer}>
          {vehiculos.map((v, index) => (
            <View key={index} style={styles.vehiculoCard}>
              <Text style={styles.placas}>{v.veh_plate}</Text>
              <Text style={styles.modelo}>{`${v.veh_brand} ${v.veh_model}`}</Text>
            </View>
          ))}
        </View>

        <View style={styles.formCard}>
          <Text style={styles.formTitle}>Agregar nuevo vehículo</Text>
          <Text style={styles.formSubtitle}>Solo tienes un límite de 4 vehículos</Text>

          <TextInput
            style={styles.input}
            placeholder="Marca del vehículo"
            placeholderTextColor="#666"
            value={marca}
            onChangeText={setMarca}
          />
          <TextInput
            style={styles.input}
            placeholder="Modelo del vehículo"
            placeholderTextColor="#666"
            value={modelo}
            onChangeText={setModelo}
          />
          <TextInput
            style={styles.input}
            placeholder="Año del vehículo"
            placeholderTextColor="#666"
            keyboardType="numeric"
            value={anio}
            onChangeText={setAnio}
          />
          <TextInput
            style={styles.input}
            placeholder="Color del vehículo"
            placeholderTextColor="#666"
            value={color}
            onChangeText={setColor}
          />
          <TextInput
            style={styles.input}
            placeholder="Placas del vehículo"
            placeholderTextColor="#666"
            value={placas}
            onChangeText={setPlacas}
          />

          <TouchableOpacity style={styles.saveButton} onPress={handleSaveVehicle} disabled={loading}>
            <Text style={styles.saveButtonText}>{loading ? 'Guardando...' : 'Guardar vehículo'}</Text>
          </TouchableOpacity>
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
  sectionTitle: {
    fontSize: 18,
    color: '#FACC15',
    fontWeight: 'bold',
    marginBottom: 10,
  },
  vehiculosContainer: {
    flexDirection: 'row',
    gap: 10,
    flexWrap: 'wrap',
    marginBottom: 20,
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
  formCard: {
    backgroundColor: '#FACC15',
    borderRadius: 12,
    padding: 20,
  },
  formTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#00224D',
    marginBottom: 4,
    textAlign: 'center',
  },
  formSubtitle: {
    color: '#00224D',
    fontSize: 12,
    textAlign: 'center',
    marginBottom: 15,
  },
  input: {
    backgroundColor: '#fff',
    borderRadius: 10,
    paddingHorizontal: 15,
    height: 50,
    fontSize: 16,
    marginBottom: 12,
  },
  saveButton: {
    backgroundColor: '#00224D',
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 5,
  },
  saveButtonText: {
    color: '#fff',
    fontWeight: '600',
  },
});
