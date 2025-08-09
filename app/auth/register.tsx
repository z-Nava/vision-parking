// app/auth/register.tsx
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { Image, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity } from 'react-native';
import AlertBox from '../../components/AlertBox';
import { register } from '../../services/authService';


export default function RegisterScreen() {
  const router = useRouter();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const [error, setError] = useState('');
  const [detail, setDetail] = useState('');

  const handleRegister = async () => {
  try {
    const response = await register(name, email, password);
    console.log('Registro exitoso:', response);
    setError('');
    router.push('/auth/login');
  } catch (err: any) {
    console.log({err})
    console.error('Error completo:', err); // 🔍 <--- agrega este log
    
    const apiMessage =
      err?.response?.data?.message ||
      err?.message ||
      'Error desconocido';
    console.log('Error al registrar:', apiMessage);

    setError('AUTH001');
    setDetail(apiMessage);
  }
};


  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Image source={require('../../assets/images/react-logo.png')} style={styles.logo} />

      <Text style={styles.title}>Regístrate</Text>
      <Text style={styles.subtitle}>Ingresa tus datos para registrarte en la app</Text>

      {error && (
        <AlertBox
          type="error"
          code={error}
          message="Error en el registro"
          detail={detail}
        />
      )}

      <TextInput
        style={styles.input}
        placeholder="Ingresa un nombre de usuario"
        placeholderTextColor="#666"
        value={name}
        onChangeText={setName}
      />
      <TextInput
        style={styles.input}
        placeholder="Ingresa tu correo"
        placeholderTextColor="#666"
        keyboardType="email-address"
        value={email}
        onChangeText={setEmail}
      />
      <TextInput
        style={styles.input}
        placeholder="Ingresa tu contraseña"
        placeholderTextColor="#666"
        secureTextEntry
        value={password}
        onChangeText={setPassword}
      />

      <TouchableOpacity style={styles.button} onPress={handleRegister}>
        <Text style={styles.buttonText}>Registrarte</Text>
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
    width: 180,
    height: 180,
    marginBottom: 30,
    resizeMode: 'contain',
  },
  title: {
    fontSize: 24,
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
