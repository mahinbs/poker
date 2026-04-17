import { useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { io } from 'socket.io-client';
import { playTableBuyInOutAlert } from '../lib/playTableBuyInOutAlert';

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
    const clubKey = clubId != null && String(clubId).trim() !== '' ? String(clubId).trim() : '';
    if (!clubKey) return;

    const token = localStorage.getItem('authToken') || localStorage.getItem('token');
    const userId = localStorage.getItem('userId');

    const socket = io(`${WEBSOCKET_URL}/realtime`, {
      auth: { clubId: clubKey, userId, token },
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionDelay: 2000,
      reconnectionAttempts: Infinity,
    });

    socket.on('connect', () => {
      console.log('✅ [ADMIN SOCKET] Connected, subscribing to club:', clubKey);
      socket.emit('subscribe:club', { clubId: clubKey, userId });
    });

    // Credit requests (approval may post Credit to table while seated — refresh table + balances)
    socket.on('credit:status-changed', () => {
      queryClient.invalidateQueries({ queryKey: ['creditRequests', clubKey] });
      queryClient.invalidateQueries({ queryKey: ['seatedPlayers'] });
      queryClient.invalidateQueries({ queryKey: ['playerBalance'] });
      queryClient.invalidateQueries({ queryKey: ['buyout-live-seated-player', clubKey] });
    });
    socket.on('credit:new-request', () => {
      queryClient.invalidateQueries({ queryKey: ['creditRequests', clubKey] });
    });
    socket.on('credit:facility-changed', () => {
      queryClient.invalidateQueries({ queryKey: ['creditRequests', clubKey] });
      queryClient.invalidateQueries({ queryKey: ['creditPlayers', clubKey] });
      queryClient.invalidateQueries({ queryKey: ['clubPlayers', clubKey] });
      queryClient.invalidateQueries({ queryKey: ['seatedPlayers'] });
      queryClient.invalidateQueries({ queryKey: ['playerBalance'] });
    });

    // Leave applications (pending list, approve tab with filters, employee lists)
    const invalidateLeaveQueries = () => {
      queryClient.invalidateQueries({ queryKey: ['pendingLeaveApplications', clubKey] });
      queryClient.invalidateQueries({ queryKey: ['leaveApplicationsForApproval', clubKey] });
      queryClient.invalidateQueries({ queryKey: ['leaveApplicationsForApprovalBulk', clubKey] });
      queryClient.invalidateQueries({ queryKey: ['myLeaveApplications', clubKey] });
      queryClient.invalidateQueries({ queryKey: ['myApprovedLeaves', clubKey] });
      queryClient.invalidateQueries({ queryKey: ['leavePolicies', clubKey] });
      queryClient.invalidateQueries({ queryKey: ['leaveBalance', clubKey] });
    };
    socket.on('leave:updated', invalidateLeaveQueries);
    socket.on('leave:new-request', invalidateLeaveQueries);
    socket.on('leave:application-created', invalidateLeaveQueries);

    // Chat messages & sessions
    socket.on('chat:new-message', () => {
      queryClient.invalidateQueries({ queryKey: ['unreadChatCounts', clubKey] });
    });
    socket.on('chat:session-updated', () => {
      queryClient.invalidateQueries({ queryKey: ['unreadChatCounts', clubKey] });
    });

    // Notifications (many backends also create a staff notification when a player signs up or requests a field change)
    socket.on('notification:new', () => {
      queryClient.invalidateQueries({ queryKey: ['unreadNotificationCount', clubKey, 'staff'] });
      queryClient.invalidateQueries({ queryKey: ['notificationInbox'] });
      queryClient.invalidateQueries({ queryKey: ['pendingPlayers', clubKey] });
      queryClient.invalidateQueries({ queryKey: ['fieldUpdateRequests', clubKey] });
      queryClient.invalidateQueries({ queryKey: ['pendingLeaveApplications', clubKey] });
      queryClient.invalidateQueries({ queryKey: ['leaveApplicationsForApproval', clubKey] });
    });
    socket.on('notification:read-status-changed', () => {
      queryClient.invalidateQueries({ queryKey: ['unreadNotificationCount', clubKey, 'staff'] });
    });

    // Unified Player Management: pending signup approvals + field update requests
    // Backend should emit Socket.IO to the club room when these change, e.g.:
    // - player:pending-approval | players-pending:changed | player:signup-pending → new player awaiting approval
    // - profile-request:new | profile-request:updated | player-field-update:new | player-field-updates:changed | field-update:pending
    const invalidatePendingApprovals = () => {
      queryClient.invalidateQueries({ queryKey: ['pendingPlayers', clubKey] });
      queryClient.invalidateQueries({ queryKey: ['clubPlayers', clubKey] });
    };
    const invalidateFieldUpdateRequests = () => {
      queryClient.invalidateQueries({ queryKey: ['fieldUpdateRequests', clubKey] });
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
      queryClient.invalidateQueries({ queryKey: ['clubRevenue', clubKey] });
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
    });

    // Buy-in requests (prefix invalidate so string/number clubId keys all refresh).
    // Sound is driven by useTableBuyInOutPending (table-only count) after refetch, not here — club wallet buy-ins share buyin:new-request.
    socket.on('buyin:new-request', () => {
      queryClient.invalidateQueries({ queryKey: ['buyInRequests'] });
      queryClient.invalidateQueries({ queryKey: ['clubBuyInRequests'] });
    });
    socket.on('buyin:updated', () => {
      queryClient.invalidateQueries({ queryKey: ['buyInRequests'] });
      queryClient.invalidateQueries({ queryKey: ['clubBuyInRequests'] });
      queryClient.invalidateQueries({ queryKey: ['seatedPlayers'] });
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
    });

    // Buy-out requests
    socket.on('buyout:new-request', () => {
      playTableBuyInOutAlert();
      queryClient.invalidateQueries({ queryKey: ['buyOutRequests'] });
      queryClient.invalidateQueries({ queryKey: ['buyout-player-balance', clubKey] });
      queryClient.invalidateQueries({ queryKey: ['buyout-live-seated-player', clubKey] });
    });
    socket.on('buyout:updated', () => {
      queryClient.invalidateQueries({ queryKey: ['buyOutRequests'] });
      queryClient.invalidateQueries({ queryKey: ['buyout-player-balance', clubKey] });
      queryClient.invalidateQueries({ queryKey: ['buyout-live-seated-player', clubKey] });
      queryClient.invalidateQueries({ queryKey: ['seatedPlayers'] });
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
    });

    // FNB orders
    socket.on('fnb:order-updated', () => {
      queryClient.invalidateQueries({ queryKey: ['fnbOrders'] });
      queryClient.invalidateQueries({ queryKey: ['fnbOrders', clubKey] });
      queryClient.invalidateQueries({ queryKey: ['kitchenStations', clubKey] });
      queryClient.invalidateQueries({ queryKey: ['stationStats', clubKey] });
    });

    // VIP store (purchases + product list for staff)
    socket.on('vip:store-updated', () => {
      queryClient.invalidateQueries({ queryKey: ['vipProducts', clubKey] });
      queryClient.invalidateQueries({ queryKey: ['vipPurchases', clubKey] });
    });

    // Players table changes (balance, KYC, new registration, etc.)
    socket.on('player:updated', () => {
      queryClient.invalidateQueries({ queryKey: ['clubPlayers', clubKey] });
      queryClient.invalidateQueries({ queryKey: ['pendingPlayers', clubKey] });
    });
    socket.on('kyc:status-changed', () => {
      queryClient.invalidateQueries({ queryKey: ['clubPlayers', clubKey] });
      queryClient.invalidateQueries({ queryKey: ['pendingPlayers', clubKey] });
    });

    // Staff changes
    socket.on('staff:updated', () => {
      queryClient.invalidateQueries({ queryKey: ['clubStaff', clubKey] });
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
      queryClient.invalidateQueries({ queryKey: ['waitlist', clubKey] });
      queryClient.invalidateQueries({ queryKey: ['seatedPlayers'] });
    });
    socket.on('waitlist:position-updated', () => {
      queryClient.invalidateQueries({ queryKey: ['waitlist'] });
      queryClient.invalidateQueries({ queryKey: ['waitlist', clubKey] });
    });

    socket.on('disconnect', (reason) => {
      console.log('🔌 [ADMIN SOCKET] Disconnected:', reason);
    });

    return () => {
      socket.disconnect();
    };
  }, [clubId, queryClient]);
}

