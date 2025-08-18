// app/vehicle/add.tsx
import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView, Alert, ActivityIndicator, Pressable } from 'react-native';
import BottomNav from '../../components/BottomNav';
import * as SecureStore from 'expo-secure-store';
import api from '../../services/api';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { vehicleSchema, type VehicleForm } from '../../validation/vehicle';
import { mapApiErrorToForm } from '../../utils/errors';
import AlertBox from '../../components/AlertBox';
import { useFocusEffect } from '@react-navigation/native';

const SELECTED_VEH_KEY = 'selected_vehicle_id';

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

// helpers para ID/flag (si cambian nombres de campos, agrega aquí)
const getVehId = (v: any) => String(v?.veh_id ?? v?.id ?? '');
const isFlaggedSelected = (v: any) =>
  (v?.is_selected ?? v?.selected ?? v?.usr_selected ?? v?.isSelected) === true;

export default function AddVehicleScreen() {
  const [vehiculos, setVehiculos] = useState<any[]>([]);
  const [serverErr, setServerErr] = useState<{ code?: string; message?: string; detail?: string } | null>(null);
  const [loadingList, setLoadingList] = useState<boolean>(true);

  // selección
  const [selectedVehicleId, setSelectedVehicleId] = useState<string | null>(null);
  const [savedSelectedId, setSavedSelectedId] = useState<string | null>(null); // hidrata desde SecureStore
  const [selectLoadingId, setSelectLoadingId] = useState<string | null>(null);

  const { control, handleSubmit, formState: { errors, isSubmitting }, setError, reset } =
    useForm<VehicleForm>({
      resolver: zodResolver(vehicleSchema),
      defaultValues: { veh_brand: '', veh_model: '', veh_year: '', veh_color: '', veh_plate: '' },
      mode: 'onChange',
      reValidateMode: 'onChange',
    });

  // Hidrata selección guardada ANTES de pedir la lista (para no parpadear)
  const hydrateSelection = useCallback(async () => {
    const stored = (await SecureStore.getItemAsync(SELECTED_VEH_KEY))?.trim() ?? null;
    if (stored) {
      setSavedSelectedId(stored);
      if (!selectedVehicleId) setSelectedVehicleId(stored);
      // Si ya hay lista cargada, refleja la marca localmente
      setVehiculos(prev =>
        Array.isArray(prev) && prev.length
          ? prev.map(v => ({ ...v, _selectedLocal: getVehId(v) === stored }))
          : prev
      );
    }
  }, [selectedVehicleId]);

  const fetchVehiculos = useCallback(async () => {
    setLoadingList(true);
    try {
      const usr_id = await SecureStore.getItemAsync('usr_id');
      const token  = await SecureStore.getItemAsync('auth_token');
      if (!usr_id || !token) return;

      const res = await api.get(`/users/${usr_id}/vehicles`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      let list: any[] = res?.data?.data ?? res?.data ?? [];

      // 1) Si el backend ya marca el seleccionado, úsalo como verdad
      const flagged = list.find(isFlaggedSelected);
      if (flagged) {
        const selId = getVehId(flagged);
        setSelectedVehicleId(selId);
        setSavedSelectedId(selId);
        await SecureStore.setItemAsync(SELECTED_VEH_KEY, selId);
        list = list.map(v => ({ ...v, _selectedLocal: getVehId(v) === selId }));
      } else {
        // 2) Si no hay flag, usa lo guardado
        const stored = (await SecureStore.getItemAsync(SELECTED_VEH_KEY))?.trim() ?? null;
        if (stored && list.some(v => getVehId(v) === stored)) {
          setSelectedVehicleId(stored);
          setSavedSelectedId(stored);
          list = list.map(v => ({ ...v, _selectedLocal: getVehId(v) === stored }));
        } else {
          // si nada coincide, limpia
          await SecureStore.deleteItemAsync(SELECTED_VEH_KEY);
          setSavedSelectedId(null);
        }
      }

      setVehiculos(list);
    } catch (error) {
      console.error('Error al obtener vehículos:', error);
    } finally {
      setLoadingList(false);
    }
  }, []);

  // Montaje inicial: hidrata y luego fetch
  useEffect(() => {
    (async () => {
      await hydrateSelection();
      await fetchVehiculos();
    })();
  }, [hydrateSelection, fetchVehiculos]);

  // Al enfocarse la pantalla (cuando regresas)
  useFocusEffect(
    useCallback(() => {
      (async () => {
        await hydrateSelection();
        await fetchVehiculos();
      })();
    }, [hydrateSelection, fetchVehiculos])
  );

  const reachedLimit = vehiculos.length >= 4;

  const handleSelectVehicle = useCallback(async (vehicleId: string) => {
    try {
      setServerErr(null);
      setSelectLoadingId(vehicleId);

      const token  = await SecureStore.getItemAsync('auth_token');
      const usr_id = await SecureStore.getItemAsync('usr_id');
      if (!token || !usr_id) throw new Error('Usuario no autenticado');

      // UI optimista + persistencia inmediata
      setSelectedVehicleId(vehicleId);
      setSavedSelectedId(vehicleId);
      await SecureStore.setItemAsync(SELECTED_VEH_KEY, vehicleId);

      setVehiculos(prev =>
        prev.map(v => ({ ...v, _selectedLocal: getVehId(v) === vehicleId }))
      );

      await api.put(
        `/users/vehicles/${vehicleId}`,
        { usr_id }, // opcional
        { headers: { Authorization: `Bearer ${token}` } }
      );

      Alert.alert('Éxito', 'Vehículo establecido correctamente');

      // Si el backend luego marca flag, esto lo sincroniza
      await fetchVehiculos();
    } catch (err: any) {
      // Revert a estado del servidor
      const errMsg = err?.response?.data?.message || err?.message || 'No se pudo seleccionar el vehículo';
      Alert.alert('Error', errMsg);
      setServerErr({ code: err?.code, message: errMsg, detail: err?.detail });
      await fetchVehiculos();
    } finally {
      setSelectLoadingId(null);
    }
  }, [fetchVehiculos]);

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
            {vehiculos.map((v, index) => {
              const id = getVehId(v) || String(index);
              const apiSelected = isFlaggedSelected(v);
              // Usa, en orden: seleccion actual, guardada, flag backend, y local
              const isSelected =
                (selectedVehicleId ? selectedVehicleId === id : false) ||
                (savedSelectedId ? savedSelectedId === id : false) ||
                apiSelected ||
                v._selectedLocal === true;

              const isLoadingThis = selectLoadingId === id;

              return (
                <View key={id} style={[styles.vehiculoCard, isSelected && styles.vehiculoCardSelected]}>
                  <View style={styles.cardHeader}>
                    <Text style={styles.placas}>{v.veh_plate}</Text>

                    <Pressable
                      onPress={() => handleSelectVehicle(id)}
                      disabled={isLoadingThis}
                      style={[styles.checkbox, isSelected && styles.checkboxChecked, isLoadingThis && { opacity: 0.5 }]}
                    >
                      {isSelected ? <Text style={styles.checkboxTick}>✓</Text> : null}
                    </Pressable>
                  </View>

                  <Text style={styles.modelo}>{`${v.veh_brand} ${v.veh_model}`}</Text>
                  <Text style={styles.extra}>{`${v.veh_color ?? ''} • ${v.veh_year ?? ''}`}</Text>
                </View>
              );
            })}
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

          {/* Placas */}
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
                maxLength={9}
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
  container: { flex: 1, backgroundColor: '#00224D', paddingHorizontal: 20, paddingTop: 60, paddingBottom: 80 },
  sectionTitle: { fontSize: 18, color: '#FACC15', fontWeight: 'bold', marginBottom: 10 },
  vehiculosContainer: { flexDirection: 'row', gap: 10, flexWrap: 'wrap', marginBottom: 20 },
  vehiculoCard: { backgroundColor: '#000', borderRadius: 10, padding: 10, width: '48%', borderWidth: 1, borderColor: '#1F2937' },
  vehiculoCardSelected: { borderColor: '#FACC15', shadowColor: '#FACC15', shadowOpacity: 0.35, shadowRadius: 8, elevation: 3 },
  cardHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 6 },
  placas: { color: '#fff', fontWeight: 'bold', marginBottom: 0, flex: 1 },
  modelo: { color: '#facc15', fontWeight: '600' },
  extra: { color: '#9CA3AF', fontSize: 12 },
  selectedChip: { paddingHorizontal: 8, paddingVertical: 2, borderRadius: 9999, backgroundColor: '#1F2937', borderWidth: 1, borderColor: '#374151' },
  selectedChipText: { color: '#FACC15', fontSize: 12, fontWeight: '700' },
  checkbox: { width: 24, height: 24, borderRadius: 6, borderWidth: 2, borderColor: '#4B5563', alignItems: 'center', justifyContent: 'center', backgroundColor: 'transparent' },
  checkboxChecked: { backgroundColor: '#FACC15', borderColor: '#FACC15' },
  checkboxTick: { color: '#111827', fontSize: 16, fontWeight: '900', marginTop: -2 },
  formCard: { backgroundColor: '#FACC15', borderRadius: 12, padding: 20 },
  formTitle: { fontSize: 16, fontWeight: 'bold', color: '#00224D', marginBottom: 4, textAlign: 'center' },
  formSubtitle: { color: '#00224D', fontSize: 12, textAlign: 'center', marginBottom: 15 },
  input: { backgroundColor: '#fff', borderRadius: 10, paddingHorizontal: 15, height: 50, fontSize: 16, marginBottom: 8, borderWidth: 1, borderColor: '#E5E7EB' },
  inputError: { borderColor: '#B91C1C' },
  errorText: { color: '#7f1d1d', marginTop: -6, marginBottom: 8, fontSize: 12 },
  saveButton: { backgroundColor: '#00224D', paddingVertical: 14, borderRadius: 10, alignItems: 'center', marginTop: 6 },
  saveButtonText: { color: '#fff', fontWeight: '600' },
});
