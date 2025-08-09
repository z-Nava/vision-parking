// app/auth/register.tsx
import React, { useEffect, useState } from 'react';
import { Image, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { useRouter } from 'expo-router';
import AlertBox from '../../components/AlertBox';
import { register as registerService } from '../../services/authService';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { registerSchema, type RegisterForm } from '../../validation/auth';
import { mapApiErrorToForm } from '../../utils/errors';

export default function RegisterScreen() {
  const router = useRouter();

  const {
    register,
    setValue,
    handleSubmit,
    trigger,
    formState: { errors, isSubmitting },
    setError,
  } = useForm<RegisterForm>({
    resolver: zodResolver(registerSchema),
    defaultValues: { usr_name: '', usr_email: '', usr_password: '' },
    mode: 'onBlur',
    reValidateMode: 'onChange',
  });

  // registrar campos para poder usar setValue/trigger con TextInput controlado "a mano"
  useEffect(() => {
    register('usr_name');
    register('usr_email');
    register('usr_password');
  }, [register]);

  const [serverErr, setServerErr] = useState<{ code?: string; message?: string; detail?: string } | null>(null);

  const onSubmit = async (data: RegisterForm) => {
    setServerErr(null);

    const payload = {
      usr_name: data.usr_name.trim(),
      usr_email: data.usr_email.trim().toLowerCase(),
      usr_password: data.usr_password,
      // pry_name lo fija el service a VISION_PARKING_MOVIL
    };

    try {
      await registerService(payload.usr_name, payload.usr_email, payload.usr_password);
      router.push('/auth/login');
    } catch (err: any) {
      const mapped = mapApiErrorToForm<RegisterForm>(err, setError);
      if (!mapped) {
        setServerErr({ code: err?.code, message: err?.message, detail: err?.detail });
      }
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Image source={require('../../assets/images/react-logo.png')} style={styles.logo} />

      <Text style={styles.title}>Regístrate</Text>
      
      <Text style={styles.subtitle}>Ingresa tus datos para registrarte en la app</Text>

      {serverErr && (
        <AlertBox
          type="error"
          code={serverErr.code}
          message={serverErr.message}
          detail={serverErr.detail}
        />
      )}

      {/* usr_name */}
      <View style={{ width: '100%' }}>
        <TextInput
          style={styles.input}
          placeholder="Ingresa un nombre de usuario"
          placeholderTextColor="#666"
          autoCapitalize="none"
          onChangeText={(t) => setValue('usr_name', t, { shouldValidate: true })}
          onBlur={() => trigger('usr_name')}
        />
        {errors.usr_name?.message ? (
          <Text style={styles.errorText}>{errors.usr_name.message}</Text>
        ) : null}
      </View>

      {/* usr_email */}
      <View style={{ width: '100%' }}>
        <TextInput
          style={styles.input}
          placeholder="Ingresa tu correo"
          placeholderTextColor="#666"
          keyboardType="email-address"
          autoCapitalize="none"
          onChangeText={(t) => setValue('usr_email', t, { shouldValidate: true })}
          onBlur={() => trigger('usr_email')}
        />
        {errors.usr_email?.message ? (
          <Text style={styles.errorText}>{errors.usr_email.message}</Text>
        ) : null}
      </View>

      {/* usr_password */}
      <View style={{ width: '100%' }}>
        <TextInput
          style={styles.input}
          placeholder="Ingresa tu contraseña"
          placeholderTextColor="#666"
          secureTextEntry
          onChangeText={(t) => setValue('usr_password', t, { shouldValidate: true })}
          onBlur={() => trigger('usr_password')}
        />
        {errors.usr_password?.message ? (
          <Text style={styles.errorText}>{errors.usr_password.message}</Text>
        ) : null}
        <Text style={styles.hint}>
          Requisitos: 12–32, mayúscula, minúscula, número y símbolo (@$!%*?&).
        </Text>
      </View>

      <TouchableOpacity style={styles.button} onPress={handleSubmit(onSubmit)} disabled={isSubmitting}>
        <Text style={styles.buttonText}>{isSubmitting ? 'Registrando...' : 'Registrarte'}</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flexGrow: 1, backgroundColor: '#00224D', alignItems: 'center', justifyContent: 'center', padding: 20 },
  logo: { width: 180, height: 180, marginBottom: 30, resizeMode: 'contain' },
  title: { fontSize: 24, fontWeight: '700', color: '#fff', marginBottom: 10 },
  subtitle: { color: '#ccc', fontSize: 14, marginBottom: 30, textAlign: 'center' },
  input: { width: '100%', height: 50, backgroundColor: '#fff', borderRadius: 10, paddingHorizontal: 15, fontSize: 16, marginBottom: 6, borderWidth: 1, borderColor: '#D1D5DB' },
  errorText: { color: '#FCA5A5', marginBottom: 10, fontSize: 12 },
  hint: { color: '#cbd5e1', fontSize: 12, marginTop: 2, marginBottom: 8 },
  button: { width: '100%', backgroundColor: '#0A3973', paddingVertical: 14, borderRadius: 10, alignItems: 'center', marginTop: 10 },
  buttonText: { color: '#fff', fontWeight: '600', fontSize: 16 },
});
