import { useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { fnbAPI } from '../lib/api';

/** Last known count per club — shared so multiple hook instances only trigger one alert sound. */
const pendingFnbPrevByClub = new Map();

function extractPendingTotal(res) {
  if (res == null) return 0;
  if (typeof res.total === 'number') return res.total;
  if (typeof res.totalCount === 'number') return res.totalCount;
  if (Array.isArray(res.orders)) {
    return res.orders.length;
  }
  if (Array.isArray(res)) return res.length;
  return 0;
}

/**
 * Pending FNB orders (status=pending) for badges + realtime via useAdminRealtime invalidation.
 * @param {string|null|undefined} clubId
 * @param {{ enableAlertSound?: boolean }} [options]
 */
export function useFnbPendingOrdersCount(clubId, { enableAlertSound = false } = {}) {
  const clubKey =
    clubId != null && String(clubId).trim() !== '' ? String(clubId).trim() : null;

  const query = useQuery({
    queryKey: ['fnbOrders', clubKey, 'pendingCount'],
    queryFn: async () => {
      const res = await fnbAPI.getOrders(clubKey, 'pending', 1, 1);
      return extractPendingTotal(res);
    },
    enabled: !!clubKey,
    staleTime: 0,
    refetchInterval: 15 * 1000,
    refetchOnReconnect: true,
  });

  const pendingCount = query.data ?? 0;

  useEffect(() => {
    if (!enableAlertSound || !clubKey) return;
    const prev = pendingFnbPrevByClub.get(clubKey);
    if (prev !== undefined && pendingCount > prev) {
      const audio = new Audio('/audio/popup-alert.mp3');
      audio.volume = 0.5;
      audio.play().catch(() => {});
    }
    pendingFnbPrevByClub.set(clubKey, pendingCount);
  }, [clubKey, pendingCount, enableAlertSound]);

  return { pendingCount, isLoading: query.isLoading };
}
