// hooks/useSpotStatus.ts
import { useEffect, useState } from 'react';
import { socket, ensureConnectedOnce, joinRoom, leaveRoom } from '../services/socket';
import { detectWhatSpotChange, type Spot } from '../utils/spotEvents';

export function useSpotStatus(initialSpot: Spot) {
  const [selectedSpot, setSelectedSpot] = useState<Spot>(initialSpot);

  useEffect(() => {
    let cleanupFns: Array<() => void> = [];
    let mounted = true;

    (async () => {
      await ensureConnectedOnce();
      if (!mounted) return;

      const room = `pks_${initialSpot.pks_id}`;
      joinRoom(room);

      console.log(`Joined room: ${room}`);

      const events = [
        'backend:new_reservation',
        'backend:parking_spot_configured',
        'backend:spot_changed',
        'backend:parking_spot_updated',
      ];
      cleanupFns = events.map((evt) =>
        detectWhatSpotChange({
          socket,
          eventName: evt,
          currentSpot: initialSpot,
          changeState: setSelectedSpot,
        })
      );
    })();
    console.log(`useSpotStatus initialized for spot ${initialSpot.pks_id}`);
    return () => {
      mounted = false;
      cleanupFns.forEach((fn) => fn());
      leaveRoom(`pks_${initialSpot.pks_id}`);
    };
  }, [initialSpot.pks_id]);

  return { selectedSpot, setSelectedSpot };
}
