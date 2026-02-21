import { useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { supabase } from '../lib/supabase';

/**
 * Centralized Supabase Realtime hook for admin panel.
 * Replaces all sidebar and dashboard polling with push-based updates.
 * Each admin component that needs live data should call this once.
 */
export function useAdminRealtime(clubId) {
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!clubId) return;

    const channels = [];

    // Credit requests (replaces 10s polling in SuperAdminSidebar)
    const creditChannel = supabase
      .channel(`admin-credits-${clubId}`)
      .on('postgres_changes', {
        event: '*', schema: 'public', table: 'credit_requests',
        filter: `club_id=eq.${clubId}`,
      }, () => {
        queryClient.invalidateQueries({ queryKey: ['creditRequests', clubId] });
      })
      .subscribe();
    channels.push(creditChannel);

    // Leave applications (replaces 10s polling in 7+ sidebars)
    const leaveChannel = supabase
      .channel(`admin-leaves-${clubId}`)
      .on('postgres_changes', {
        event: '*', schema: 'public', table: 'leave_applications',
        filter: `club_id=eq.${clubId}`,
      }, () => {
        queryClient.invalidateQueries({ queryKey: ['pendingLeaveApplications', clubId] });
        queryClient.invalidateQueries({ queryKey: ['myApprovedLeaves', clubId] });
        queryClient.invalidateQueries({ queryKey: ['leavePolicies', clubId] });
      })
      .subscribe();
    channels.push(leaveChannel);

    // Chat messages (replaces 10s polling in 9+ sidebars)
    const chatChannel = supabase
      .channel(`admin-chats-${clubId}`)
      .on('postgres_changes', {
        event: '*', schema: 'public', table: 'chat_messages',
      }, () => {
        queryClient.invalidateQueries({ queryKey: ['unreadChatCounts', clubId] });
      })
      .on('postgres_changes', {
        event: '*', schema: 'public', table: 'chat_sessions',
        filter: `club_id=eq.${clubId}`,
      }, () => {
        queryClient.invalidateQueries({ queryKey: ['unreadChatCounts', clubId] });
      })
      .subscribe();
    channels.push(chatChannel);

    // Notifications (replaces 30s polling in 9+ sidebars)
    const notifChannel = supabase
      .channel(`admin-notifs-${clubId}`)
      .on('postgres_changes', {
        event: '*', schema: 'public', table: 'push_notifications',
      }, () => {
        queryClient.invalidateQueries({ queryKey: ['unreadNotificationCount', clubId, 'staff'] });
        queryClient.invalidateQueries({ queryKey: ['notificationInbox'] });
      })
      .on('postgres_changes', {
        event: '*', schema: 'public', table: 'notification_read_status',
      }, () => {
        queryClient.invalidateQueries({ queryKey: ['unreadNotificationCount', clubId, 'staff'] });
      })
      .subscribe();
    channels.push(notifChannel);

    // Player profile change requests (replaces 10s polling)
    const profileChannel = supabase
      .channel(`admin-profile-requests-${clubId}`)
      .on('postgres_changes', {
        event: '*', schema: 'public', table: 'player_profile_change_requests',
        filter: `club_id=eq.${clubId}`,
      }, () => {
        queryClient.invalidateQueries({ queryKey: ['fieldUpdateRequests', clubId] });
      })
      .subscribe();
    channels.push(profileChannel);

    // Tournaments (replaces 10s polling)
    const tournamentChannel = supabase
      .channel(`admin-tournaments-${clubId}`)
      .on('postgres_changes', {
        event: '*', schema: 'public', table: 'tournaments',
        filter: `club_id=eq.${clubId}`,
      }, () => {
        queryClient.invalidateQueries({ queryKey: ['tournaments'] });
        queryClient.invalidateQueries({ queryKey: ['tournament-players'] });
      })
      .on('postgres_changes', {
        event: '*', schema: 'public', table: 'tournament_players',
      }, () => {
        queryClient.invalidateQueries({ queryKey: ['tournament-players'] });
      })
      .subscribe();
    channels.push(tournamentChannel);

    // Financial transactions (replaces revenue polling)
    const txnChannel = supabase
      .channel(`admin-txns-${clubId}`)
      .on('postgres_changes', {
        event: 'INSERT', schema: 'public', table: 'financial_transactions',
        filter: `club_id=eq.${clubId}`,
      }, () => {
        queryClient.invalidateQueries({ queryKey: ['clubRevenue', clubId] });
        queryClient.invalidateQueries({ queryKey: ['transactions'] });
      })
      .subscribe();
    channels.push(txnChannel);

    // Buy-in requests (real-time for staff to see new requests instantly)
    const buyinChannel = supabase
      .channel(`admin-buyins-${clubId}`)
      .on('postgres_changes', {
        event: '*', schema: 'public', table: 'buyin_requests',
        filter: `club_id=eq.${clubId}`,
      }, () => {
        queryClient.invalidateQueries({ queryKey: ['buyInRequests', clubId] });
      })
      .subscribe();
    channels.push(buyinChannel);

    // Buy-out requests (real-time for staff to see new requests instantly)
    const buyoutChannel = supabase
      .channel(`admin-buyouts-${clubId}`)
      .on('postgres_changes', {
        event: '*', schema: 'public', table: 'buyout_requests',
        filter: `club_id=eq.${clubId}`,
      }, () => {
        queryClient.invalidateQueries({ queryKey: ['buyOutRequests', clubId] });
      })
      .subscribe();
    channels.push(buyoutChannel);

    // FNB orders
    const fnbChannel = supabase
      .channel(`admin-fnb-${clubId}`)
      .on('postgres_changes', {
        event: '*', schema: 'public', table: 'fnb_orders',
        filter: `club_id=eq.${clubId}`,
      }, () => {
        queryClient.invalidateQueries({ queryKey: ['fnbOrders'] });
      })
      .subscribe();
    channels.push(fnbChannel);

    // Players table changes (balance updates, KYC, etc.)
    const playerChannel = supabase
      .channel(`admin-players-${clubId}`)
      .on('postgres_changes', {
        event: '*', schema: 'public', table: 'players',
        filter: `club_id=eq.${clubId}`,
      }, () => {
        queryClient.invalidateQueries({ queryKey: ['clubPlayers', clubId] });
      })
      .subscribe();
    channels.push(playerChannel);

    // Staff changes
    const staffChannel = supabase
      .channel(`admin-staff-${clubId}`)
      .on('postgres_changes', {
        event: '*', schema: 'public', table: 'staff',
        filter: `club_id=eq.${clubId}`,
      }, () => {
        queryClient.invalidateQueries({ queryKey: ['clubStaff', clubId] });
      })
      .subscribe();
    channels.push(staffChannel);

    // Table seat changes (replaces 5s polling in TableManagement)
    const tableChannel = supabase
      .channel(`admin-tables-${clubId}`)
      .on('postgres_changes', {
        event: '*', schema: 'public', table: 'tables',
        filter: `club_id=eq.${clubId}`,
      }, () => {
        queryClient.invalidateQueries({ queryKey: ['tables'] });
        queryClient.invalidateQueries({ queryKey: ['seatedPlayers'] });
      })
      .on('postgres_changes', {
        event: '*', schema: 'public', table: 'waitlist_entries',
        filter: `club_id=eq.${clubId}`,
      }, () => {
        queryClient.invalidateQueries({ queryKey: ['waitlist'] });
        queryClient.invalidateQueries({ queryKey: ['seatedPlayers'] });
      })
      .subscribe();
    channels.push(tableChannel);

    return () => {
      channels.forEach(ch => supabase.removeChannel(ch));
    };
  }, [clubId, queryClient]);
}
