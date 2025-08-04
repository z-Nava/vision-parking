import React, { useEffect } from 'react';
import { View, Text } from 'react-native';
import * as SecureStore from 'expo-secure-store';

export default function TestSecure() {
  useEffect(() => {
    SecureStore.setItemAsync('testKey', 'hello world')
      .then(() => console.log('✅ Guardado correctamente en SecureStore'))
      .catch((err) => console.error('❌ Error en SecureStore:', err));
  }, []);

  return (
    <View>
      <Text>Probando SecureStore</Text>
    </View>
  );
}
