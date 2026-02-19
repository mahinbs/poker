/**
 * Date and Time Utility Functions for IST (Indian Standard Time)
 * All dates/times in the application use IST via Intl timeZone: 'Asia/Kolkata'
 */

const IST_TZ = 'Asia/Kolkata';

/**
 * Format date in IST as "18 Feb 2026"
 */
export const formatDateIST = (date) => {
  if (!date) return '';
  return new Date(date).toLocaleDateString('en-IN', {
    timeZone: IST_TZ, day: '2-digit', month: 'short', year: 'numeric',
  });
};

/**
 * Format time in IST as "11:30 pm"
 */
export const formatTimeIST = (date) => {
  if (!date) return '';
  return new Date(date).toLocaleTimeString('en-IN', {
    timeZone: IST_TZ, hour: '2-digit', minute: '2-digit', hour12: true,
  });
};

/**
 * Format date+time in IST as "18 Feb 2026, 11:30 pm"
 */
export const formatDateTimeIST = (date) => {
  if (!date) return '';
  return new Date(date).toLocaleString('en-IN', {
    timeZone: IST_TZ, day: '2-digit', month: 'short', year: 'numeric',
    hour: '2-digit', minute: '2-digit', hour12: true,
  });
};

/**
 * Format date in IST as "DD/MM/YYYY"
 */
export const formatDateSlashIST = (date) => {
  if (!date) return '';
  return new Date(date).toLocaleDateString('en-IN', {
    timeZone: IST_TZ, day: '2-digit', month: '2-digit', year: 'numeric',
  });
};

/**
 * Format time short in IST as "11:30"
 */
export const formatTimeShortIST = (date) => {
  if (!date) return '';
  return new Date(date).toLocaleTimeString('en-IN', {
    timeZone: IST_TZ, hour: '2-digit', minute: '2-digit', hour12: false,
  });
};

/**
 * Format as "medium" style "18 Feb 2026, 11:30:45 pm"
 */
export const formatFullIST = (date) => {
  if (!date) return '';
  return new Date(date).toLocaleString('en-IN', {
    timeZone: IST_TZ, dateStyle: 'medium', timeStyle: 'medium',
  });
};

/**
 * Format just the date as DD/MM/YYYY for en-GB style
 */
export const formatDateGB_IST = (date) => {
  if (!date) return '';
  return new Date(date).toLocaleDateString('en-GB', {
    timeZone: IST_TZ, day: '2-digit', month: '2-digit', year: 'numeric',
  });
};

/**
 * Alias for formatDateIST (backward compat)
 */
export const formatDateReadableIST = formatDateIST;

/**
 * Get any toLocaleString with IST forced
 */
export const toLocaleIST = (date, locale = 'en-IN', options = {}) => {
  if (!date) return '';
  return new Date(date).toLocaleString(locale, { timeZone: IST_TZ, ...options });
};

/**
 * Get any toLocaleDateString with IST forced
 */
export const toLocaleDateIST = (date, locale = 'en-IN', options = {}) => {
  if (!date) return '';
  return new Date(date).toLocaleDateString(locale, { timeZone: IST_TZ, ...options });
};

/**
 * Get any toLocaleTimeString with IST forced
 */
export const toLocaleTimeIST = (date, locale = 'en-IN', options = {}) => {
  if (!date) return '';
  return new Date(date).toLocaleTimeString(locale, { timeZone: IST_TZ, ...options });
};

/**
 * Get current date in IST as YYYY-MM-DD for date inputs
 */
export const todayISTString = () => {
  const parts = new Intl.DateTimeFormat('en-CA', { timeZone: IST_TZ }).formatToParts(new Date());
  const get = (type) => parts.find(p => p.type === type)?.value || '';
  return `${get('year')}-${get('month')}-${get('day')}`;
};

/**
 * Get current IST datetime as YYYY-MM-DDTHH:MM for datetime-local inputs
 */
export const nowISTString = () => {
  const d = new Date();
  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone: IST_TZ, year: 'numeric', month: '2-digit', day: '2-digit',
    hour: '2-digit', minute: '2-digit', hour12: false,
  }).formatToParts(d);
  const get = (type) => parts.find(p => p.type === type)?.value || '';
  return `${get('year')}-${get('month')}-${get('day')}T${get('hour')}:${get('minute')}`;
};

/**
 * Convert a date to IST datetime-local input value
 */
export const toDateTimeLocalIST = (date) => {
  if (!date) return '';
  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone: IST_TZ, year: 'numeric', month: '2-digit', day: '2-digit',
    hour: '2-digit', minute: '2-digit', hour12: false,
  }).formatToParts(new Date(date));
  const get = (type) => parts.find(p => p.type === type)?.value || '';
  return `${get('year')}-${get('month')}-${get('day')}T${get('hour')}:${get('minute')}`;
};

/**
 * Convert a date to IST date input value (YYYY-MM-DD)
 */
export const toDateIST = (date) => {
  if (!date) return '';
  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone: IST_TZ, year: 'numeric', month: '2-digit', day: '2-digit',
  }).formatToParts(new Date(date));
  const get = (type) => parts.find(p => p.type === type)?.value || '';
  return `${get('year')}-${get('month')}-${get('day')}`;
};
