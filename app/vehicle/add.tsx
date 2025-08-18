// app/vehicle/add.tsx
import React, { useEffect, useState, useCallback } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView,
  Alert, ActivityIndicator, Pressable, Modal
} from 'react-native';
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
const DEFAULT_HEX = '#334155';
const HEX3or6_RE = /^#([0-9A-F]{3}|[0-9A-F]{6})$/i;

// Paleta básica (puedes editarla)
const PALETTE = [
  '#000000','#FFFFFF','#EF4444','#F97316','#F59E0B','#10B981',
  '#06B6D4','#3B82F6','#8B5CF6','#EC4899','#94A3B8','#334155',
  '#111827','#D1D5DB','#22C55E','#A855F7'
];

/** Normaliza a #RRGGBB (si viene #RGB lo expando; quito alpha si existiera). */
function normalizeHex(input?: string | null): string {
  if (!input) return DEFAULT_HEX;
  let s = input.trim().toUpperCase();
  if (!s.startsWith('#')) s = `#${s}`;
  s = s.replace(/[^#0-9A-F]/g, '');
  if (s.length === 9) s = s.slice(0, 7); // #RRGGBBAA -> #RRGGBB
  if (s.length === 5) s = s.slice(0, 4); // #RGBA -> #RGB
  if (HEX3or6_RE.test(s)) {
    if (s.length === 4) {
      const r = s[1], g = s[2], b = s[3];
      s = `#${r}${r}${g}${g}${b}${b}`;
    }
    return s;
  }
  return DEFAULT_HEX;
}

/** AAA-000-A */
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

const getVehId = (v: any) => String(v?.veh_id ?? v?.id ?? '');
const isFlaggedSelected = (v: any) =>
  (v?.is_selected ?? v?.selected ?? v?.usr_selected ?? v?.isSelected) === true;

export default function AddVehicleScreen() {
  const [vehiculos, setVehiculos] = useState<any[]>([]);
  const [serverErr, setServerErr] = useState<{ code?: string; message?: string; detail?: string } | null>(null);
  const [loadingList, setLoadingList] = useState<boolean>(true);

  const [selectedVehicleId, setSelectedVehicleId] = useState<string | null>(null);
  const [savedSelectedId, setSavedSelectedId] = useState<string | null>(null);
  const [selectLoadingId, setSelectLoadingId] = useState<string | null>(null);

  // 🎨 modal/color (básico)
  const [colorModalVisible, setColorModalVisible] = useState(false);
  const [tempColor, setTempColor] = useState<string>(DEFAULT_HEX);

  const { control, handleSubmit, formState: { errors, isSubmitting }, setError, reset } =
    useForm<VehicleForm>({
      resolver: zodResolver(vehicleSchema),
      defaultValues: { veh_brand: '', veh_model: '', veh_year: '', veh_color: DEFAULT_HEX, veh_plate: '' },
      mode: 'onChange',
      reValidateMode: 'onChange',
    });

  const hydrateSelection = useCallback(async () => {
    const stored = (await SecureStore.getItemAsync(SELECTED_VEH_KEY))?.trim() ?? null;
    if (stored) {
      setSavedSelectedId(stored);
      if (!selectedVehicleId) setSelectedVehicleId(stored);
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

      const flagged = list.find(isFlaggedSelected);
      if (flagged) {
        const selId = getVehId(flagged);
        setSelectedVehicleId(selId);
        setSavedSelectedId(selId);
        await SecureStore.setItemAsync(SELECTED_VEH_KEY, selId);
        list = list.map(v => ({ ...v, _selectedLocal: getVehId(v) === selId }));
      } else {
        const stored = (await SecureStore.getItemAsync(SELECTED_VEH_KEY))?.trim() ?? null;
        if (stored && list.some(v => getVehId(v) === stored)) {
          setSelectedVehicleId(stored);
          setSavedSelectedId(stored);
          list = list.map(v => ({ ...v, _selectedLocal: getVehId(v) === stored }));
        } else {
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

  useEffect(() => {
    (async () => {
      await hydrateSelection();
      await fetchVehiculos();
    })();
  }, [hydrateSelection, fetchVehiculos]);

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

      setSelectedVehicleId(vehicleId);
      setSavedSelectedId(vehicleId);
      await SecureStore.setItemAsync(SELECTED_VEH_KEY, vehicleId);

      setVehiculos(prev =>
        prev.map(v => ({ ...v, _selectedLocal: getVehId(v) === vehicleId }))
      );

      await api.put(`/users/vehicles/${vehicleId}`, { usr_id }, { headers: { Authorization: `Bearer ${token}` } });

      Alert.alert('Éxito', 'Vehículo establecido correctamente');
      await fetchVehiculos();
    } catch (err: any) {
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

      const color = normalizeHex(data.veh_color);

      await api.post('/vehicles', {
        usr_id,
        veh_plate: data.veh_plate.trim().toUpperCase(),
        veh_brand: data.veh_brand.trim(),
        veh_model: data.veh_model.trim(),
        veh_year: Number(data.veh_year),
        veh_color: color, // ✅ siempre #RRGGBB
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

          {/* 🎨 Color básico (solo swatches, sin barras) */}
          <Controller
            control={control}
            name="veh_color"
            render={({ field: { value, onChange } }) => {
              const current = normalizeHex(value || DEFAULT_HEX);
              return (
                <View style={{ marginBottom: 8 }}>
                  <Text style={styles.colorLabel}>Color del vehículo</Text>

                  <TouchableOpacity
                    style={styles.colorField}
                    onPress={() => {
                      setTempColor(current);
                      setColorModalVisible(true);
                    }}
                    activeOpacity={0.8}
                  >
                    <View style={[styles.colorSwatch, { backgroundColor: current }]} />
                    <Text style={styles.colorHexText}>{current}</Text>
                  </TouchableOpacity>

                  {errors.veh_color && <Text style={styles.errorText}>{errors.veh_color.message}</Text>}

                  <Modal
                    animationType="slide"
                    transparent
                    visible={colorModalVisible}
                    onRequestClose={() => setColorModalVisible(false)}
                  >
                    <View style={styles.modalOverlay}>
                      <View style={styles.modalCard}>
                        <Text style={styles.modalTitle}>Elige un color</Text>

                        {/* Grid de swatches */}
                        <View style={styles.swatchGrid}>
                          {PALETTE.map((hex) => {
                            const sel = normalizeHex(hex);
                            const active = sel === tempColor;
                            return (
                              <Pressable
                                key={sel}
                                onPress={() => setTempColor(sel)}
                                style={[
                                  styles.swatchItem,
                                  { backgroundColor: sel, borderColor: active ? '#00224D' : '#E5E7EB', borderWidth: active ? 3 : 1 }
                                ]}
                              />
                            );
                          })}
                        </View>

                        {/* Preview grande */}
                        <View style={[styles.previewBox, { backgroundColor: tempColor }]}>
                          <Text style={styles.previewHex}>{tempColor}</Text>
                        </View>

                        <View style={styles.modalActions}>
                          <TouchableOpacity
                            style={[styles.modalBtn, styles.btnGhost]}
                            onPress={() => setColorModalVisible(false)}
                          >
                            <Text style={styles.btnGhostText}>Cancelar</Text>
                          </TouchableOpacity>
                          <TouchableOpacity
                            style={[styles.modalBtn, styles.btnPrimary]}
                            onPress={() => {
                              const chosen = normalizeHex(tempColor);
                              if (!HEX3or6_RE.test(chosen)) {
                                Alert.alert('Color inválido', 'El color debe ser HEX de 3 o 6 dígitos.');
                                return;
                              }
                              onChange(chosen);
                              setColorModalVisible(false);
                            }}
                          >
                            <Text style={styles.btnPrimaryText}>Usar color</Text>
                          </TouchableOpacity>
                        </View>
                      </View>
                    </View>
                  </Modal>
                </View>
              );
            }}
          />

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

  // 🎨 Color básico
  colorLabel: { color: '#00224D', fontWeight: '700', marginBottom: 6 },
  colorField: {
    backgroundColor: '#fff',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 12,
    borderWidth: 1, borderColor: '#E5E7EB',
    flexDirection: 'row', alignItems: 'center', gap: 12
  },
  colorSwatch: { width: 28, height: 28, borderRadius: 8, borderWidth: 1, borderColor: '#E5E7EB' },
  colorHexText: { color: '#111827', fontWeight: '600' },

  // Modal
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  modalCard: {
    backgroundColor: '#F8FAFC',
    padding: 16,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    borderTopWidth: 1, borderColor: '#E2E8F0'
  },
  modalTitle: { color: '#0F172A', fontWeight: '800', fontSize: 16, marginBottom: 10 },
  swatchGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  swatchItem: { width: 42, height: 42, borderRadius: 10 },
  previewBox: { marginTop: 12, borderRadius: 12, padding: 12, alignItems: 'center', borderWidth: 1, borderColor: '#E5E7EB' },
  previewHex: { color: '#0F172A', fontWeight: '800' },
  modalActions: { flexDirection: 'row', justifyContent: 'flex-end', gap: 10, marginTop: 14 },
  modalBtn: { paddingVertical: 10, paddingHorizontal: 16, borderRadius: 10 },
  btnGhost: { backgroundColor: 'transparent', borderWidth: 1, borderColor: '#CBD5E1' },
  btnGhostText: { color: '#0F172A', fontWeight: '700' },
  btnPrimary: { backgroundColor: '#00224D' },
  btnPrimaryText: { color: '#fff', fontWeight: '800' },
});
