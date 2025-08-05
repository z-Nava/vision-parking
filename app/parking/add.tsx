import * as DocumentPicker from 'expo-document-picker';
import { useLocalSearchParams, useRouter } from 'expo-router';
import * as SecureStore from 'expo-secure-store';
import React, { useState } from 'react';
import { Alert, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import BottomNav from '../../components/BottomNav';
import api from '../../services/api';

export default function AddParking() {
  const router = useRouter();
  const { cmp_id, cmp_name } = useLocalSearchParams();

  const [motivo, setMotivo] = useState('');
  const [file, setFile] = useState<any>(null);

  const handleFilePick = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: ['application/pdf', 'image/png', 'image/jpeg'],
        copyToCacheDirectory: true,
      });

      if (!result.canceled && result.assets.length > 0) {
        const selected = result.assets[0];
        setFile(selected);
        Alert.alert('Archivo seleccionado', selected.name);
      } else {
        Alert.alert('No se seleccionó ningún archivo.');
      }
    } catch (error) {
      console.error('Error al seleccionar archivo:', error);
    }
  };

  const handleSubmit = async () => {
  if (!file) {
    Alert.alert('Archivo requerido', 'Por favor selecciona un archivo.');
    return;
  }

  if (!motivo.trim()) {
    Alert.alert('Campo requerido', 'Por favor ingresa un motivo.');
    return;
  }

  try {
    const usr_id = await SecureStore.getItemAsync('usr_id');
    if (!usr_id) throw new Error('ID de usuario no encontrado.');

    // 1. Enviar solicitud de acceso
    const {data} = await api.post('/company-access-requests', {
      usr_id,
      cmp_id,
      cma_description: motivo,
    });
    console.log('Solicitud de acceso enviada:', data);
    const cma_id = data.data?.cma_id;
    if (!cma_id) throw new Error('No se recibió el ID de la solicitud.');

    console.log('Solicitud creada, cma_id:', cma_id);

    // 2. Subir archivo con el fil_relation_id (relación a la solicitud)
    const formData = new FormData();
    formData.append('file', {
      uri: file.uri,
      name: file.name,
      type: file.mimeType || 'application/octet-stream',
    } as any);
    formData.append('fil_relation_id', String(cma_id)); // Muy importante

    const uploadResponse = await api.post('/files/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });

    console.log('Archivo subido correctamente:', uploadResponse.data);
    Alert.alert('Éxito', 'Solicitud enviada y archivo cargado correctamente.');
    router.push('/vehicle/config');

  } catch (error: any) {
    console.error('Error en la solicitud:', error?.response?.data || error.message);
    Alert.alert('Error', 'Ocurrió un problema al enviar la solicitud o subir el archivo.');
  }
};


  return (
    <View style={styles.container}>
      <Text style={styles.title}>Agregar nuevo estacionamiento</Text>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>Solicitar acceso a:</Text>
        <Text style={styles.subtext}>{cmp_name}</Text>

        <Text style={styles.instructions}>1. Selecciona un archivo (PDF, PNG o JPG)</Text>
        <TouchableOpacity style={styles.saveButton} onPress={handleFilePick}>
          <Text style={styles.saveButtonText}>Seleccionar archivo</Text>
        </TouchableOpacity>

        <Text style={styles.instructions}>2. Ingresa el motivo de tu solicitud</Text>
        <TextInput
          style={styles.input}
          placeholder="Ejemplo: Soy estudiante y necesito acceso diario"
          placeholderTextColor="#888"
          multiline
          numberOfLines={4}
          value={motivo}
          onChangeText={setMotivo}
        />

        <TouchableOpacity style={styles.saveButton} onPress={handleSubmit}>
          <Text style={styles.saveButtonText}>Guardar solicitud</Text>
        </TouchableOpacity>
      </View>

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
    marginBottom: 10,
  },
  input: {
    width: '100%',
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 10,
    color: '#00224D',
    marginBottom: 15,
    textAlignVertical: 'top',
  },
  fileButton: {
    backgroundColor: '#00224D',
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 15,
    marginBottom: 20,
  },
  fileButtonText: {
    color: 'white',
    fontWeight: '600',
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
