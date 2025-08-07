// app/vehicle/config.tsx
import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Image, ScrollView, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import * as SecureStore from 'expo-secure-store';
import api from '../../services/api';

export default function ConfigVehicleScreen() {
  const router = useRouter();

  const [marca, setMarca] = useState('');
  const [modelo, setModelo] = useState('');
  const [anio, setAnio] = useState('');
  const [color, setColor] = useState('');
  const [placas, setPlacas] = useState('');

  const handleRegister = async () => {
    try {
      const usr_id = await SecureStore.getItemAsync('usr_id');
      const token = await SecureStore.getItemAsync('auth_token');

      if (!usr_id || !token) {
        throw new Error('Sesión no válida. Intenta iniciar sesión nuevamente.');
      }

      // Validación simple
      if (!marca || !modelo || !anio || !color || !placas) {
        Alert.alert('Error', 'Por favor completa todos los campos.');
        return;
      }

      // Registro del vehículo
      const response = await api.post(
        '/vehicles',
        {
          usr_id,
          veh_plate: placas,
          veh_brand: marca,
          veh_model: modelo,
          veh_year: parseInt(anio),
          veh_color: color,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      console.log('Vehículo registrado:', response.data);

      // Actualizar usr_is_configured
      await api.post(`/configurated/${usr_id}`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });

      Alert.alert('Éxito', 'Vehículo registrado correctamente');
      router.push('/auth/login');

    } catch (error: any) {
      console.error('Error al registrar vehículo:', error);
      Alert.alert('Error', error?.response?.data?.message || error.message || 'Ocurrió un error');
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Image source={require('../../assets/images/react-logo.png')} style={styles.logo} />

      <Text style={styles.title}>Configura un vehículo</Text>
      <Text style={styles.subtitle}>Ingresa los datos de tu vehículo</Text>

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
        placeholder="Color del vehículo (ej. #1F4E79)"
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

      <TouchableOpacity style={styles.button} onPress={handleRegister}>
        <Text style={styles.buttonText}>Registrar vehículo</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    backgroundColor: '#00224D',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  logo: {
    width: 150,
    height: 150,
    marginBottom: 30,
    resizeMode: 'contain',
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
    color: '#fff',
    marginBottom: 5,
  },
  subtitle: {
    color: '#ccc',
    fontSize: 14,
    marginBottom: 30,
    textAlign: 'center',
  },
  input: {
    width: '100%',
    height: 50,
    backgroundColor: '#fff',
    borderRadius: 10,
    paddingHorizontal: 15,
    fontSize: 16,
    marginBottom: 15,
  },
  button: {
    width: '100%',
    backgroundColor: '#0A3973',
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 10,
  },
  buttonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 16,
  },
});
