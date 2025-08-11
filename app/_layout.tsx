import { Stack } from 'expo-router';
import { AuthProvider } from '../contexts/AuthContext';

export default function RootLayout() {
  return (
    <AuthProvider>
      <Stack
      screenOptions={{
        headerShown: false, // Esto lo oculta en todas las vistas
      }}
      />
    </AuthProvider>
  );
}
