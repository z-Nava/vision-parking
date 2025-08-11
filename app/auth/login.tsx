import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Image,
  ScrollView,
  KeyboardAvoidingView,
  TouchableWithoutFeedback,
  Keyboard,
  Platform,
} from 'react-native';
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
  const [validationErrors, setValidationErrors] = useState<string[]>([]); // ⬅️ errores de validación en array

  // ref para mover foco a password desde email
  const passRef = useRef<TextInput>(null);

  const onSubmit = async (data: SigninForm) => {
    setServerErr(null);
    setValidationErrors([]); // limpiar antes de enviar

    const email = data.usr_email.trim().toLowerCase();
    const password = data.usr_password;

    try {
      const response = await loginService(email, password);
      const usr_id = response?.data?.usr_id;
      const usr_email = response?.data?.usr_email;
      if (!usr_id) throw new Error('Respuesta inválida del servidor');

      await SecureStore.setItemAsync('usr_id', String(usr_id));
      if (usr_email) await SecureStore.setItemAsync('usr_email', String(usr_email));

      router.push('/auth/verify-code');
    } catch (err: any) {
      // 1) Intentar mapear a campos
      const mapped = mapApiErrorToForm<SigninForm>(err, setError);

      // 2) Si backend trae errors[], los mostramos
      const errorsArr = err?.response?.data?.errors || [];
      if (Array.isArray(errorsArr) && errorsArr.length > 0) {
        const msgs = errorsArr.map((e: any) => e?.message || String(e));
        setValidationErrors(msgs);
      }

      // 3) Si no mapeó a campos y tampoco hay array claro, usar mensaje global
      if (!mapped && (!errorsArr || errorsArr.length === 0)) {
        setServerErr({ code: err?.code, message: err?.message, detail: err?.detail });
      }
    }
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 80 : 0}
    >
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
          <Image source={require('../../assets/images/web_banner_512x512.png')} style={styles.logo} />
          <Text style={styles.title}>Iniciar sesión</Text>
          <Text style={styles.subtitle}>Ingresa tus credenciales</Text>

          {serverErr && (
            <AlertBox type="error" code={serverErr.code} message={serverErr.message} detail={serverErr.detail} />
          )}

          {/* Lista de errores de validación (si vienen varios del backend) */}
          {validationErrors.length > 0 && (
            <View style={styles.validationBox}>
              {validationErrors.map((msg, i) => (
                <Text key={i} style={styles.validationText}>• {msg}</Text>
              ))}
            </View>
          )}

          {/* Email */}
          <View style={{ width: '100%' }}>
            <TextInput
              style={styles.input}
              placeholder="Correo electrónico"
              placeholderTextColor="#666"
              keyboardType="email-address"
              inputMode="email"
              autoComplete="email"
              textContentType="emailAddress"
              autoCapitalize="none"
              autoFocus
              returnKeyType="next"
              onSubmitEditing={() => passRef.current?.focus()}
              onChangeText={(t) => setValue('usr_email', t, { shouldValidate: true })}
              onBlur={() => trigger('usr_email')}
            />
            {errors.usr_email?.message ? <Text style={styles.errorText}>{errors.usr_email.message}</Text> : null}
          </View>

          {/* Password */}
          <View style={{ width: '100%' }}>
            <TextInput
              ref={passRef}
              style={styles.input}
              placeholder="Contraseña"
              placeholderTextColor="#666"
              secureTextEntry
              autoComplete="password"
              textContentType="password"
              returnKeyType="done"
              onSubmitEditing={handleSubmit(onSubmit)}
              onChangeText={(t) => setValue('usr_password', t, { shouldValidate: true })}
              onBlur={() => trigger('usr_password')}
            />
            {errors.usr_password?.message ? <Text style={styles.errorText}>{errors.usr_password.message}</Text> : null}
          </View>

          <TouchableOpacity style={styles.button} onPress={handleSubmit(onSubmit)} disabled={isSubmitting}>
            <Text style={styles.buttonText}>{isSubmitting ? 'Verificando...' : 'Iniciar sesión'}</Text>
          </TouchableOpacity>
        </ScrollView>
      </TouchableWithoutFeedback>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flexGrow: 1, backgroundColor: '#00224D', alignItems: 'center', justifyContent: 'center', padding: 20 },
  logo: { width: 150, height: 150, marginBottom: 30, resizeMode: 'contain' },
  title: { fontSize: 22, fontWeight: '700', color: '#fff', marginBottom: 10 },
  subtitle: { color: '#ccc', fontSize: 14, marginBottom: 10, textAlign: 'center' },

  validationBox: {
    width: '100%',
    backgroundColor: '#7f1d1d',
    borderRadius: 8,
    padding: 10,
    marginBottom: 12,
  },
  validationText: { color: '#FFE4E6', fontSize: 12 },

  input: {
    width: '100%',
    height: 50,
    backgroundColor: '#fff',
    borderRadius: 10,
    paddingHorizontal: 15,
    fontSize: 16,
    marginBottom: 6,
    borderWidth: 1,
    borderColor: '#D1D5DB',
  },
  errorText: { color: '#FCA5A5', marginBottom: 10, fontSize: 12 },
  button: {
    width: '100%',
    backgroundColor: '#0A3973',
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 10,
  },
  buttonText: { color: '#fff', fontWeight: '600', fontSize: 16 },
});
