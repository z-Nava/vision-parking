import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import BottomNav from '../../components/BottomNav';

export default function CancelReservationScreen() {
  const router = useRouter();
  const [motivo, setMotivo] = useState('');

  const handleCancelar = () => {
    if (motivo.trim() === '') {
      Alert.alert('Campo requerido', 'Por favor ingresa un motivo de cancelación.');
      return;
    }

    Alert.alert('Reservación cancelada', `Motivo: ${motivo}`);
    // Aquí iría la lógica real para cancelar una reservación con API
    setMotivo('');
  };

  const handleVolver = () => {
    router.back(); // o puedes hacer router.push('/profile/indexuser')
  };

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.cardContainer}>
        <View style={styles.card}>
          <Text style={styles.title}>¿Deseas cancelar esta reservación?</Text>
          <Text style={styles.subtitle}>Ingresa un motivo de cancelación</Text>

          <TextInput
            style={styles.textArea}
            placeholder="Ej. Ya no necesito el espacio / Error al seleccionar el cajón"
            placeholderTextColor="#666"
            multiline
            numberOfLines={5}
            value={motivo}
            onChangeText={setMotivo}
          />

          <TouchableOpacity style={styles.cancelButton} onPress={handleCancelar}>
            <Text style={styles.cancelButtonText}>Cancelar reservación</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.backButton} onPress={handleVolver}>
            <Text style={styles.backButtonText}>Volver</Text>
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
  cardContainer: {
    flexGrow: 1,
    justifyContent: 'center',
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
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 14,
    color: '#00224D',
    textAlign: 'center',
    marginBottom: 15,
  },
  textArea: {
    backgroundColor: '#fff',
    borderRadius: 10,
    paddingHorizontal: 15,
    paddingTop: 15,
    height: 130,
    textAlignVertical: 'top',
    fontSize: 14,
    marginBottom: 20,
  },
  cancelButton: {
    backgroundColor: '#b91c1c',
    borderRadius: 10,
    paddingVertical: 14,
    alignItems: 'center',
    marginBottom: 10,
  },
  cancelButtonText: {
    color: '#fff',
    fontWeight: '600',
  },
  backButton: {
    backgroundColor: '#00224D',
    borderRadius: 10,
    paddingVertical: 14,
    alignItems: 'center',
  },
  backButtonText: {
    color: '#fff',
    fontWeight: '600',
  },
});
