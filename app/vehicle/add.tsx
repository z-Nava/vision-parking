import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView, Alert } from 'react-native';
import BottomNav from '../../components/BottomNav';
import * as SecureStore from 'expo-secure-store';
import api from '../../services/api';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { vehicleSchema, type VehicleForm } from '../../validation/vehicle';
import { mapApiErrorToForm } from '../../utils/errors';
import AlertBox from '../../components/AlertBox';

/** Formatea en vivo a AAA-000-A */
function formatPlateInput(raw: string): string {
  const clean = (raw || '').toUpperCase().replace(/[^A-Z0-9]/g, '');
  const letters1 = clean.slice(0, 3).replace(/[^A-Z]/g, '');
  const numbers  = clean.slice(3, 6).replace(/[^0-9]/g, '');
  const letter2  = clean.slice(6, 7).replace(/[^A-Z]/g, '');
  let out = letters1;
  if (clean.length > 3) out += '-' + numbers;
  if (clean.length > 6) out += '-' + letter2;
  return out;
}

export default function AddVehicleScreen() {
  const [vehiculos, setVehiculos] = useState<any[]>([]);
  const [serverErr, setServerErr] = useState<{ code?: string; message?: string; detail?: string } | null>(null);

  const { control, handleSubmit, formState: { errors, isSubmitting, isValid }, setError, reset } =
    useForm<VehicleForm>({
      resolver: zodResolver(vehicleSchema),
      defaultValues: { veh_brand: '', veh_model: '', veh_year: '', veh_color: '', veh_plate: '' },
      mode: 'onChange',
      reValidateMode: 'onChange',
    });

  const fetchVehiculos = useCallback(async () => {
    try {
      const usr_id = await SecureStore.getItemAsync('usr_id');
      if (!usr_id) return;
      const res = await api.get(`/users/${usr_id}/vehicles`);
      const list = res?.data?.data ?? res?.data ?? [];
      setVehiculos(list);
    } catch (error) {
      console.error('Error al obtener vehículos:', error);
    }
  }, []);

  useEffect(() => { fetchVehiculos(); }, [fetchVehiculos]);

  const reachedLimit = vehiculos.length >= 4;

  const onSubmit = async (data: VehicleForm) => {
    setServerErr(null);
    try {
      const usr_id = await SecureStore.getItemAsync('usr_id');
      if (!usr_id) throw new Error('Usuario no autenticado');

      await api.post('/vehicles', {
        usr_id,
        veh_plate: data.veh_plate.trim().toUpperCase(),
        veh_brand: data.veh_brand.trim(),
        veh_model: data.veh_model.trim(),
        veh_year: Number(data.veh_year),
        veh_color: data.veh_color.trim(),
      });

      Alert.alert('Éxito', 'Vehículo guardado correctamente');
      reset();
      await fetchVehiculos();
    } catch (err: any) {
      const mapped = mapApiErrorToForm<VehicleForm>(err, setError);
      if (!mapped) {
        setServerErr({ code: err?.code, message: err?.response?.data?.message || err?.message, detail: err?.detail });
      }
    }
  };

  return (
    <View style={styles.container}>
      <ScrollView>

        <Text style={styles.sectionTitle}>Mis vehículos</Text>

        {serverErr && (
          <AlertBox type="error" code={serverErr.code} message={serverErr.message} detail={serverErr.detail} />
        )}

        <View style={styles.vehiculosContainer}>
          {vehiculos.map((v, index) => (
            <View key={index} style={styles.vehiculoCard}>
              <Text style={styles.placas}>{v.veh_plate}</Text>
              <Text style={styles.modelo}>{`${v.veh_brand} ${v.veh_model}`}</Text>
            </View>
          ))}
          {vehiculos.length === 0 && (
            <Text style={{ color: '#cbd5e1' }}>Aún no tienes vehículos registrados.</Text>
          )}
        </View>

        <View style={styles.formCard}>
          <Text style={styles.formTitle}>Agregar nuevo vehículo</Text>
          <Text style={styles.formSubtitle}>Solo tienes un límite de 4 vehículos</Text>

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
            render={({ field: { value, onChange, onBlur} }) => (
              <TextInput
                style={styles.input}
                placeholder="Año del vehículo"
                placeholderTextColor="#666"
                keyboardType="numeric"
                maxLength={4}
                value={value}
                onChangeText={onChange}
                onBlur={onBlur}
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
              />
            )}
          />
          {errors.veh_color?.message && <Text style={styles.err}>{errors.veh_color.message}</Text>}

          {/* Placas (autoformato AAA-000-A) */}
          <Controller
            control={control}
            name="veh_plate"
            render={({ field: { value, onChange, onBlur } }) => (
              <TextInput
                style={styles.input}
                placeholder="Placas del vehículo (AAA-000-A)"
                placeholderTextColor="#666"
                autoCapitalize="characters"
                value={value}
                onChangeText={(t) => onChange(formatPlateInput(t))}
                onBlur={onBlur}
                maxLength={9}
              />
            )}
          />
          {errors.veh_plate?.message && <Text style={styles.err}>{errors.veh_plate.message}</Text>}

          <TouchableOpacity
            style={[styles.saveButton, (isSubmitting || !isValid || reachedLimit) && { opacity: 0.6 }]}
            onPress={handleSubmit(onSubmit)}
            disabled={isSubmitting || !isValid || reachedLimit}
          >
            <Text style={styles.saveButtonText}>
              {reachedLimit ? 'Límite alcanzado' : (isSubmitting ? 'Guardando...' : 'Guardar vehículo')}
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      <BottomNav />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#00224D', paddingHorizontal: 20, paddingTop: 60, paddingBottom: 80 },
  sectionTitle: { fontSize: 18, color: '#FACC15', fontWeight: 'bold', marginBottom: 10 },
  vehiculosContainer: { flexDirection: 'row', gap: 10, flexWrap: 'wrap', marginBottom: 20 },
  vehiculoCard: { backgroundColor: '#000', borderRadius: 10, padding: 10, width: '48%' },
  placas: { color: '#fff', fontWeight: 'bold', marginBottom: 5 },
  modelo: { color: '#facc15', fontWeight: '600' },
  formCard: { backgroundColor: '#FACC15', borderRadius: 12, padding: 20 },
  formTitle: { fontSize: 16, fontWeight: 'bold', color: '#00224D', marginBottom: 4, textAlign: 'center' },
  formSubtitle: { color: '#00224D', fontSize: 12, textAlign: 'center', marginBottom: 15 },
  input: { backgroundColor: '#fff', borderRadius: 10, paddingHorizontal: 15, height: 50, fontSize: 16, marginBottom: 6, borderWidth: 1, borderColor: '#D1D5DB' },
  err: { color: '#b71c1c', marginBottom: 10, fontSize: 12, alignSelf: 'flex-start' },
  saveButton: { backgroundColor: '#00224D', paddingVertical: 14, borderRadius: 10, alignItems: 'center', marginTop: 5 },
  saveButtonText: { color: '#fff', fontWeight: '600' },
});
