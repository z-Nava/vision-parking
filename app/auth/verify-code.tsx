// app/auth/verify-code.tsx
import React, { useEffect, useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Image, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import * as SecureStore from 'expo-secure-store';
import AlertBox from '../../components/AlertBox';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { verifyCodeSchema, type VerifyCodeForm } from '../../validation/auth';
import { getConfigurated, verifyCode } from '../../services/authService';
import { mapApiErrorToForm } from '../../utils/errors';
import { useAuth } from '../../hooks/useAuth';

export default function VerifyCodeScreen() {
  const router = useRouter();
  const { setToken } = useAuth();

  const { control, handleSubmit, formState: { errors, isSubmitting }, setError } =
    useForm<VerifyCodeForm>({
      resolver: zodResolver(verifyCodeSchema),
      defaultValues: { cod_code: '' }, // string!
      mode: 'onBlur',
      reValidateMode: 'onChange',
    });

  const [usrId, setUsrId] = useState<string | null>(null);
  const [serverErr, setServerErr] = useState<{ code?: string; message?: string; detail?: string } | null>(null);

  useEffect(() => {
    (async () => {
      const id = await SecureStore.getItemAsync('usr_id');
      setUsrId(id);
    })();
  }, []);

  const onSubmit = async (data: VerifyCodeForm) => {
    setServerErr(null);
    try {
      if (!usrId) throw new Error('No se encontró ID de usuario');

      const codeNum = Number(data.cod_code); // <-- conversión aquí
      const res = await verifyCode(usrId, codeNum);

      const token = res?.tok_token ?? res?.data?.tok_token;
      if (!token) throw new Error('Token no recibido');

      await SecureStore.setItemAsync('auth_token', String(token));
      setToken(token);

      const conf = await getConfigurated(usrId);
      const isConfigured = conf?.isConfigurated === true;

      if (isConfigured) router.push('/home/indexapp');
      else router.push('/parking/available');
    } catch (err: any) {
      const mapped = mapApiErrorToForm<VerifyCodeForm>(err, setError);
      if (!mapped) {
        setServerErr({ code: err?.code, message: err?.message, detail: err?.detail });
      }
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Image source={require('../../assets/images/react-logo.png')} style={styles.logo} />

      <Text style={styles.title}>Verifica tu código</Text>
      <Text style={styles.subtitle}>Ingresa el código enviado a tu correo electrónico</Text>

      {serverErr && (
        <AlertBox type="error" code={serverErr.code} message={serverErr.message} detail={serverErr.detail} />
      )}

      <View style={{ width: '100%' }}>
        <Controller
          control={control}
          name="cod_code"
          render={({ field: { value, onChange, onBlur } }) => (
            <TextInput
              style={styles.input}
              placeholder="Código de verificación"
              placeholderTextColor="#666"
              keyboardType="numeric"
              value={value}
              onChangeText={onChange} // string
              onBlur={onBlur}
            />
          )}
        />
        {errors.cod_code?.message ? (
          <Text style={styles.errorText}>{errors.cod_code.message}</Text>
        ) : null}
      </View>

      <TouchableOpacity style={styles.button} onPress={handleSubmit(onSubmit)} disabled={isSubmitting || !usrId}>
        <Text style={styles.buttonText}>{isSubmitting ? 'Verificando...' : 'Verificar'}</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flexGrow: 1, backgroundColor: '#00224D', alignItems: 'center', justifyContent: 'center', padding: 20 },
  logo: { width: 150, height: 150, marginBottom: 30, resizeMode: 'contain' },
  title: { fontSize: 22, fontWeight: '700', color: '#fff', marginBottom: 10 },
  subtitle: { color: '#ccc', fontSize: 14, marginBottom: 30, textAlign: 'center' },
  input: { width: '100%', height: 50, backgroundColor: '#fff', borderRadius: 10, paddingHorizontal: 15, fontSize: 16, marginBottom: 6, borderWidth: 1, borderColor: '#D1D5DB' },
  errorText: { color: '#FCA5A5', marginBottom: 10, fontSize: 12 },
  button: { width: '100%', backgroundColor: '#0A3973', paddingVertical: 14, borderRadius: 10, alignItems: 'center', marginTop: 10 },
  buttonText: { color: '#fff', fontWeight: '600', fontSize: 16 },
});
