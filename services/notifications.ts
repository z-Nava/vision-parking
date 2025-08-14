// src/services/notifications.ts
import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

type ScheduleOpts = {
  title: string;
  body: string;
  seconds?: number;          // default 5
  data?: Record<string, any>;
  channelId?: string;        // default 'default' (Android)
};

// Llama esto una sola vez al iniciar la app (en _layout.tsx)
export function setupNotifications() {
  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowBanner: true,  // iOS
      shouldShowList: true,    // iOS
      shouldPlaySound: true,
      shouldSetBadge: false,
    }),
  });

  if (Platform.OS === 'android') {
    Notifications.setNotificationChannelAsync('default', {
      name: 'General',
      importance: Notifications.AndroidImportance.HIGH, // cámbialo a HIGH si quieres “heads-up”
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#FF231F7C',
    });
  }
}

// Pide permisos si hace falta
export async function ensurePermissions(): Promise<boolean> {
  const { status } = await Notifications.requestPermissionsAsync();
  return status === 'granted';
}

// Agenda notificación local relativa en segundos (por defecto 5s)
export async function notifyIn({
  title,
  body,
  seconds = 15,
  data,
  channelId = 'default',
}: ScheduleOpts) {
  const ok = await ensurePermissions();
  if (!ok) return;

  await Notifications.scheduleNotificationAsync({
    content: { title, body, data },
    trigger: { seconds, channelId },
  });
}
