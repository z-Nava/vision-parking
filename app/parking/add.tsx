// app/parking/add.tsx
import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import BottomNav from '../../components/BottomNav';
import * as DocumentPicker from 'expo-document-picker';
import { useRouter } from 'expo-router';


export default function AddParking() {
    const router = useRouter();
  const handleFilePick = async () => {
  try {
    const result = await DocumentPicker.getDocumentAsync({
      type: '*/*',
      copyToCacheDirectory: true,
    });

    if (!result.canceled && result.assets && result.assets.length > 0) {
      const file = result.assets[0];
      alert(`Archivo seleccionado: ${file.name}`);
      // Aquí puedes enviar `file.uri`, `file.name`, etc.
    } else {
      alert('No se seleccionó ningún archivo.');
    }
  } catch (error) {
    console.error('Error al seleccionar archivo:', error);
  }
};

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Agregar nuevo estacionamiento</Text>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>Agregar nuevo estacionamiento</Text>
        <Text style={styles.subtext}>Universidad Tecnologica de Torreon</Text>
        <Text style={styles.instructions}>Busca el archivo para corroborar tu identidad</Text>

        {/* Icono simulado */}
        <Text style={styles.iconPlaceholder}>📄➕</Text>

        <TouchableOpacity style={styles.saveButton} onPress={() => {
                handleFilePick(); // Si quieres seguir mostrando el alert del archivo...
                router.push('/vehicle/config'); // Navegación a la siguiente pantalla
            }}>
          <Text style={styles.saveButtonText}>Guardar solicitud</Text>
        </TouchableOpacity>
      </View>
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
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 20,
  },
  card: {
    backgroundColor: '#FFCC00',
    borderRadius: 12,
    padding: 20,
    alignItems: 'center',
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#00224D',
    marginBottom: 5,
    textAlign: 'center',
  },
  subtext: {
    fontWeight: '600',
    color: '#00224D',
    marginBottom: 10,
  },
  instructions: {
    color: '#00224D',
    textAlign: 'center',
    marginBottom: 20,
  },
  iconPlaceholder: {
    fontSize: 50,
    marginBottom: 20,
  },
  saveButton: {
    backgroundColor: '#00224D',
    paddingVertical: 12,
    paddingHorizontal: 25,
    borderRadius: 8,
  },
  saveButtonText: {
    color: 'white',
    fontWeight: '600',
  },
});
