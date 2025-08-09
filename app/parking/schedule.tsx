// app/parking/schedule.tsx
import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Alert,
  Platform,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import DateTimePicker from '@react-native-community/datetimepicker';
import * as SecureStore from 'expo-secure-store';
import api from '../../services/api';

export default function ScheduleScreen() {
  const router = useRouter();
  const { pks_id, pks_number } = useLocalSearchParams();

  const [initialDate, setInitialDate] = useState(new Date());
  const [endDate, setEndDate] = useState(new Date());
  const [reason, setReason] = useState('');

  const [showPicker, setShowPicker] = useState<{
    type: 'initial' | 'end';
    step: 'date' | 'time';
    visible: boolean;
  }>({ type: 'initial', step: 'date', visible: false });

  const formatDate = (date: Date) => {
    return date.toLocaleString('es-MX', {
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const openPicker = (type: 'initial' | 'end') => {
    if (Platform.OS === 'ios') {
      setShowPicker({ type, step: 'date', visible: true }); // En iOS es uno solo
    } else {
      setShowPicker({ type, step: 'date', visible: true }); // Android necesita doble
    }
  };

  const handlePickerChange = (_event: any, selectedDate?: Date) => {
    if (!selectedDate) {
      setShowPicker({ ...showPicker, visible: false });
      return;
    }

    const currentDate = selectedDate;

    if (showPicker.type === 'initial') {
      if (showPicker.step === 'date') {
        const newDate = new Date(initialDate);
        newDate.setFullYear(currentDate.getFullYear());
        newDate.setMonth(currentDate.getMonth());
        newDate.setDate(currentDate.getDate());

        if (Platform.OS === 'android') {
          setInitialDate(newDate);
          setShowPicker({ ...showPicker, step: 'time', visible: true });
        } else {
          setInitialDate(currentDate);
        }
      } else {
        const newDate = new Date(initialDate);
        newDate.setHours(currentDate.getHours());
        newDate.setMinutes(currentDate.getMinutes());
        setInitialDate(newDate);
        setShowPicker({ ...showPicker, visible: false });
      }
    } else {
      if (showPicker.step === 'date') {
        const newDate = new Date(endDate);
        newDate.setFullYear(currentDate.getFullYear());
        newDate.setMonth(currentDate.getMonth());
        newDate.setDate(currentDate.getDate());

        if (Platform.OS === 'android') {
          setEndDate(newDate);
          setShowPicker({ ...showPicker, step: 'time', visible: true });
        } else {
          setEndDate(currentDate);
        }
      } else {
        const newDate = new Date(endDate);
        newDate.setHours(currentDate.getHours());
        newDate.setMinutes(currentDate.getMinutes());
        setEndDate(newDate);
        setShowPicker({ ...showPicker, visible: false });
      }
    }
  };

  const handleReservar = async () => {
  const usr_id = await SecureStore.getItemAsync('usr_id');
  const token = await SecureStore.getItemAsync('auth_token');

  if (!usr_id || !token || !pks_id) {
    Alert.alert('Error', 'Faltan datos para crear la reservación');
    return;
  }

  if (initialDate >= endDate) {
    Alert.alert("Error", "La fecha de fin debe ser posterior a la de inicio.");
    return;
  }

  try {
    await api.post('/reservations', {
      usr_id,
      pks_id,
      rsv_reason: reason,
      rsv_initial_date: initialDate.toISOString(), // formato ISO válido
      rsv_end_date: endDate.toISOString()
    }, {
      headers: { Authorization: `Bearer ${token}` }
    });

    Alert.alert('¡Reservado!', `Tu cajón ${pks_number} ha sido reservado`);
    router.push('/home/indexapp');
  } catch (err) {
    console.error(err);
    Alert.alert('Error', 'No se pudo crear la reservación');
  }
}; 
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Reservar Cajón {pks_number}</Text>

      <Text style={styles.label}>Motivo</Text>
      <TextInput
        style={styles.input}
        placeholder="Motivo de la reservación"
        placeholderTextColor="#ccc"
        value={reason}
        onChangeText={setReason}
      />

      <Text style={styles.label}>Fecha de inicio</Text>
      <TouchableOpacity
        onPress={() => openPicker('initial')}
        style={styles.dateButton}
      >
        <Text style={styles.dateText}>{formatDate(initialDate)}</Text>
      </TouchableOpacity>

      <Text style={styles.label}>Fecha de fin</Text>
      <TouchableOpacity
        onPress={() => openPicker('end')}
        style={styles.dateButton}
      >
        <Text style={styles.dateText}>{formatDate(endDate)}</Text>
      </TouchableOpacity>

      {showPicker.visible && (
        <DateTimePicker
          value={
            showPicker.type === 'initial' ? initialDate : endDate
          }
          mode={showPicker.step === 'date' ? 'date' : 'time'}
          display="default"
          onChange={handlePickerChange}
        />
      )}

      <TouchableOpacity style={styles.button} onPress={handleReservar}>
        <Text style={styles.buttonText}>Reservar</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#00224D',
    padding: 20,
    paddingTop: 60,
  },
  title: {
    color: '#FACC15',
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  label: {
    color: '#fff',
    marginTop: 10,
    marginBottom: 5,
  },
  input: {
    backgroundColor: '#001A3D',
    color: '#fff',
    borderRadius: 8,
    padding: 10,
  },
  dateButton: {
    backgroundColor: '#001A3D',
    borderRadius: 8,
    padding: 10,
    marginBottom: 10,
  },
  dateText: {
    color: '#FACC15',
    fontWeight: '600',
  },
  button: {
    backgroundColor: '#FACC15',
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 20,
  },
  buttonText: {
    color: '#00224D',
    fontWeight: 'bold',
    fontSize: 16,
  },
});
