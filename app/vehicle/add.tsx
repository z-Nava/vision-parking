// app/vehicle/add.tsx
import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView, Alert, ActivityIndicator } from 'react-native';
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
  const [loadingList, setLoadingList] = useState<boolean>(true);

  const { control, handleSubmit, formState: { errors, isSubmitting }, setError, reset, watch } =
    useForm<VehicleForm>({
      resolver: zodResolver(vehicleSchema),
      defaultValues: { veh_brand: '', veh_model: '', veh_year: '', veh_color: '', veh_plate: '' },
      mode: 'onChange',
      reValidateMode: 'onChange',
    });

  const fetchVehiculos = useCallback(async () => {
    setLoadingList(true);
    try {
      const usr_id = await SecureStore.getItemAsync('usr_id');
      const token  = await SecureStore.getItemAsync('auth_token');
      if (!usr_id || !token) return;
      const res = await api.get(`/users/${usr_id}/vehicles`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const list = res?.data?.data ?? res?.data ?? [];
      setVehiculos(list);
    } catch (error) {
      console.error('Error al obtener vehículos:', error);
    } finally {
      setLoadingList(false);
    }
  }, []);

  useEffect(() => { fetchVehiculos(); }, [fetchVehiculos]);

  const reachedLimit = vehiculos.length >= 4;

  const onSubmit = async (data: VehicleForm) => {
    setServerErr(null);
    try {
      const usr_id = await SecureStore.getItemAsync('usr_id');
      const token  = await SecureStore.getItemAsync('auth_token');
      if (!usr_id || !token) throw new Error('Usuario no autenticado');

      await api.post('/vehicles', {
        usr_id,
        veh_plate: data.veh_plate.trim().toUpperCase(),
        veh_brand: data.veh_brand.trim(),
        veh_model: data.veh_model.trim(),
        veh_year: Number(data.veh_year),
        veh_color: data.veh_color.trim(),
      }, {
        headers: { Authorization: `Bearer ${token}` }
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

  // ===== UI =====
  return (
    <View style={styles.container}>
      <ScrollView>
        <Text style={styles.sectionTitle}>Mis vehículos</Text>

        {loadingList ? (
          <ActivityIndicator size="large" color="#FACC15" style={{ marginBottom: 20 }} />
        ) : (
          <View style={styles.vehiculosContainer}>
            {vehiculos.map((v, index) => (
              <View key={index} style={styles.vehiculoCard}>
                <Text style={styles.placas}>{v.veh_plate}</Text>
                <Text style={styles.modelo}>{`${v.veh_brand} ${v.veh_model}`}</Text>
              </View>
            ))}
          </View>
        )}

        <View style={styles.formCard}>
          <Text style={styles.formTitle}>Agregar nuevo vehículo</Text>
          <Text style={styles.formSubtitle}>Solo tienes un límite de 4 vehículos</Text>

          {serverErr && (
            <AlertBox
              type="error"
              code={serverErr.code}
              message={serverErr.message}
              detail={serverErr.detail}
            />
          )}

          {/* Marca */}
          <Controller
            control={control}
            name="veh_brand"
            render={({ field: { value, onChange, onBlur } }) => (
              <TextInput
                style={[styles.input, errors.veh_brand && styles.inputError]}
                placeholder="Marca del vehículo"
                placeholderTextColor="#666"
                value={value}
                onChangeText={onChange}
                onBlur={onBlur}
                editable={!reachedLimit && !isSubmitting}
              />
            )}
          />
          {errors.veh_brand && <Text style={styles.errorText}>{errors.veh_brand.message}</Text>}

          {/* Modelo */}
          <Controller
            control={control}
            name="veh_model"
            render={({ field: { value, onChange, onBlur } }) => (
              <TextInput
                style={[styles.input, errors.veh_model && styles.inputError]}
                placeholder="Modelo del vehículo"
                placeholderTextColor="#666"
                value={value}
                onChangeText={onChange}
                onBlur={onBlur}
                editable={!reachedLimit && !isSubmitting}
              />
            )}
          />
          {errors.veh_model && <Text style={styles.errorText}>{errors.veh_model.message}</Text>}

          {/* Año */}
          <Controller
            control={control}
            name="veh_year"
            render={({ field: { value, onChange, onBlur } }) => (
              <TextInput
                style={[styles.input, errors.veh_year && styles.inputError]}
                placeholder="Año del vehículo (e.g. 2018)"
                placeholderTextColor="#666"
                keyboardType="numeric"
                maxLength={4}
                value={value}
                onChangeText={onChange}
                onBlur={onBlur}
                editable={!reachedLimit && !isSubmitting}
              />
            )}
          />
          {errors.veh_year && <Text style={styles.errorText}>{errors.veh_year.message}</Text>}

          {/* Color */}
          <Controller
            control={control}
            name="veh_color"
            render={({ field: { value, onChange, onBlur} }) => (
              <TextInput
                style={[styles.input, errors.veh_color && styles.inputError]}
                placeholder="Color del vehículo"
                placeholderTextColor="#666"
                value={value}
                onChangeText={onChange}
                onBlur={onBlur}
                editable={!reachedLimit && !isSubmitting}
              />
            )}
          />
          {errors.veh_color && <Text style={styles.errorText}>{errors.veh_color.message}</Text>}

          {/* Placas (formateo en vivo) */}
          <Controller
            control={control}
            name="veh_plate"
            render={({ field: { value, onChange, onBlur } }) => (
              <TextInput
                style={[styles.input, errors.veh_plate && styles.inputError]}
                placeholder="Placas (AAA-000-A)"
                placeholderTextColor="#666"
                autoCapitalize="characters"
                value={value}
                onChangeText={(t) => onChange(formatPlateInput(t))}
                onBlur={onBlur}
                maxLength={9} // AAA-000-A
                editable={!reachedLimit && !isSubmitting}
              />
            )}
          />
          {errors.veh_plate && <Text style={styles.errorText}>{errors.veh_plate.message}</Text>}

          <TouchableOpacity
            style={[styles.saveButton, (reachedLimit || isSubmitting) && { opacity: 0.7 }]}
            onPress={handleSubmit(onSubmit)}
            disabled={reachedLimit || isSubmitting}
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
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  inputError: {
    borderColor: '#B91C1C',
  },
  errorText: {
    color: '#7f1d1d',
    marginTop: -6,
    marginBottom: 8,
    fontSize: 12,
  },
  saveButton: {
    backgroundColor: '#00224D',
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 6,
  },
  saveButtonText: {
    color: '#fff',
    fontWeight: '600',
  },
});
