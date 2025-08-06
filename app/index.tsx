// app/index.tsx
import { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Image, ScrollView, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import * as SecureStore from 'expo-secure-store';

export default function Index() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkSession = async () => {
      try {
        const token = await SecureStore.getItemAsync('auth_token');
        const usrId = await SecureStore.getItemAsync('usr_id');

        if (token) {
          console.log('Token encontrado, redirigiendo a /parking/available');
          router.replace('/home/indexapp');
        } else if (usrId) {
          console.log('Usuario con sesión pendiente, redirigiendo a verificación');
          router.replace('/auth/verify-code');
        } else {
          console.log('No hay sesión activa, mostrando opciones');
          setLoading(false);
        }
      } catch (err) {
        console.error('Error al verificar sesión:', err);
        setLoading(false);
      }
    };
    checkSession();
  }, []);

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#FFCC00" />
        <Text style={{ color: '#ccc', marginTop: 10 }}>Verificando sesión...</Text>
      </View>
    );
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Image source={require('../assets/images/react-logo.png')} style={styles.logo} />

      <Text style={styles.title}>Bienvenido a VisionParking</Text>
      <Text style={styles.subtitle}>Selecciona una opción para continuar</Text>

      <TouchableOpacity
        style={[styles.button, styles.loginButton]}
        onPress={() => router.push('/auth/login')}
      >
        <Text style={styles.buttonTextLight}>Iniciar Sesión</Text>
      </TouchableOpacity>

      <Text style={styles.subtitle}>¿Aún no tienes cuenta? ¡Regístrate!</Text>

      <TouchableOpacity
        style={[styles.button, styles.registerButton]}
        onPress={() => router.push('/auth/register')}
      >
        <Text style={styles.buttonTextDark}>Registrarse</Text>
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
  loadingContainer: {
    flex: 1,
    backgroundColor: '#00224D',
    alignItems: 'center',
    justifyContent: 'center',
  },
  logo: {
    width: 150,
    height: 150,
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
    fontSize: 16,
    marginBottom: 30,
    textAlign: 'center',
  },
  button: {
    width: '100%',
    paddingVertical: 14,
    paddingHorizontal: 35,
    borderRadius: 10,
    alignItems: 'center',
    marginBottom: 25,
  },
  registerButton: {
    backgroundColor: '#FFCC00',
  },
  loginButton: {
    borderWidth: 2,
    borderColor: '#FFCC00',
    backgroundColor: 'transparent',
  },
  buttonTextDark: {
    color: '#00224D',
    fontWeight: '600',
    fontSize: 16,
  },
  buttonTextLight: {
    color: '#FFCC00',
    fontWeight: '600',
    fontSize: 16,
  },
});
