import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Image, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';

export default function ConfigVehicleScreen() {
  const router = useRouter();

  const [marca, setMarca] = useState('');
  const [modelo, setModelo] = useState('');
  const [anio, setAnio] = useState('');
  const [color, setColor] = useState('');
  const [placas, setPlacas] = useState('');

  const handleRegister = () => {
    console.log({
      marca,
      modelo,
      anio,
      color,
      placas
    });
    alert('Vehículo registrado (simulado)');
    // En un futuro: enviar estos datos a tu API
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      {/* Logo temporal */}
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

      <TouchableOpacity style={styles.button} onPress={() => {
                handleRegister(); // Si quieres seguir mostrando el alert del archivo...
                router.push('/auth/login'); // Navegación a la siguiente pantalla
            }}>
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
