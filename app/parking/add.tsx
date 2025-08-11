// app/parking/add.tsx
import * as DocumentPicker from 'expo-document-picker';
import { useLocalSearchParams, useRouter } from 'expo-router';
import * as SecureStore from 'expo-secure-store';
import React, { useState } from 'react';
import { Alert, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import AlertBox from '../../components/AlertBox';
import BottomNav from '../../components/BottomNav';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { accessRequestSchema, type AccessRequestForm } from '../../validation/parking';
import { createAccessRequest, uploadAccessFile } from '../../services/parkingService';
import { mapApiErrorToForm } from '../../utils/errors';

export default function AddParking() {
  const router = useRouter();
  const { cmp_id, cmp_name } = useLocalSearchParams();

  const cmpId = Array.isArray(cmp_id) ? cmp_id[0] : (cmp_id as string | undefined);
  const companyName = Array.isArray(cmp_name) ? cmp_name[0] : (cmp_name as string | undefined);

  const {
    control,
    handleSubmit,
    setValue,
    trigger,
    setError,
    formState: { errors, isSubmitting }
  } = useForm<AccessRequestForm>({
    resolver: zodResolver(accessRequestSchema),
    defaultValues: { cma_description: '', file: undefined as any },
    mode: 'onBlur',
    reValidateMode: 'onChange',
  });

  const [serverErr, setServerErr] = useState<{ code?: string; message?: string; detail?: string } | null>(null);
  const [pickedFileName, setPickedFileName] = useState<string | null>(null);

  const handleFilePick = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: ['application/pdf', 'image/png', 'image/jpeg'],
        copyToCacheDirectory: true,
      });

      if (!result.canceled && result.assets.length > 0) {
        const selected = result.assets[0]; // { uri, name, size, mimeType }
        setValue('file', selected, { shouldValidate: true });
        setPickedFileName(selected.name ?? 'archivo');
        await trigger('file');
        Alert.alert('Archivo seleccionado', selected.name ?? 'archivo');
      }
    } catch (error) {
      console.error('Error al seleccionar archivo:', error);
      Alert.alert('Error', 'No se pudo seleccionar el archivo.');
    }
  };

  const onSubmit = async (data: AccessRequestForm) => {
    setServerErr(null);

    if (!cmpId) {
      setServerErr({ code: 'VAL001', message: 'Falta el identificador de compañía (cmp_id)' });
      return;
    }

    try {
      const usr_id = await SecureStore.getItemAsync('usr_id');
      if (!usr_id) throw new Error('ID de usuario no encontrado.');

      // 1) Crear solicitud (con Bearer en parkingService)
      const reqRes = await createAccessRequest(usr_id, cmpId, data.cma_description.trim());
      const cma_id = (reqRes as any)?.data?.cma_id ?? (reqRes as any)?.cma_id;
      if (!cma_id) throw new Error('No se recibió el ID de la solicitud.');

      // 2) Subir archivo (con Bearer en parkingService)
      await uploadAccessFile(data.file, String(cma_id));

      Alert.alert('Éxito', 'Solicitud enviada y archivo cargado correctamente.');
      router.push('/vehicle/config');
    } catch (err: any) {
      const mapped = mapApiErrorToForm<AccessRequestForm>(err, setError);
      if (!mapped) {
        setServerErr({ code: err?.code, message: err?.message, detail: err?.detail });
      }
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Agregar nuevo estacionamiento</Text>

      {serverErr && (
        <AlertBox type="error" code={serverErr.code} message={serverErr.message} detail={serverErr.detail} />
      )}

      <View style={styles.card}>
        <Text style={styles.cardTitle}>Solicitar acceso a:</Text>
        <Text style={styles.subtext}>{companyName || 'Compañía'}</Text>

        <Text style={styles.instructions}>1. Selecciona un archivo (PDF, PNG o JPG)</Text>
        <TouchableOpacity style={styles.saveButton} onPress={handleFilePick} disabled={isSubmitting}>
          <Text style={styles.saveButtonText}>{pickedFileName ? 'Cambiar archivo' : 'Seleccionar archivo'}</Text>
        </TouchableOpacity>
        {pickedFileName ? <Text style={styles.fileName}>{pickedFileName}</Text> : null}
        {errors.file?.message ? <Text style={styles.errorText}>{String(errors.file.message)}</Text> : null}

        <Text style={styles.instructions}>2. Ingresa el motivo de tu solicitud</Text>

        <Controller
          control={control}
          name="cma_description"
          render={({ field: { value, onChange, onBlur } }) => (
            <TextInput
              style={styles.input}
              placeholder="Ejemplo: Soy estudiante y necesito acceso diario"
              placeholderTextColor="#888"
              multiline
              numberOfLines={4}
              value={value}
              onChangeText={onChange}
              onBlur={onBlur}
              textAlignVertical="top"
              editable={!isSubmitting}
            />
          )}
        />
        {errors.cma_description?.message ? (
          <Text style={styles.errorText}>{errors.cma_description.message}</Text>
        ) : null}

        <TouchableOpacity style={styles.saveButton} onPress={handleSubmit(onSubmit)} disabled={isSubmitting}>
          <Text style={styles.saveButtonText}>{isSubmitting ? 'Enviando...' : 'Guardar solicitud'}</Text>
        </TouchableOpacity>
      </View>

      <BottomNav />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1, backgroundColor: '#00224D',
    paddingHorizontal: 20, paddingTop: 60, paddingBottom: 80,
  },
  title: { color: 'white', fontSize: 20, fontWeight: '600', marginBottom: 20 },
  card: { backgroundColor: '#FFCC00', borderRadius: 12, padding: 20, alignItems: 'center' },
  cardTitle: { fontSize: 18, fontWeight: 'bold', color: '#00224D', marginBottom: 5, textAlign: 'center' },
  subtext: { fontWeight: '600', color: '#00224D', marginBottom: 10 },
  instructions: { color: '#00224D', textAlign: 'center', marginBottom: 10 },
  input: {
    width: '100%', backgroundColor: 'white', borderRadius: 8, padding: 10, color: '#00224D',
    marginBottom: 6, textAlignVertical: 'top', borderWidth: 1, borderColor: '#D1D5DB'
  },
  errorText: { color: '#b71c1c', marginBottom: 10, fontSize: 12, alignSelf: 'flex-start' },
  fileName: { color: '#00224D', fontSize: 12, marginTop: 6, alignSelf: 'flex-start' },
  saveButton: { backgroundColor: '#00224D', paddingVertical: 12, paddingHorizontal: 25, borderRadius: 8, marginTop: 6 },
  saveButtonText: { color: 'white', fontWeight: '600' },
});
