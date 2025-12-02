import { useEffect, useRef } from 'react';
import io from 'socket.io-client';

const WS_URL = process.env.REACT_APP_WS_URL || 'http://localhost:3333';

export function usePlayerWebSocket(onTableUpdate, onCreditUpdate, onWaitlistUpdate) {
  const socketRef = useRef(null);
  const playerRef = useRef(null);

  useEffect(() => {
    const player = JSON.parse(localStorage.getItem('player') || '{}');
    if (!player.id || !player.clubId) {
      return;
    }

    playerRef.current = player;

    // Connect to WebSocket
    socketRef.current = io(`${WS_URL}/realtime`, {
      transports: ['websocket']
    });

    const socket = socketRef.current;

    socket.on('connect', () => {
      console.log('WebSocket connected');
      
      // Subscribe to club updates
      socket.emit('subscribe:club', {
        clubId: player.clubId,
        playerId: player.id
      });

      // Subscribe to player-specific updates
      socket.emit('subscribe:player', {
        playerId: player.id,
        clubId: player.clubId
      });
    });

    socket.on('disconnect', () => {
      console.log('WebSocket disconnected');
    });

    socket.on('error', (error) => {
      console.error('WebSocket error:', error);
    });

    // Table events
    socket.on('table:status-changed', (data) => {
      console.log('Table status changed:', data);
      if (onTableUpdate) {
        onTableUpdate(data);
      }
    });

    socket.on('tables:updated', (data) => {
      console.log('Tables updated:', data);
      if (onTableUpdate) {
        onTableUpdate(data);
      }
    });

    socket.on('table:available', (data) => {
      console.log('Table available:', data);
      if (onTableUpdate) {
        onTableUpdate(data);
      }
    });

    // Credit events
    socket.on('credit:status-changed', (data) => {
      console.log('Credit status changed:', data);
      if (onCreditUpdate) {
        onCreditUpdate(data);
      }
    });

    // Waitlist events
    socket.on('waitlist:position-updated', (data) => {
      console.log('Waitlist position updated:', data);
      if (onWaitlistUpdate) {
        onWaitlistUpdate(data);
      }
    });

    socket.on('waitlist:status-changed', (data) => {
      console.log('Waitlist status changed:', data);
      if (onWaitlistUpdate) {
        onWaitlistUpdate(data);
      }
    });

    return () => {
      if (socket) {
        socket.disconnect();
      }
    };
  }, [onTableUpdate, onCreditUpdate, onWaitlistUpdate]);

  return socketRef.current;
}

