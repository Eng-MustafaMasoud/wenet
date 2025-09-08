import { useEffect, useRef } from 'react';
import { useDispatch } from 'react-redux';
import { wsService } from '@/services/websocket';
import { updateZone } from '@/store/slices/gateSlice';
import { updateZone as updateAdminZone, addAdminUpdate } from '@/store/slices/adminSlice';
import { addNotification } from '@/store/slices/uiSlice';
import { WSZoneUpdateMessage, WSAdminUpdateMessage } from '@/types/api';

export const useWebSocket = (gateId?: string) => {
  const dispatch = useDispatch();
  const unsubscribeRef = useRef<(() => void) | null>(null);

  useEffect(() => {
    // Subscribe to gate if provided
    if (gateId) {
      wsService.subscribe(gateId);
    }

    // Set up message handler
    const unsubscribe = wsService.addMessageHandler((message: WSZoneUpdateMessage | WSAdminUpdateMessage) => {
      if (message.type === 'zone-update') {
        // Update zone in both gate and admin slices
        dispatch(updateZone(message.payload));
        dispatch(updateAdminZone(message.payload));
        
        // Show notification
        dispatch(addNotification({
          type: 'info',
          message: `Zone ${message.payload.name} updated`,
        }));
      } else if (message.type === 'admin-update') {
        // Add admin update to admin slice
        dispatch(addAdminUpdate(message.payload));
        
        // Show notification
        dispatch(addNotification({
          type: 'info',
          message: `Admin action: ${message.payload.action}`,
        }));
      }
    });

    unsubscribeRef.current = unsubscribe;

    // Cleanup on unmount
    return () => {
      if (unsubscribeRef.current) {
        unsubscribeRef.current();
      }
      if (gateId) {
        wsService.unsubscribe(gateId);
      }
    };
  }, [dispatch, gateId]);

  return {
    connectionState: wsService.getConnectionState(),
    isConnected: wsService.isConnected(),
    reconnect: wsService.reconnect,
  };
};
