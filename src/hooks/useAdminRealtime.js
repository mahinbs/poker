import { useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { io } from 'socket.io-client';

const WEBSOCKET_URL = (process.env.REACT_APP_API_BASE_URL || 'http://localhost:3333/api')
  .replace(/\/api$/, '');

/**
 * Centralized Socket.IO hook for admin panel real-time updates.
 * Replaces all Supabase Realtime subscriptions with JWT-authenticated Socket.IO events.
 * Staff subscribe to the club channel to receive push-based updates for all relevant tables.
 */
export function useAdminRealtime(clubId) {
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!clubId) return;

    const token = localStorage.getItem('authToken') || localStorage.getItem('token');
    const userId = localStorage.getItem('userId');

    const socket = io(`${WEBSOCKET_URL}/realtime`, {
      auth: { clubId, userId, token },
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionDelay: 2000,
      reconnectionAttempts: Infinity,
    });

    socket.on('connect', () => {
      console.log('✅ [ADMIN SOCKET] Connected, subscribing to club:', clubId);
      socket.emit('subscribe:club', { clubId, userId });
    });

    // Credit requests
    socket.on('credit:status-changed', () => {
      queryClient.invalidateQueries({ queryKey: ['creditRequests', clubId] });
    });
    socket.on('credit:new-request', () => {
      queryClient.invalidateQueries({ queryKey: ['creditRequests', clubId] });
    });

    // Leave applications
    socket.on('leave:updated', () => {
      queryClient.invalidateQueries({ queryKey: ['pendingLeaveApplications', clubId] });
      queryClient.invalidateQueries({ queryKey: ['myApprovedLeaves', clubId] });
      queryClient.invalidateQueries({ queryKey: ['leavePolicies', clubId] });
    });

    // Chat messages & sessions
    socket.on('chat:new-message', () => {
      queryClient.invalidateQueries({ queryKey: ['unreadChatCounts', clubId] });
    });
    socket.on('chat:session-updated', () => {
      queryClient.invalidateQueries({ queryKey: ['unreadChatCounts', clubId] });
    });

    // Notifications
    socket.on('notification:new', () => {
      queryClient.invalidateQueries({ queryKey: ['unreadNotificationCount', clubId, 'staff'] });
      queryClient.invalidateQueries({ queryKey: ['notificationInbox'] });
    });
    socket.on('notification:read-status-changed', () => {
      queryClient.invalidateQueries({ queryKey: ['unreadNotificationCount', clubId, 'staff'] });
    });

    // Player profile change requests
    socket.on('profile-request:updated', () => {
      queryClient.invalidateQueries({ queryKey: ['fieldUpdateRequests', clubId] });
    });

    // Tournaments
    socket.on('tournament:updated', () => {
      queryClient.invalidateQueries({ queryKey: ['tournaments'] });
      queryClient.invalidateQueries({ queryKey: ['tournament-players'] });
    });
    socket.on('tournament:player-updated', () => {
      queryClient.invalidateQueries({ queryKey: ['tournament-players'] });
    });
    socket.on('tournament:blinds-updated', () => {
      queryClient.invalidateQueries({ queryKey: ['tournaments'] });
    });

    // Financial transactions
    socket.on('transaction:new', () => {
      queryClient.invalidateQueries({ queryKey: ['clubRevenue', clubId] });
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
    });

    // Buy-in requests
    socket.on('buyin:new-request', () => {
      queryClient.invalidateQueries({ queryKey: ['buyInRequests', clubId] });
    });
    socket.on('buyin:updated', () => {
      queryClient.invalidateQueries({ queryKey: ['buyInRequests', clubId] });
    });

    // Buy-out requests
    socket.on('buyout:new-request', () => {
      queryClient.invalidateQueries({ queryKey: ['buyOutRequests', clubId] });
    });
    socket.on('buyout:updated', () => {
      queryClient.invalidateQueries({ queryKey: ['buyOutRequests', clubId] });
    });

    // FNB orders
    socket.on('fnb:order-updated', () => {
      queryClient.invalidateQueries({ queryKey: ['fnbOrders'] });
    });

    // Players table changes (balance, KYC, etc.)
    socket.on('player:updated', () => {
      queryClient.invalidateQueries({ queryKey: ['clubPlayers', clubId] });
    });
    socket.on('kyc:status-changed', () => {
      queryClient.invalidateQueries({ queryKey: ['clubPlayers', clubId] });
    });

    // Staff changes
    socket.on('staff:updated', () => {
      queryClient.invalidateQueries({ queryKey: ['clubStaff', clubId] });
    });

    // Tables and waitlist
    socket.on('table:status-changed', () => {
      queryClient.invalidateQueries({ queryKey: ['tables'] });
      queryClient.invalidateQueries({ queryKey: ['seatedPlayers'] });
    });
    socket.on('tables:updated', () => {
      queryClient.invalidateQueries({ queryKey: ['tables'] });
    });
    socket.on('waitlist:status-changed', () => {
      queryClient.invalidateQueries({ queryKey: ['waitlist'] });
      queryClient.invalidateQueries({ queryKey: ['seatedPlayers'] });
    });
    socket.on('waitlist:position-updated', () => {
      queryClient.invalidateQueries({ queryKey: ['waitlist'] });
    });

    socket.on('disconnect', (reason) => {
      console.log('🔌 [ADMIN SOCKET] Disconnected:', reason);
    });

    return () => {
      socket.disconnect();
    };
  }, [clubId, queryClient]);
}
