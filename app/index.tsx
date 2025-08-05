import { View, Text, TouchableOpacity, StyleSheet, Image, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';

export default function Index() {
  const router = useRouter();

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Image source={require('../assets/images/react-logo.png')} style={styles.logo} />

      <Text style={styles.title}>Bienvenido a VisionParking</Text>
      <Text style={styles.subtitle}>Selecciona una opción para continuar</Text>

      {/* Botón REGISTRARSE */}
      <TouchableOpacity
        style={[styles.button, styles.registerButton]}
        onPress={() => router.push('/auth/register')}
      >
        <Text style={styles.buttonTextDark}>Registrarse</Text>
      </TouchableOpacity>

      {/* Botón INICIAR SESIÓN */}
      <TouchableOpacity
        style={[styles.button, styles.loginButton]}
        onPress={() => router.push('/auth/login')}
      >
        <Text style={styles.buttonTextLight}>Iniciar Sesión</Text>
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
