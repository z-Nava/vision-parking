import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Image, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import AlertBox from '../../components/AlertBox';
import api from '../../services/api';
import { useAuth } from '../../hooks/useAuth';
import * as SecureStore from 'expo-secure-store';

export default function VerifyCodeScreen() {
  const router = useRouter();
  const { setToken } = useAuth();

  const [code, setCode] = useState('');
  const [error, setError] = useState('');
  const [detail, setDetail] = useState('');

  const handleVerifyCode = async () => {
    try {
      const usr_id = await SecureStore.getItemAsync('usr_id');
      if (!usr_id) throw new Error('No se encontró ID de usuario');

      const response = await api.post('/verify', {
        usr_id,
        cod_code: parseInt(code),
      });

      const token = response.data?.tok_token;

      if (!token) throw new Error('Token no recibido');

      console.log('Token recibido:', token);
      await SecureStore.setItemAsync('auth_token', token); // 🔐 Guardamos el token
      console.log('Token guardado en SecureStore', token);
      console.log('ID de usuario conservado en SecureStore:', usr_id);

      setToken(token);
      router.push('/parking/available');
    } catch (err: any) {
      const apiMessage = err?.response?.data?.message || err?.message || 'Error desconocido';
      console.log('Error al verificar:', apiMessage);
      setError('AUTH002');
      setDetail(apiMessage);
    }
  };


  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Image source={require('../../assets/images/react-logo.png')} style={styles.logo} />

      <Text style={styles.title}>Verifica tu código</Text>
      <Text style={styles.subtitle}>Ingresa el código enviado a tu correo electrónico</Text>

      {error && (
        <AlertBox
          type="error"
          code={error}
          message="Error al verificar el código"
          detail={detail}
        />
      )}

      <TextInput
        style={styles.input}
        placeholder="Código de verificación"
        placeholderTextColor="#666"
        keyboardType="numeric"
        value={code}
        onChangeText={setCode}
      />

      <TouchableOpacity style={styles.button} onPress={handleVerifyCode}>
        <Text style={styles.buttonText}>Verificar</Text>
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
  logo: {
    width: 150,
    height: 150,
    marginBottom: 30,
    resizeMode: 'contain',
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
    color: '#fff',
    marginBottom: 10,
  },
  subtitle: {
    color: '#ccc',
    fontSize: 14,
    marginBottom: 30,
    textAlign: 'center',
  },
  input: {
    width: '100%',
    height: 50,
    backgroundColor: '#fff',
    borderRadius: 10,
    paddingHorizontal: 15,
    fontSize: 16,
    marginBottom: 15,
  },
  button: {
    width: '100%',
    backgroundColor: '#0A3973',
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 10,
  },
  buttonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 16,
  },
});
