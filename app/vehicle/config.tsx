// app/vehicle/config.tsx
import React, { useEffect, useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Image, ScrollView, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import * as SecureStore from 'expo-secure-store';
import api from '../../services/api';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { vehicleSchema, type VehicleForm } from '../../validation/vehicle';
import AlertBox from '../../components/AlertBox';
import { mapApiErrorToForm } from '../../utils/errors';

export default function ConfigVehicleScreen() {
  const router = useRouter();
  const {
    control,
    handleSubmit,
    formState: { errors, isSubmitting, isValid },
    setError,
  } = useForm<VehicleForm>({
    resolver: zodResolver(vehicleSchema),
    defaultValues: { veh_brand: '', veh_model: '', veh_year: '', veh_color: '', veh_plate: '' },
    mode: 'onChange',
    reValidateMode: 'onChange',
  });

  const [serverErr, setServerErr] = useState<{ code?: string; message?: string; detail?: string } | null>(null);

  // Configura automáticamente el header Authorization
  useEffect(() => {
    (async () => {
      const token = await SecureStore.getItemAsync('auth_token');
      if (token) {
        api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      }
    })();
  }, []);

  const onSubmit = async (data: VehicleForm) => {
    setServerErr(null);
    try {
      const usr_id = await SecureStore.getItemAsync('usr_id');
      if (!usr_id) throw new Error('Sesión no válida. Intenta iniciar sesión nuevamente.');

      // 1) Registrar vehículo
      await api.post('/vehicles', {
        usr_id,
        veh_plate: data.veh_plate.trim().toUpperCase(),
        veh_brand: data.veh_brand.trim(),
        veh_model: data.veh_model.trim(),
        veh_year: Number(data.veh_year),
        veh_color: data.veh_color.trim(),
      });

      // 2) Marcar usuario como configurado
      const configRes = await api.put(`/configurated/${usr_id}`, {});
      if (configRes.status !== 200) throw new Error('No se pudo actualizar la configuración del usuario.');

      Alert.alert('Éxito', 'Vehículo registrado correctamente');
      router.push('/home/indexapp');
    } catch (err: any) {
      const mapped = mapApiErrorToForm<VehicleForm>(err, setError);
      if (!mapped) {
        const status = err?.response?.status;
        if (status === 409) {
          setError('veh_plate', { message: 'Placa ya registrada' });
        } else if (status === 404) {
          setServerErr({ code: 'LNG072', message: 'No se pudo actualizar la configuración del usuario' });
        } else {
          setServerErr({ code: err?.code, message: err?.response?.data?.message || err?.message, detail: err?.detail });
        }
      }
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Image source={require('../../assets/images/react-logo.png')} style={styles.logo} />

      <Text style={styles.title}>Configura un vehículo</Text>
      <Text style={styles.subtitle}>Ingresa los datos de tu vehículo</Text>

      {serverErr && (
        <AlertBox type="error" code={serverErr.code} message={serverErr.message} detail={serverErr.detail} />
      )}

      {/* Marca */}
      <Controller
        control={control}
        name="veh_brand"
        render={({ field: { value, onChange, onBlur } }) => (
          <TextInput
            style={styles.input}
            placeholder="Marca del vehículo"
            placeholderTextColor="#666"
            value={value}
            onChangeText={onChange}
            onBlur={onBlur}
          />
        )}
      />
      {errors.veh_brand?.message && <Text style={styles.err}>{errors.veh_brand.message}</Text>}

      {/* Modelo */}
      <Controller
        control={control}
        name="veh_model"
        render={({ field: { value, onChange, onBlur } }) => (
          <TextInput
            style={styles.input}
            placeholder="Modelo del vehículo"
            placeholderTextColor="#666"
            value={value}
            onChangeText={onChange}
            onBlur={onBlur}
          />
        )}
      />
      {errors.veh_model?.message && <Text style={styles.err}>{errors.veh_model.message}</Text>}

      {/* Año */}
      <Controller
        control={control}
        name="veh_year"
        render={({ field: { value, onChange, onBlur } }) => (
          <TextInput
            style={styles.input}
            placeholder="Año del vehículo"
            placeholderTextColor="#666"
            keyboardType="numeric"
            value={value}
            onChangeText={onChange}
            onBlur={onBlur}
            maxLength={4}
          />
        )}
      />
      {errors.veh_year?.message && <Text style={styles.err}>{errors.veh_year.message}</Text>}

      {/* Color */}
      <Controller
        control={control}
        name="veh_color"
        render={({ field: { value, onChange, onBlur } }) => (
          <TextInput
            style={styles.input}
            placeholder="Color del vehículo (ej. Azul o #1F4E79)"
            placeholderTextColor="#666"
            value={value}
            onChangeText={onChange}
            onBlur={onBlur}
            autoCapitalize="characters"
          />
        )}
      />
      {errors.veh_color?.message && <Text style={styles.err}>{errors.veh_color.message}</Text>}

      {/* Placas */}
      <Controller
        control={control}
        name="veh_plate"
        render={({ field: { value, onChange, onBlur } }) => (
          <TextInput
            style={styles.input}
            placeholder="Placas del vehículo (AAA-000-A)"
            placeholderTextColor="#666"
            value={value}
            onChangeText={(t) => onChange(t.toUpperCase())}
            onBlur={onBlur}
            autoCapitalize="characters"
            maxLength={9}
          />
        )}
      />
      {errors.veh_plate?.message && <Text style={styles.err}>{errors.veh_plate.message}</Text>}

      <TouchableOpacity
        style={[styles.button, !isValid && { opacity: 0.6 }]}
        onPress={handleSubmit(onSubmit)}
        disabled={isSubmitting || !isValid}
      >
        <Text style={styles.buttonText}>{isSubmitting ? 'Registrando...' : 'Registrar vehículo'}</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flexGrow: 1, backgroundColor: '#00224D', alignItems: 'center', justifyContent: 'center', padding: 20 },
  logo: { width: 150, height: 150, marginBottom: 30, resizeMode: 'contain' },
  title: { fontSize: 22, fontWeight: '700', color: '#fff', marginBottom: 5 },
  subtitle: { color: '#ccc', fontSize: 14, marginBottom: 10, textAlign: 'center' },
  input: { width: '100%', height: 50, backgroundColor: '#fff', borderRadius: 10, paddingHorizontal: 15, fontSize: 16, marginBottom: 6, borderWidth: 1, borderColor: '#D1D5DB' },
  err: { color: '#b71c1c', marginBottom: 10, fontSize: 12, alignSelf: 'flex-start' },
  button: { width: '100%', backgroundColor: '#0A3973', paddingVertical: 14, borderRadius: 10, alignItems: 'center', marginTop: 10 },
  buttonText: { color: '#fff', fontWeight: '600', fontSize: 16 },
});
