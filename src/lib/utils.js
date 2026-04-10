// Simple utility function to merge class names (cn = classnames)
export function cn(...classes) {
  return classes
    .filter(Boolean)
    .map(cls => {
      if (typeof cls === 'string') return cls;
      if (typeof cls === 'object' && cls !== null) {
        return Object.entries(cls)
          .filter(([_, condition]) => Boolean(condition))
          .map(([className]) => className)
          .join(' ');
      }
      return '';
    })
    .join(' ')
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * React Query refetch interval (ms) for pending player approvals and field-update queues.
 * Use when the API does not emit the dedicated Socket.IO events yet.
 * Set REACT_APP_PLAYER_MANAGEMENT_POLL_MS=0 to disable polling (sockets + manual refresh only).
 * Default: 15000.
 */
export function getPlayerManagementPollIntervalMs() {
  const raw = process.env.REACT_APP_PLAYER_MANAGEMENT_POLL_MS;
  if (raw === '0' || raw === 'false') return false;
  const n = Number(raw);
  if (Number.isFinite(n) && n > 0) return n;
  return 15000;
}

/**
 * Poll interval for pending leave approvals (sidebar + Leave Management approve tab).
 * REACT_APP_LEAVE_MANAGEMENT_POLL_MS=0 disables. Default: 15000.
 */
export function getLeaveManagementPollIntervalMs() {
  const raw = process.env.REACT_APP_LEAVE_MANAGEMENT_POLL_MS;
  if (raw === '0' || raw === 'false') return false;
  const n = Number(raw);
  if (Number.isFinite(n) && n > 0) return n;
  return 15000;
}

