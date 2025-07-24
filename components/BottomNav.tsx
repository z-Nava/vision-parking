// components/BottomNav.tsx
import React from 'react';
import { View, TouchableOpacity, Text, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';

export default function BottomNav() {
  const router = useRouter();

  return (
    <View style={styles.navbar}>
      <TouchableOpacity onPress={() => router.push('/home/indexapp')}>
        <Text style={styles.navIcon}>🏠</Text>
      </TouchableOpacity>
      <TouchableOpacity onPress={() => router.push('/parking/my-parkings')}>
        <Text style={styles.navIcon}>🅿️</Text>
      </TouchableOpacity>
      <TouchableOpacity onPress={() => router.push('/')}>
        <Text style={styles.navIcon}>👤</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  navbar: {
    position: 'absolute',
    bottom: 0,
    backgroundColor: '#001B3A',
    height: 60,
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    borderTopColor: '#003366',
    borderTopWidth: 1,
  },
  navIcon: {
    fontSize: 22,
    color: 'white',
  },
});
