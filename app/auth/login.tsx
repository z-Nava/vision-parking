// app/auth/login.tsx
import React, { useEffect, useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Image, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import * as SecureStore from 'expo-secure-store';
import AlertBox from '../../components/AlertBox';
import { login as loginService } from '../../services/authService';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { signinSchema, type SigninForm } from '../../validation/auth';
import { mapApiErrorToForm } from '../../utils/errors';

export default function LoginScreen() {
  const router = useRouter();

  const {
    register,
    setValue,
    handleSubmit,
    trigger,
    formState: { errors, isSubmitting },
    setError,
  } = useForm<SigninForm>({
    resolver: zodResolver(signinSchema),
    defaultValues: { usr_email: '', usr_password: '' },
    mode: 'onBlur',
    reValidateMode: 'onChange',
  });

  useEffect(() => {
    register('usr_email');
    register('usr_password');
  }, [register]);

  const [serverErr, setServerErr] = useState<{ code?: string; message?: string; detail?: string } | null>(null);

  const onSubmit = async (data: SigninForm) => {
    setServerErr(null);

    const email = data.usr_email.trim().toLowerCase();
    const password = data.usr_password;

    try {
      const response = await loginService(email, password);
      // Esperado por tu API:
      // { message, data: { usr_id, usr_email } }
      const usr_id = response?.data?.usr_id;
      const usr_email = response?.data?.usr_email;

      if (!usr_id) throw new Error('Respuesta inválida del servidor');

      await SecureStore.setItemAsync('usr_id', String(usr_id));
      if (usr_email) {
        await SecureStore.setItemAsync('usr_email', String(usr_email));
      }

      // Ir a verificación de código
      router.push('/auth/verify-code');
    } catch (err: any) {
      // Primero intentamos pegar el error a un campo
      const mapped = mapApiErrorToForm<SigninForm>(err, setError);
      if (!mapped) {
        // Si no hay campo, mostramos alerta global
        setServerErr({ code: err?.code, message: err?.message, detail: err?.detail });
      }
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Image source={require('../../assets/images/react-logo.png')} style={styles.logo} />
      <Text style={styles.title}>Iniciar sesión</Text>
      <Text style={styles.subtitle}>Ingresa tus credenciales</Text>

      {serverErr && (
        <AlertBox
          type="error"
          code={serverErr.code}
          message={serverErr.message}
          detail={serverErr.detail}
        />
      )}

      {/* usr_email */}
      <View style={{ width: '100%' }}>
        <TextInput
          style={styles.input}
          placeholder="Correo electrónico"
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
          placeholder="Contraseña"
          placeholderTextColor="#666"
          secureTextEntry
          onChangeText={(t) => setValue('usr_password', t, { shouldValidate: true })}
          onBlur={() => trigger('usr_password')}
        />
        {errors.usr_password?.message ? (
          <Text style={styles.errorText}>{errors.usr_password.message}</Text>
        ) : null}
      </View>

      <TouchableOpacity style={styles.button} onPress={handleSubmit(onSubmit)} disabled={isSubmitting}>
        <Text style={styles.buttonText}>{isSubmitting ? 'Verificando...' : 'Iniciar sesión'}</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    backgroundColor: '#00224D',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  logo: { width: 180, height: 180, marginBottom: 30, resizeMode: 'contain' },
  title: { fontSize: 24, fontWeight: '700', color: '#fff', marginBottom: 10 },
  subtitle: { color: '#ccc', fontSize: 14, marginBottom: 30, textAlign: 'center' },
  input: {
    width: '100%', height: 50, backgroundColor: '#fff', borderRadius: 10, paddingHorizontal: 15,
    fontSize: 16, marginBottom: 6, borderWidth: 1, borderColor: '#D1D5DB'
  },
  errorText: { color: '#FCA5A5', marginBottom: 10, fontSize: 12 },
  button: {
    width: '100%', backgroundColor: '#0A3973', paddingVertical: 14, borderRadius: 10,
    alignItems: 'center', marginTop: 10
  },
  buttonText: { color: '#fff', fontWeight: '600', fontSize: 16 },
});
