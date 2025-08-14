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
  ActivityIndicator,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import DateTimePicker from '@react-native-community/datetimepicker';
import * as SecureStore from 'expo-secure-store';
import api from '../../services/api';
import { notifyIn } from '../../services/notifications';

export default function ScheduleScreen() {
  const router = useRouter();
  const { pks_id, pks_number } = useLocalSearchParams();

  const [initialDate, setInitialDate] = useState(new Date());
  const [endDate, setEndDate] = useState(new Date());
  const [reason, setReason] = useState('');
  const [submitting, setSubmitting] = useState(false);

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
    setShowPicker({ type, step: 'date', visible: true });
  };

  const handlePickerChange = (_event: any, selectedDate?: Date) => {
    if (!selectedDate) {
      setShowPicker((s) => ({ ...s, visible: false }));
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
          setShowPicker({ ...showPicker, visible: false });
        }
      } else {
        const newDate = new Date(initialDate);
        newDate.setHours(currentDate.getHours());
        newDate.setMinutes(currentDate.getMinutes());
        newDate.setSeconds(0, 0);
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
          setShowPicker({ ...showPicker, visible: false });
        }
      } else {
        const newDate = new Date(endDate);
        newDate.setHours(currentDate.getHours());
        newDate.setMinutes(currentDate.getMinutes());
        newDate.setSeconds(0, 0);
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

    // Validaciones
    const now = new Date();
    const start = new Date(initialDate);
    const end = new Date(endDate);

    if (!reason || reason.trim().length < 5) {
      Alert.alert('Atención', 'Indica un motivo (mínimo 5 caracteres).');
      return;
    }
    if (start < now) {
      Alert.alert('Atención', 'La fecha/hora inicial debe ser futura.');
      return;
    }
    if (end <= start) {
      Alert.alert('Atención', 'La fecha de fin debe ser posterior a la de inicio.');
      return;
    }
    const minMs = 15 * 60 * 1000; // 15 minutos
    if (end.getTime() - start.getTime() < minMs) {
      Alert.alert('Atención', 'La reservación debe durar al menos 15 minutos.');
      return;
    }

    // Normalizar ISO
    const startISO = new Date(start.setSeconds(0, 0)).toISOString();
    const endISO = new Date(end.setSeconds(0, 0)).toISOString();

    try {
      setSubmitting(true);

      await api.post(
        '/reservations',
        {
          usr_id,
          pks_id,
          rsv_reason: reason.trim(),
          rsv_initial_date: startISO,
          rsv_end_date: endISO,
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      await notifyIn({
        title: 'Recordatorio de reservación',
        body: `Tu reservación del cajón ${pks_number ?? ''} inicia a las ${new Date(startISO).toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit' })}.`,
        seconds: 10, 
        data: { type: 'reservation-reminder', pksNumber: pks_number, startAt: startISO },
      });
      await notifyIn({
        title: 'Recordatorio de reservación',
        body: `Recuerda llegar 5 minutos antes de que inicie tu reservacion!`,
        seconds: 15, 
        data: { type: 'reservation-reminder', pksNumber: pks_number, startAt: startISO },
      });



      Alert.alert('¡Reservado!', `Tu cajón ${pks_number} ha sido reservado`);
      router.push('/home/indexapp');
    } catch (err: any) {
      console.error('POST /reservations error:', err?.response?.data || err?.message || err);
      const msg = err?.response?.data?.message || 'No se pudo crear la reservación';
      Alert.alert('Error', msg);
    } finally {
      setSubmitting(false);
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
      <TouchableOpacity onPress={() => openPicker('initial')} style={styles.dateButton}>
        <Text style={styles.dateText}>{formatDate(initialDate)}</Text>
      </TouchableOpacity>

      <Text style={styles.label}>Fecha de fin</Text>
      <TouchableOpacity onPress={() => openPicker('end')} style={styles.dateButton}>
        <Text style={styles.dateText}>{formatDate(endDate)}</Text>
      </TouchableOpacity>

      {showPicker.visible && (
        <DateTimePicker
          value={showPicker.type === 'initial' ? initialDate : endDate}
          mode={showPicker.step === 'date' ? 'date' : 'time'}
          display="default"
          onChange={handlePickerChange}
        />
      )}

      <TouchableOpacity
        style={[styles.button, submitting && { opacity: 0.7 }]}
        onPress={handleReservar}
        disabled={submitting}
      >
        {submitting ? (
          <ActivityIndicator color="#00224D" />
        ) : (
          <Text style={styles.buttonText}>Reservar</Text>
        )}
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
