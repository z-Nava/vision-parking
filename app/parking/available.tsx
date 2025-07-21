// app/parking/available.tsx
import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import BottomNav from '../../components/BottomNav';

const parkingLots = [
  {
    name: 'Universidad Tecnologica de Torreon',
    alias: 'UTT',
    location: 'Carretera Torreon-Matamoros',
  },
  {
    name: 'Milwaukee Tool Torreon',
    alias: 'MW',
    location: 'Boulevard San Pedro',
  },
];

export default function AvailableParking() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Estacionamientos disponibles</Text>

      <ScrollView style={styles.scroll}>
        {parkingLots.map((lot, index) => (
          <View key={index} style={styles.card}>
            <Text style={styles.lotName}>{lot.name}</Text>
            <Text style={styles.lotDetail}>Alias: {lot.alias}</Text>
            <Text style={styles.lotDetail}>Ubicación: {lot.location}</Text>
            <TouchableOpacity style={styles.button}>
              <Text style={styles.buttonText}>Solicitar acceso</Text>
            </TouchableOpacity>
          </View>
        ))}
      </ScrollView>

      {/* Barra inferior */}
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
    marginBottom: 5,
  },
  lotDetail: {
    color: '#ccc',
    marginBottom: 5,
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
  navbar: {
    position: 'absolute',
    bottom: 0,
    backgroundColor: '#001B3A',
    height: 60,
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    borderTopColor: '#003366',
    borderTopWidth: 1,
  },
  navIcon: {
    fontSize: 22,
    color: 'white',
  },
});
