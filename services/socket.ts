// services/socket.ts
import io from 'socket.io-client';
import { Platform } from 'react-native';
import * as SecureStore from 'expo-secure-store';

const DEV_LAN = 'http://192.168.1.100:3000';
const ANDROID_EMULATOR = 'http://10.0.2.2:3000';
const IOS_SIMULATOR = 'http://localhost:3000';
const PROD = 'https://vpa.disse.space';

const URL = __DEV__
  ? Platform.select({ android: ANDROID_EMULATOR, ios: IOS_SIMULATOR, default: DEV_LAN })!
  : PROD;

export const socket = io(URL, {
  transports: ['websocket', 'polling'],
  autoConnect: false,
});

// 👉 evita reconexiones múltiples
let connectPromise: Promise<void> | null = null;

export async function ensureConnectedOnce() {
  if (socket.connected) return;
  if (connectPromise) return connectPromise;

  connectPromise = (async () => {
    const token = await SecureStore.getItemAsync('auth_token');
    if (token) {
      // handshake auth; si tu backend usa Authorization header, usa extraHeaders (comentado abajo)
      (socket as any).auth = { token };
      // (socket as any).io.opts.extraHeaders = { Authorization: `Bearer ${token}` };
    }

    return new Promise<void>((resolve) => {
      const onConnect = () => {
        // console.log('[socket] connected', socket.id);
        socket.off('connect', onConnect);
        resolve();
      };
      socket.on('connect', onConnect);
      if (!socket.connected) socket.connect();
    });
  })();

  await connectPromise;
}



// 👉 dedupe de rooms
const joinedRooms = new Set<string>();

export function joinRoom(room: string) {
  if (joinedRooms.has(room)) return;
  socket.emit('join_room', room);
  joinedRooms.add(room);
}

export function leaveRoom(room: string) {
  if (!joinedRooms.has(room)) return;
  socket.emit('leave_room', room);
  joinedRooms.delete(room);
}

export function disconnectSocket() {
  joinedRooms.clear();
  if (socket.connected) socket.disconnect();
  connectPromise = null;
}


