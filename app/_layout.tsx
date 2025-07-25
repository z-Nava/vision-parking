import { Stack } from 'expo-router';
import { AuthProvider } from '../contexts/AuthContext'; // Asegúrate de tener esta ruta

export default function RootLayout() {
  return (
    <AuthProvider>
      <Stack />
    </AuthProvider>
  );
}
