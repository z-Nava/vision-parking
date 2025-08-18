// app/vehicle/config.tsx
import React, { useEffect, useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet, Image, ScrollView, Alert, Modal, Pressable
} from 'react-native';
import { useRouter } from 'expo-router';
import * as SecureStore from 'expo-secure-store';
import api from '../../services/api';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { vehicleSchema, type VehicleForm } from '../../validation/vehicle';
import AlertBox from '../../components/AlertBox';
import { mapApiErrorToForm } from '../../utils/errors';

const HEX3or6_RE = /^#([0-9A-F]{3}|[0-9A-F]{6})$/i;
const DEFAULT_HEX = '#334155';

// Paleta del picker (ajústala si quieres)
const PALETTE = [
  '#000000','#FFFFFF','#EF4444','#F97316','#F59E0B','#10B981',
  '#06B6D4','#3B82F6','#8B5CF6','#EC4899','#94A3B8','#334155',
  '#111827','#D1D5DB','#22C55E','#A855F7'
];

/** Normaliza a #RRGGBB (si viene #RGB lo expande; quita alpha si existiera). */
function normalizeHex(input?: string | null): string {
  if (!input) return DEFAULT_HEX;
  let s = input.trim().toUpperCase();
  if (!s.startsWith('#')) s = `#${s}`;
  s = s.replace(/[^#0-9A-F]/g, '');

  // Recorta alpha (#RRGGBBAA / #RGBA)
  if (s.length === 9) s = s.slice(0, 7);
  if (s.length === 5) s = s.slice(0, 4);

  if (HEX3or6_RE.test(s)) {
    if (s.length === 4) {
      const r = s[1], g = s[2], b = s[3];
      s = `#${r}${r}${g}${g}${b}${b}`;
    }
    return s;
  }
  return DEFAULT_HEX;
}

export default function ConfigVehicleScreen() {
  const router = useRouter();
  const {
    control,
    handleSubmit,
    formState: { errors, isSubmitting, isValid },
    setError,
    reset,
    watch,
  } = useForm<VehicleForm>({
    resolver: zodResolver(vehicleSchema),
    defaultValues: { veh_brand: '', veh_model: '', veh_year: '', veh_color: DEFAULT_HEX, veh_plate: '' },
    mode: 'onChange',
    reValidateMode: 'onChange',
  });

  const currentColor = watch('veh_color') || DEFAULT_HEX;
  const [serverErr, setServerErr] = useState<{ code?: string; message?: string; detail?: string } | null>(null);

  // Modal del color
  const [colorModalVisible, setColorModalVisible] = useState(false);
  const [tempColor, setTempColor] = useState<string>(DEFAULT_HEX);

  useEffect(() => {
    (async () => {
      const token = await SecureStore.getItemAsync('auth_token');
      if (token) api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    })();
  }, []);

  const onSubmit = async (data: VehicleForm) => {
    setServerErr(null);
    try {
      const usr_id = await SecureStore.getItemAsync('usr_id');
      if (!usr_id) throw new Error('Sesión no válida. Intenta iniciar sesión nuevamente.');

      // Requiere HEX #RGB o #RRGGBB; normalizamos a #RRGGBB
      if (!HEX3or6_RE.test(data.veh_color)) {
        setError('veh_color', { message: 'Usa HEX de 3 o 6 dígitos (ej. #0AF o #1F4E79).' });
        return;
      }
      const hexToSend = normalizeHex(data.veh_color);

      // 1) Registrar vehículo
      await api.post('/vehicles', {
        usr_id,
        veh_plate: data.veh_plate.trim().toUpperCase(),
        veh_brand: data.veh_brand.trim(),
        veh_model: data.veh_model.trim(),
        veh_year: Number(data.veh_year),
        veh_color: hexToSend, // ✅ #RRGGBB
      });

      // 2) Marcar usuario como configurado
      const configRes = await api.put(`/configurated/${usr_id}`, {});
      if (configRes.status !== 200) throw new Error('No se pudo actualizar la configuración del usuario.');

      Alert.alert('Éxito', 'Vehículo registrado correctamente');
      reset();
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

      {/* Color: SOLO PICKER (sin input de texto) */}
      <Controller
        control={control}
        name="veh_color"
        render={({ field: { value, onChange } }) => {
          const current = normalizeHex(value || DEFAULT_HEX);
          return (
            <View style={{ width: '100%', marginBottom: 6 }}>
              <TouchableOpacity
                style={styles.colorField}
                activeOpacity={0.8}
                onPress={() => {
                  setTempColor(current);
                  setColorModalVisible(true);
                }}
              >
                <View style={[styles.colorSwatch, { backgroundColor: current }]} />
                <Text style={styles.colorHexText}>{current}</Text>
              </TouchableOpacity>

              {errors.veh_color?.message && <Text style={styles.err}>{errors.veh_color.message}</Text>}

              <Modal
                animationType="slide"
                transparent
                visible={colorModalVisible}
                onRequestClose={() => setColorModalVisible(false)}
              >
                <View style={styles.modalOverlay}>
                  <View style={styles.modalCard}>
                    <Text style={styles.modalTitle}>Elige un color</Text>

                    {/* Swatches */}
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

                    {/* Preview */}
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
                            Alert.alert('Color inválido', 'Usa HEX de 3 o 6 dígitos.');
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

  input: {
    width: '100%', height: 50, backgroundColor: '#fff', borderRadius: 10,
    paddingHorizontal: 15, fontSize: 16, marginBottom: 6, borderWidth: 1, borderColor: '#D1D5DB'
  },
  err: { color: '#b71c1c', marginBottom: 10, fontSize: 12, alignSelf: 'flex-start' },
  button: { width: '100%', backgroundColor: '#0A3973', paddingVertical: 14, borderRadius: 10, alignItems: 'center', marginTop: 10 },
  buttonText: { color: '#fff', fontWeight: '600', fontSize: 16 },

  // Color picker
  colorLabel: { color: '#fff', alignSelf: 'flex-start', marginBottom: 6, fontWeight: '700' },
  colorField: {
    backgroundColor: '#fff', borderRadius: 10, paddingHorizontal: 12, paddingVertical: 12,
    borderWidth: 1, borderColor: '#E5E7EB', flexDirection: 'row', alignItems: 'center', gap: 12
  },
  colorSwatch: { width: 28, height: 28, borderRadius: 8, borderWidth: 1, borderColor: '#E5E7EB' },
  colorHexText: { color: '#111827', fontWeight: '600' },

  // Modal
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  modalCard: {
    backgroundColor: '#F8FAFC', padding: 16, borderTopLeftRadius: 16, borderTopRightRadius: 16,
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
