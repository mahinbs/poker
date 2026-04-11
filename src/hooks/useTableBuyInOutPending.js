import { useEffect, useMemo, useRef } from 'react';
import { useQuery } from '@tanstack/react-query';
import { clubsAPI, waitlistAPI, tablesAPI } from '../lib/api';
import { playTableBuyInOutAlert } from '../lib/playTableBuyInOutAlert';

export function formatInrCompact(value) {
  const v = Number(value) || 0;
  if (v >= 10000000) return `${(v / 10000000).toFixed(1)}Cr`;
  if (v >= 100000) return `${(v / 100000).toFixed(1)}L`;
  if (v >= 1000) return `${(v / 1000).toFixed(1)}k`;
  return v.toLocaleString('en-IN');
}

/** Exported for BuyInRequestManagement / TableBuyOutManagement pending filters. */
export function isPendingBuyInOutRequest(r) {
  const s = String(r?.status ?? r?.requestStatus ?? '')
    .trim()
    .toLowerCase();
  if (['approved', 'rejected', 'completed', 'cancelled', 'canceled', 'denied'].includes(s)) {
    return false;
  }
  return (
    s === 'pending' ||
    s === 'requested' ||
    s === 'open' ||
    s === 'awaiting' ||
    s === 'awaiting_approval' ||
    s === 'awaiting approval'
  );
}

function normStr(v) {
  return String(v ?? '')
    .trim()
    .toLowerCase();
}

/** Collect string primitives for loose backend enum / label matching (Prisma, notes, etc.). */
function collectRowStrings(obj, depth = 0, maxDepth = 4, maxStrings = 100, out = []) {
  if (!obj || depth > maxDepth || out.length >= maxStrings) return out;
  if (typeof obj === 'string') {
    if (obj.trim()) out.push(obj);
    return out;
  }
  if (typeof obj !== 'object') return out;
  if (Array.isArray(obj)) {
    for (let i = 0; i < obj.length && out.length < maxStrings; i++) {
      collectRowStrings(obj[i], depth + 1, maxDepth, maxStrings, out);
    }
    return out;
  }
  for (const k of Object.keys(obj)) {
    if (out.length >= maxStrings) break;
    collectRowStrings(obj[k], depth + 1, maxDepth, maxStrings, out);
  }
  return out;
}

function joinedRowText(r) {
  return collectRowStrings(r).join('\u0001').toLowerCase();
}

/**
 * Player request to add chips **at the table** (from `/buyin-requests`), not club/cashier wallet buy-in.
 * Backend often mixes both in one list; club rows may still include tableId/tableNumber, so we use
 * explicit type fields and a bounded string scan (e.g. CLUB_BUY_IN, club_buy_in) in addition to context.
 */
export function isClubWalletBuyInRequestRow(r) {
  if (!r || typeof r !== 'object') return false;

  if (r.isClubBuyIn === true || r.is_club_buy_in === true || r.clubBuyIn === true) return true;

  const target = normStr(
    r.targetBalanceType ??
      r.target_balance_type ??
      r.creditTarget ??
      r.credit_target ??
      r.balanceTarget ??
      r.balance_target ??
      r.creditsTo ??
      r.credits_to ??
      r.destinationBalance ??
      r.target ??
      ''
  );
  if (
    target === 'available' ||
    target === 'wallet' ||
    target === 'club' ||
    target === 'club_wallet' ||
    target === 'available_balance'
  ) {
    return true;
  }
  if (target === 'table' || target === 'table_chips' || target === 'seat') {
    return false;
  }

  const directKeys = [
    r.requestType,
    r.request_type,
    r.type,
    r.kind,
    r.category,
    r.requestCategory,
    r.request_category,
    r.buyInCategory,
    r.buy_in_category,
    r.buyInType,
    r.buy_in_type,
    r.scope,
    r.source,
    r.origin,
    r.channel,
    r.destination,
    r.target,
    r.purpose,
    r.intent,
    r.requestKind,
    r.request_kind,
  ];
  for (const raw of directKeys) {
    const t = normStr(raw);
    if (!t) continue;
    if (
      t === 'club' ||
      t === 'wallet' ||
      t === 'cashier' ||
      t === 'club_wallet' ||
      t === 'available_balance' ||
      t === 'availablebalance'
    ) {
      return true;
    }
    if (t.includes('club_buy') || t.includes('club buy') || t.includes('clubbuyin')) return true;
    if (t.includes('club') && t.includes('wallet')) return true;
  }

  const blob = joinedRowText(r);
  if (!blob) return false;

  if (/\btable[_\s-]*buy[_\s-]*in\b/i.test(blob)) return false;

  if (
    /\bclub[_\s-]*buy[_\s-]*in\b/i.test(blob) ||
    /\bclubbuyin\b/i.test(blob) ||
    /\bclub_buy_in\b/i.test(blob) ||
    /\bclubwallet\b/i.test(blob) ||
    /\bwallet[_\s-]*buy[_\s-]*in\b/i.test(blob) ||
    /\bavailable[_\s-]*balance[_\s-]*buy/i.test(blob)
  ) {
    return true;
  }

  return false;
}

export function isTableChipBuyInRequest(r) {
  if (!r || typeof r !== 'object') return false;
  if (isClubWalletBuyInRequestRow(r)) return false;

  const tn = r.tableNumber ?? r.table_number;
  const tid = r.tableId ?? r.table_id;
  const sn = r.seatNumber ?? r.seat_number ?? r.seat;
  const numTable = tn != null && tn !== '' ? Number(tn) : NaN;
  const hasTableNum = Number.isFinite(numTable) && numTable > 0;
  const hasTableId = tid != null && String(tid).trim() !== '';
  const numSeat = sn != null && sn !== '' ? Number(sn) : NaN;
  const hasSeat = Number.isFinite(numSeat) && numSeat > 0;

  // Table chip buy-in = player seated at a concrete table. Club/cashier wallet requests
  // use the same endpoint but omit seat or use N/A — do not count them for table queues.
  return (hasTableNum || hasTableId) && hasSeat;
}

/**
 * Same rule as ClubBuyInCashOut.js "Pending Requests" tab (player buy-in queue at cashier).
 */
export function countPendingClubBuyInCashOutRequests(requests) {
  if (!Array.isArray(requests)) return 0;
  return requests.filter(
    (r) => String(r?.status ?? '').trim().toLowerCase() === 'pending'
  ).length;
}

/**
 * Same rules as TableBuyInView in TableManagement.js: poker waitlist entries awaiting a seat.
 */
export function countPendingPokerWaitlistEntries(entries) {
  if (!Array.isArray(entries)) return 0;
  return entries.filter((e) => {
    const st = String(e?.status ?? '').trim().toUpperCase();
    const isPending = st === 'PENDING';
    const game = String(e?.requestedGameType || '').toUpperCase();
    const isPokerSide = game !== 'RUMMY';
    return isPending && isPokerSide;
  }).length;
}

/**
 * Same rules as TableBuyInView in RummyTableManagement.js: waitlist entries awaiting a rummy seat.
 */
export function countPendingRummyWaitlistEntries(entries) {
  if (!Array.isArray(entries)) return 0;
  return entries.filter((e) => {
    const st = String(e?.status ?? '').trim().toUpperCase();
    const game = String(e?.requestedGameType || '').toUpperCase();
    return st === 'PENDING' && game === 'RUMMY';
  }).length;
}

function rowMatchesRummyTable(r, rummyTableNums, rummyTableIds) {
  const tt = String(
    r.tableType ?? r.gameType ?? r.requestedGameType ?? r.table_game_type ?? ''
  ).toUpperCase();
  if (tt === 'RUMMY' || tt.includes('RUMMY')) return true;
  const tn = Number(r.tableNumber ?? r.table_number);
  if (Number.isFinite(tn) && tn > 0 && rummyTableNums.has(tn)) return true;
  const tid = r.tableId ?? r.table_id;
  if (tid != null && String(tid).trim() !== '' && rummyTableIds.has(String(tid))) {
    return true;
  }
  return false;
}

/** Shared across hook instances so multiple sidebars only trigger one alert per club. */
const rummyBuyInOutAlertPrevByClub = new Map();

/**
 * Pending table buy-in workload = table chip buy-in API rows (not club wallet) + poker waitlist (PENDING).
 * Buy-out = buy-out requests API (typically table cash-out only).
 * Kept fresh via Socket.IO (useAdminRealtime) + periodic refetch.
 */
export function useTableBuyInOutPending(clubId, { enableAlertSound = false } = {}) {
  const prevBuyInCount = useRef(null);
  const prevBuyOutCount = useRef(null);

  const clubKey =
    clubId != null && String(clubId).trim() !== '' ? String(clubId).trim() : null;

  const { data: buyInRequests = [], isLoading: buyInLoading } = useQuery({
    queryKey: ['buyInRequests', clubKey],
    queryFn: () => clubsAPI.getBuyInRequests(clubKey),
    enabled: !!clubKey,
    staleTime: 0,
    refetchInterval: 12 * 1000,
    refetchOnReconnect: true,
  });

  const { data: buyOutRequests = [], isLoading: buyOutLoading } = useQuery({
    queryKey: ['buyOutRequests', clubKey],
    queryFn: () => clubsAPI.getBuyOutRequests(clubKey),
    enabled: !!clubKey,
    staleTime: 0,
    refetchInterval: 12 * 1000,
    refetchOnReconnect: true,
  });

  const { data: waitlistEntries = [], isLoading: waitlistLoading } = useQuery({
    queryKey: ['waitlist', clubKey],
    queryFn: () => waitlistAPI.getWaitlist(clubKey),
    enabled: !!clubKey,
    staleTime: 0,
    refetchInterval: 12 * 1000,
    refetchOnReconnect: true,
  });

  const pendingBuyInFromApi = useMemo(
    () =>
      (Array.isArray(buyInRequests) ? buyInRequests : []).filter(
        (row) => isPendingBuyInOutRequest(row) && isTableChipBuyInRequest(row)
      ),
    [buyInRequests]
  );
  const pendingBuyOut = useMemo(
    () => (Array.isArray(buyOutRequests) ? buyOutRequests : []).filter(isPendingBuyInOutRequest),
    [buyOutRequests]
  );

  const pendingBuyInWaitlistCount = useMemo(
    () => countPendingPokerWaitlistEntries(waitlistEntries),
    [waitlistEntries]
  );

  const pendingBuyInCount = pendingBuyInFromApi.length + pendingBuyInWaitlistCount;
  const pendingBuyOutCount = pendingBuyOut.length;

  const pendingBuyInTotal = useMemo(
    () => pendingBuyInFromApi.reduce((s, r) => s + Number(r.requestedAmount || 0), 0),
    [pendingBuyInFromApi]
  );

  const pendingBuyOutTotal = useMemo(
    () =>
      pendingBuyOut.reduce(
        (s, r) => s + Number(r.currentTableBalance ?? r.requestedAmount ?? 0),
        0
      ),
    [pendingBuyOut]
  );

  useEffect(() => {
    if (!enableAlertSound || !clubKey) return;

    const prevIn = prevBuyInCount.current;
    const prevOut = prevBuyOutCount.current;
    const buyInUp = prevIn !== null && pendingBuyInCount > prevIn;
    const buyOutUp = prevOut !== null && pendingBuyOutCount > prevOut;

    if (buyInUp || buyOutUp) {
      playTableBuyInOutAlert();
    }

    prevBuyInCount.current = pendingBuyInCount;
    prevBuyOutCount.current = pendingBuyOutCount;
  }, [enableAlertSound, clubKey, pendingBuyInCount, pendingBuyOutCount]);

  return {
    pendingBuyInCount,
    pendingBuyOutCount,
    pendingBuyInTotal,
    pendingBuyOutTotal,
    /** Table chip buy-in API only (excludes club wallet + waitlist). */
    pendingBuyInRequestCount: pendingBuyInFromApi.length,
    pendingBuyInWaitlistCount,
    /**
     * Use for the "Table Buy-In" tab badge only: that screen is waitlist-only; club wallet
     * buy-ins never appear there and must not light up the tab.
     */
    pendingBuyInTabBadgeCount: pendingBuyInWaitlistCount,
    buyInLoading: buyInLoading || waitlistLoading,
    buyOutLoading,
  };
}

/**
 * Rummy table buy-in / buy-out pending counts (waitlist + seated chip buy-ins on rummy tables + rummy buy-outs).
 * Uses query keys invalidated by useAdminRealtime (waitlist, buyin, buyout, tables).
 * @param {string|null|undefined} clubId
 * @param {{ enableAlertSound?: boolean, enabled?: boolean }} [options]
 */
export function useRummyTableBuyInOutPending(
  clubId,
  { enableAlertSound = false, enabled = true } = {}
) {
  const clubKey =
    clubId != null && String(clubId).trim() !== '' ? String(clubId).trim() : null;
  const run = !!clubKey && enabled;

  const { data: tablesData = [], isLoading: tablesLoading } = useQuery({
    queryKey: ['tables', clubKey],
    queryFn: () => tablesAPI.getTables(clubKey),
    enabled: run,
    staleTime: 0,
    refetchInterval: 12 * 1000,
    refetchOnReconnect: true,
  });

  const { data: buyInRequests = [], isLoading: buyInLoading } = useQuery({
    queryKey: ['buyInRequests', clubKey],
    queryFn: () => clubsAPI.getBuyInRequests(clubKey),
    enabled: run,
    staleTime: 0,
    refetchInterval: 12 * 1000,
    refetchOnReconnect: true,
  });

  const { data: buyOutRequests = [], isLoading: buyOutLoading } = useQuery({
    queryKey: ['buyOutRequests', clubKey],
    queryFn: () => clubsAPI.getBuyOutRequests(clubKey),
    enabled: run,
    staleTime: 0,
    refetchInterval: 12 * 1000,
    refetchOnReconnect: true,
  });

  const { data: waitlistEntries = [], isLoading: waitlistLoading } = useQuery({
    queryKey: ['waitlist', clubKey],
    queryFn: () => waitlistAPI.getWaitlist(clubKey),
    enabled: run,
    staleTime: 0,
    refetchInterval: 12 * 1000,
    refetchOnReconnect: true,
  });

  const { rummyTableNums, rummyTableIds } = useMemo(() => {
    const list = Array.isArray(tablesData) ? tablesData : [];
    const rummy = list.filter((t) => String(t.tableType || '').toUpperCase() === 'RUMMY');
    const nums = new Set();
    const ids = new Set();
    for (const t of rummy) {
      const n = Number(t.tableNumber);
      if (Number.isFinite(n) && n > 0) nums.add(n);
      if (t.id != null && String(t.id).trim() !== '') ids.add(String(t.id));
    }
    return { rummyTableNums: nums, rummyTableIds: ids };
  }, [tablesData]);

  const pendingRummyBuyInFromApi = useMemo(
    () =>
      (Array.isArray(buyInRequests) ? buyInRequests : []).filter(
        (row) =>
          isPendingBuyInOutRequest(row) &&
          isTableChipBuyInRequest(row) &&
          rowMatchesRummyTable(row, rummyTableNums, rummyTableIds)
      ),
    [buyInRequests, rummyTableNums, rummyTableIds]
  );

  const pendingRummyBuyOut = useMemo(
    () =>
      (Array.isArray(buyOutRequests) ? buyOutRequests : []).filter(
        (row) => isPendingBuyInOutRequest(row) && rowMatchesRummyTable(row, rummyTableNums, rummyTableIds)
      ),
    [buyOutRequests, rummyTableNums, rummyTableIds]
  );

  const pendingRummyBuyInWaitlistCount = useMemo(
    () => countPendingRummyWaitlistEntries(waitlistEntries),
    [waitlistEntries]
  );

  const pendingRummyBuyInRequestCount = pendingRummyBuyInFromApi.length;
  const pendingRummyBuyInCount = pendingRummyBuyInWaitlistCount + pendingRummyBuyInRequestCount;
  const pendingRummyBuyOutCount = pendingRummyBuyOut.length;

  const pendingRummyBuyOutTotal = useMemo(
    () =>
      pendingRummyBuyOut.reduce(
        (s, r) => s + Number(r.currentTableBalance ?? r.requestedAmount ?? 0),
        0
      ),
    [pendingRummyBuyOut]
  );

  /** Same as poker "Table Buy-In" tab badge: waitlist only. */
  const pendingRummyBuyInTabBadgeCount = pendingRummyBuyInWaitlistCount;

  /** Sidebar "Rummy" item: waitlist + table buy-out (matches poker Tables & Waitlist scope). */
  const pendingRummySidebarTotal = pendingRummyBuyInWaitlistCount + pendingRummyBuyOutCount;

  useEffect(() => {
    if (!enableAlertSound || !clubKey || !run) return;

    const prev = rummyBuyInOutAlertPrevByClub.get(clubKey) || { buyIn: null, buyOut: null };
    const buyInUp = prev.buyIn !== null && pendingRummyBuyInCount > prev.buyIn;
    const buyOutUp = prev.buyOut !== null && pendingRummyBuyOutCount > prev.buyOut;
    if (buyInUp || buyOutUp) {
      playTableBuyInOutAlert();
    }
    rummyBuyInOutAlertPrevByClub.set(clubKey, {
      buyIn: pendingRummyBuyInCount,
      buyOut: pendingRummyBuyOutCount,
    });
  }, [
    enableAlertSound,
    clubKey,
    run,
    pendingRummyBuyInCount,
    pendingRummyBuyOutCount,
  ]);

  return {
    pendingRummyBuyInCount,
    pendingRummyBuyOutCount,
    pendingRummyBuyOutTotal,
    pendingRummyBuyInRequestCount,
    pendingRummyBuyInWaitlistCount,
    pendingRummyBuyInTabBadgeCount,
    pendingRummySidebarTotal,
    buyInLoading: buyInLoading || waitlistLoading || tablesLoading,
    buyOutLoading: buyOutLoading || tablesLoading,
  };
}
