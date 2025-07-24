import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import BottomNav from '../../components/BottomNav';

export default function AddVehicleScreen() {
  const [marca, setMarca] = useState('');
  const [modelo, setModelo] = useState('');
  const [anio, setAnio] = useState('');
  const [color, setColor] = useState('');
  const [placas, setPlacas] = useState('');

  const handleSaveVehicle = () => {
    if (marca && modelo && anio && color && placas) {
      alert('Vehículo guardado (simulado)');
      // Aquí conectas con tu servicio de API
    } else {
      alert('Completa todos los campos');
    }
  };

  const vehiculos = [
    { placas: 'DEF-5678', modelo: 'Silverado 2022' },
    { placas: 'XYZ-9334', modelo: 'Tacoma 2016' },
  ];

  return (
    <View style={styles.container}>
      <ScrollView>

        {/* Mis vehículos */}
        <Text style={styles.sectionTitle}>Mis vehículos</Text>
        <View style={styles.vehiculosContainer}>
          {vehiculos.map((v, index) => (
            <View key={index} style={styles.vehiculoCard}>
              <Text style={styles.placas}>{v.placas}</Text>
              <Text style={styles.modelo}>{v.modelo}</Text>
            </View>
          ))}
        </View>

        {/* Formulario */}
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

          <TouchableOpacity style={styles.saveButton} onPress={handleSaveVehicle}>
            <Text style={styles.saveButtonText}>Guardar vehículo</Text>
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
