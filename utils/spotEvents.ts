// utils/spotEvents.ts
import { socket as globalSocket } from '../services/socket';

export type Spot = {
  pks_id: string;
  pks_number: string | number;
  status?: { stu_name?: string };
};

type DetectArgs = {
  socket?: any;
  eventName: string;
  currentSpot: Spot;
  changeState: (s: Spot | ((prev: Spot) => Spot)) => void;
};

// Intenta mapear distintos formatos de payload a nuestro Spot
function coerceSpot(payload: any): Spot | null {
  if (!payload) return null;
  const s = payload.spot ?? payload; // a veces viene dentro de { spot }
  const id =
    s.pks_id ?? s.id ?? s.spot_id ?? s.pk_id ?? s.pksId ?? s.spotId ?? null;

  if (!id) return null;

  const statusName =
    s.status?.stu_name ??
    s.status ??
    s.stu_name ??
    s.state ??
    s.current_status ??
    undefined;

  return {
    pks_id: id,
    pks_number: s.pks_number ?? s.number ?? s.name ?? s.label ?? '—',
    status:
      statusName !== undefined ? { stu_name: String(statusName) } : undefined,
  };
}

export function detectWhatSpotChange({
  socket,
  eventName,
  currentSpot,
  changeState,
}: DetectArgs) {
  const s = socket ?? globalSocket;

  const handler = (payload: any) => {
    const normalized = coerceSpot(payload);
    if (!normalized) {
      if (__DEV__) {
        console.log(`[socket] ${eventName} ignorado (no pude extraer pks_id):`, payload);
      }
      return;
    }

    if (normalized.pks_id === currentSpot.pks_id) {
      if (__DEV__) {
        console.log(`[socket] ${eventName} MATCH ${currentSpot.pks_id} ->`, normalized);
      }
      changeState((prev) => ({ ...prev, ...normalized }));
    } else {
      if (__DEV__) {
        console.log(
          `[socket] ${eventName} para otro spot (${normalized.pks_id}) != ${currentSpot.pks_id}`
        );
      }
    }
  };

  s.on(eventName, handler);
  return () => s.off(eventName, handler);
}
