/**
 * WebSocket Hook for Real-time Updates
 * Connects to poker-crm-backend Socket.IO gateway
 */

import { useEffect, useRef, useState } from 'react';
import { io } from 'socket.io-client';

const WEBSOCKET_URL = process.env.REACT_APP_WEBSOCKET_URL || 'http://localhost:3333';

export const useWebSocket = (clubId, userId) => {
  const [connected, setConnected] = useState(false);
  const [events, setEvents] = useState([]);
  const socketRef = useRef(null);

  useEffect(() => {
    if (!clubId) return;

    // Create Socket.IO connection
    const socket = io(`${WEBSOCKET_URL}/realtime`, {
      auth: { clubId, userId },
      transports: ['websocket', 'polling'],
    });

    socketRef.current = socket;

    // Connection events
    socket.on('connect', () => {
      console.log('✅ WebSocket connected:', socket.id);
      setConnected(true);

      // Subscribe to club events
      socket.emit('subscribe:club', { clubId, userId });
    });

    socket.on('disconnect', () => {
      console.log('❌ WebSocket disconnected');
      setConnected(false);
    });

    socket.on('error', (error) => {
      console.error('WebSocket error:', error);
    });

    socket.on('subscribed', (data) => {
      console.log('✅ Subscribed to:', data);
    });

    // Real-time event listeners
    socket.on('table:updated', (data) => {
      console.log('📊 Table updated:', data);
      setEvents(prev => [...prev, { type: 'table:updated', data, timestamp: Date.now() }]);
    });

    socket.on('waitlist:updated', (data) => {
      console.log('👥 Waitlist updated:', data);
      setEvents(prev => [...prev, { type: 'waitlist:updated', data, timestamp: Date.now() }]);
    });

    socket.on('player:seated', (data) => {
      console.log('💺 Player seated:', data);
      setEvents(prev => [...prev, { type: 'player:seated', data, timestamp: Date.now() }]);
    });

    socket.on('credit:approved', (data) => {
      console.log('💳 Credit approved:', data);
      setEvents(prev => [...prev, { type: 'credit:approved', data, timestamp: Date.now() }]);
    });

    socket.on('order:status', (data) => {
      console.log('🍔 Order status:', data);
      setEvents(prev => [...prev, { type: 'order:status', data, timestamp: Date.now() }]);
    });

    socket.on('tournament:updated', (data) => {
      console.log('🏆 Tournament updated:', data);
      setEvents(prev => [...prev, { type: 'tournament:updated', data, timestamp: Date.now() }]);
    });

    // Cleanup
    return () => {
      if (socket) {
        socket.emit('unsubscribe:club', { clubId });
        socket.disconnect();
      }
    };
  }, [clubId, userId]);

  // Emit event
  const emit = (event, data) => {
    if (socketRef.current && connected) {
      socketRef.current.emit(event, data);
    }
  };

  // Subscribe to custom event
  const subscribe = (event, callback) => {
    if (socketRef.current) {
      socketRef.current.on(event, callback);
    }
  };

  // Unsubscribe from custom event
  const unsubscribe = (event, callback) => {
    if (socketRef.current) {
      socketRef.current.off(event, callback);
    }
  };

  // Clear events
  const clearEvents = () => {
    setEvents([]);
  };

  return {
    connected,
    events,
    emit,
    subscribe,
    unsubscribe,
    clearEvents,
  };
};

export default useWebSocket;






