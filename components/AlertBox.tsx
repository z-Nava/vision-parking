import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

type AlertType = 'error' | 'success' | 'info' | 'warning';

interface AlertBoxProps {
  type?: AlertType;
  code?: string;
  message: string;
  detail?: string;
}

const AlertBox: React.FC<AlertBoxProps> = ({
  type = 'error',
  code,
  message,
  detail,
}) => {
  const getColor = () => {
    switch (type) {
      case 'success':
        return '#28a745';
      case 'info':
        return '#17a2b8';
      case 'warning':
        return '#ffc107';
      case 'error':
      default:
        return '#b71c1c'; // rojo oscuro
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: getColor() }]}>
      <Ionicons name="close-circle" size={24} color="#fff" style={styles.icon} />
      <View style={{ flex: 1 }}>
        <Text style={styles.code}>{code ? `${code} - ${message}` : message}</Text>
        {detail && <Text style={styles.detail}>{detail}</Text>}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    padding: 12,
    borderRadius: 10,
    alignItems: 'center',
    marginBottom: 10,
    elevation: 4,
  },
  icon: {
    marginRight: 10,
  },
  code: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 14,
  },
  detail: {
    color: '#fff',
    fontSize: 13,
    marginTop: 2,
  },
});

export default AlertBox;
