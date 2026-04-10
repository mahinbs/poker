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

    // Notifications (many backends also create a staff notification when a player signs up or requests a field change)
    socket.on('notification:new', () => {
      queryClient.invalidateQueries({ queryKey: ['unreadNotificationCount', clubId, 'staff'] });
      queryClient.invalidateQueries({ queryKey: ['notificationInbox'] });
      queryClient.invalidateQueries({ queryKey: ['pendingPlayers', clubId] });
      queryClient.invalidateQueries({ queryKey: ['fieldUpdateRequests', clubId] });
    });
    socket.on('notification:read-status-changed', () => {
      queryClient.invalidateQueries({ queryKey: ['unreadNotificationCount', clubId, 'staff'] });
    });

    // Unified Player Management: pending signup approvals + field update requests
    // Backend should emit Socket.IO to the club room when these change, e.g.:
    // - player:pending-approval | players-pending:changed | player:signup-pending → new player awaiting approval
    // - profile-request:new | profile-request:updated | player-field-update:new | player-field-updates:changed | field-update:pending
    const invalidatePendingApprovals = () => {
      queryClient.invalidateQueries({ queryKey: ['pendingPlayers', clubId] });
      queryClient.invalidateQueries({ queryKey: ['clubPlayers', clubId] });
    };
    const invalidateFieldUpdateRequests = () => {
      queryClient.invalidateQueries({ queryKey: ['fieldUpdateRequests', clubId] });
    };

    socket.on('player:pending-approval', invalidatePendingApprovals);
    socket.on('players-pending:changed', invalidatePendingApprovals);
    socket.on('player:signup-pending', invalidatePendingApprovals);

    socket.on('profile-request:new', invalidateFieldUpdateRequests);
    socket.on('profile-request:updated', invalidateFieldUpdateRequests);
    socket.on('player-field-update:new', invalidateFieldUpdateRequests);
    socket.on('player-field-updates:changed', invalidateFieldUpdateRequests);
    socket.on('field-update:pending', invalidateFieldUpdateRequests);

    // Tournaments
    socket.on('tournament:updated', () => {
      queryClient.invalidateQueries({ queryKey: ['tournaments'] });
      queryClient.invalidateQueries({ queryKey: ['rummy-tournaments'] });
      queryClient.invalidateQueries({ queryKey: ['tournament-details'] });
      queryClient.invalidateQueries({ queryKey: ['rummy-tournament-details'] });
      queryClient.invalidateQueries({ queryKey: ['tournament-players'] });
      queryClient.invalidateQueries({ queryKey: ['rummy-tournament-players'] });
    });
    socket.on('tournament:player-updated', () => {
      queryClient.invalidateQueries({ queryKey: ['tournament-players'] });
      queryClient.invalidateQueries({ queryKey: ['rummy-tournament-players'] });
    });
    socket.on('tournament:blinds-updated', () => {
      queryClient.invalidateQueries({ queryKey: ['tournaments'] });
      queryClient.invalidateQueries({ queryKey: ['rummy-tournaments'] });
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
      queryClient.invalidateQueries({ queryKey: ['seatedPlayers'] });
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
    });

    // Buy-out requests
    socket.on('buyout:new-request', () => {
      queryClient.invalidateQueries({ queryKey: ['buyOutRequests', clubId] });
      queryClient.invalidateQueries({ queryKey: ['buyout-player-balance', clubId] });
      queryClient.invalidateQueries({ queryKey: ['buyout-live-seated-player', clubId] });
    });
    socket.on('buyout:updated', () => {
      queryClient.invalidateQueries({ queryKey: ['buyOutRequests', clubId] });
      queryClient.invalidateQueries({ queryKey: ['buyout-player-balance', clubId] });
      queryClient.invalidateQueries({ queryKey: ['buyout-live-seated-player', clubId] });
      queryClient.invalidateQueries({ queryKey: ['seatedPlayers'] });
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
    });

    // FNB orders
    socket.on('fnb:order-updated', () => {
      queryClient.invalidateQueries({ queryKey: ['fnbOrders'] });
      queryClient.invalidateQueries({ queryKey: ['fnbOrders', clubId] });
      queryClient.invalidateQueries({ queryKey: ['kitchenStations', clubId] });
      queryClient.invalidateQueries({ queryKey: ['stationStats', clubId] });
    });

    // VIP store (purchases + product list for staff)
    socket.on('vip:store-updated', () => {
      queryClient.invalidateQueries({ queryKey: ['vipProducts', clubId] });
      queryClient.invalidateQueries({ queryKey: ['vipPurchases', clubId] });
    });

    // Players table changes (balance, KYC, new registration, etc.)
    socket.on('player:updated', () => {
      queryClient.invalidateQueries({ queryKey: ['clubPlayers', clubId] });
      queryClient.invalidateQueries({ queryKey: ['pendingPlayers', clubId] });
    });
    socket.on('kyc:status-changed', () => {
      queryClient.invalidateQueries({ queryKey: ['clubPlayers', clubId] });
      queryClient.invalidateQueries({ queryKey: ['pendingPlayers', clubId] });
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
      queryClient.invalidateQueries({ queryKey: ['waitlist', clubId] });
      queryClient.invalidateQueries({ queryKey: ['seatedPlayers'] });
    });
    socket.on('waitlist:position-updated', () => {
      queryClient.invalidateQueries({ queryKey: ['waitlist'] });
      queryClient.invalidateQueries({ queryKey: ['waitlist', clubId] });
    });

    socket.on('disconnect', (reason) => {
      console.log('🔌 [ADMIN SOCKET] Disconnected:', reason);
    });

    return () => {
      socket.disconnect();
    };
  }, [clubId, queryClient]);
}
