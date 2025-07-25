import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView, Alert, Image } from 'react-native';
import BottomNav from '../../components/BottomNav';

export default function ScheduleParkingScreen() {
  const [razon, setRazon] = useState('');
  const [fechaInicio, setFechaInicio] = useState('');
  const [fechaFin, setFechaFin] = useState('');

  const handleReservar = () => {
    if (!razon || !fechaInicio || !fechaFin) {
      Alert.alert('Campos obligatorios', 'Por favor completa todos los campos');
      return;
    }

    Alert.alert('Reservación registrada', `Cajón reservado exitosamente`);
    // Aquí se conectaría a tu API
    setRazon('');
    setFechaInicio('');
    setFechaFin('');
  };

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scroll}>
        {/* Logo temporal */}
        <Image source={require('../../assets/images/react-logo.png')} style={styles.logo} />

        <View style={styles.card}>
          <Text style={styles.title}>¿Deseas reservar este lugar?</Text>
          <Text style={styles.cajon}>A2</Text>
          <Text style={styles.subtitle}>Ingresa la siguiente información para reservar el lugar</Text>

          <TextInput
            style={styles.input}
            placeholder="Razón de reserva"
            placeholderTextColor="#666"
            value={razon}
            onChangeText={setRazon}
          />
          <TextInput
            style={styles.input}
            placeholder="Fecha y Hora de inicio de reserva"
            placeholderTextColor="#666"
            value={fechaInicio}
            onChangeText={setFechaInicio}
          />
          <TextInput
            style={styles.input}
            placeholder="Fecha y Hora de finalización de reserva"
            placeholderTextColor="#666"
            value={fechaFin}
            onChangeText={setFechaFin}
          />

          <TouchableOpacity style={styles.button} onPress={handleReservar}>
            <Text style={styles.buttonText}>Reservar este cajón</Text>
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
    paddingTop: 60,
    paddingBottom: 80,
    paddingHorizontal: 20,
  },
  scroll: {
    flexGrow: 1,
    justifyContent: 'center',
  },
  logo: {
    width: 120,
    height: 120,
    alignSelf: 'center',
    marginBottom: 20,
    resizeMode: 'contain',
  },
  card: {
    backgroundColor: '#FACC15',
    borderRadius: 12,
    padding: 20,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#00224D',
    textAlign: 'center',
    marginBottom: 5,
  },
  cajon: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#00224D',
    textAlign: 'center',
    marginBottom: 10,
  },
  subtitle: {
    color: '#00224D',
    fontSize: 14,
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
  button: {
    backgroundColor: '#00224D',
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 5,
  },
  buttonText: {
    color: '#fff',
    fontWeight: '600',
  },
});
