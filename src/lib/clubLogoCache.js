/**
 * Synchronous cache for club logo URLs.
 *
 * Reads from localStorage so the URL is available on the first render of any
 * component — no fetch flash, no spade fallback flicker. Update after each
 * successful club fetch.
 */
const STORAGE_KEY = 'clubLogoCache';

const readCache = () => {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}');
  } catch {
    return {};
  }
};

const writeCache = (cache) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(cache));
  } catch {
    // localStorage unavailable / quota — best-effort, ignore.
  }
};

export const getCachedClubLogo = (clubId) => {
  if (!clubId) return null;
  return readCache()[clubId] || null;
};

export const setCachedClubLogo = (clubId, logoUrl) => {
  if (!clubId) return;
  const cache = readCache();
  if (logoUrl) {
    cache[clubId] = logoUrl;
  } else {
    delete cache[clubId];
  }
  writeCache(cache);
};
