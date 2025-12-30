/**
 * Date and Time Utility Functions for IST (Indian Standard Time)
 * All dates/times in the application should use IST (UTC+5:30)
 */

// IST offset from UTC in milliseconds (5 hours 30 minutes)
const IST_OFFSET_MS = 5.5 * 60 * 60 * 1000;

/**
 * Convert UTC date to IST Date object
 * @param {Date|string} date - UTC date
 * @returns {Date} IST date
 */
export const toIST = (date) => {
  if (!date) return null;
  const utcDate = typeof date === 'string' ? new Date(date) : date;
  return new Date(utcDate.getTime() + IST_OFFSET_MS);
};

/**
 * Convert IST date to UTC Date object
 * @param {Date} date - IST date
 * @returns {Date} UTC date
 */
export const toUTC = (date) => {
  if (!date) return null;
  return new Date(date.getTime() - IST_OFFSET_MS);
};

/**
 * Format date in IST as DD/MM/YYYY
 * @param {Date|string} date - Date to format
 * @returns {string} Formatted date string
 */
export const formatDateIST = (date) => {
  if (!date) return '';
  const istDate = toIST(date);
  const day = String(istDate.getDate()).padStart(2, '0');
  const month = String(istDate.getMonth() + 1).padStart(2, '0');
  const year = istDate.getFullYear();
  return `${day}/${month}/${year}`;
};

/**
 * Format time in IST as HH:MM:SS (24-hour format)
 * @param {Date|string} date - Date to format
 * @returns {string} Formatted time string
 */
export const formatTimeIST = (date) => {
  if (!date) return '';
  const istDate = toIST(date);
  const hours = String(istDate.getHours()).padStart(2, '0');
  const minutes = String(istDate.getMinutes()).padStart(2, '0');
  const seconds = String(istDate.getSeconds()).padStart(2, '0');
  return `${hours}:${minutes}:${seconds}`;
};

/**
 * Format date and time in IST as DD/MM/YYYY HH:MM:SS
 * @param {Date|string} date - Date to format
 * @returns {string} Formatted date-time string
 */
export const formatDateTimeIST = (date) => {
  if (!date) return '';
  return `${formatDateIST(date)} ${formatTimeIST(date)}`;
};

/**
 * Format time in IST as HH:MM (without seconds)
 * @param {Date|string} date - Date to format
 * @returns {string} Formatted time string
 */
export const formatTimeShortIST = (date) => {
  if (!date) return '';
  const istDate = toIST(date);
  const hours = String(istDate.getHours()).padStart(2, '0');
  const minutes = String(istDate.getMinutes()).padStart(2, '0');
  return `${hours}:${minutes}`;
};

/**
 * Format date in IST as readable format (e.g., "15 Jan 2024")
 * @param {Date|string} date - Date to format
 * @returns {string} Formatted date string
 */
export const formatDateReadableIST = (date) => {
  if (!date) return '';
  const istDate = toIST(date);
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  return `${istDate.getDate()} ${months[istDate.getMonth()]} ${istDate.getFullYear()}`;
};

/**
 * Get current IST date
 * @returns {Date} Current IST date
 */
export const nowIST = () => {
  return toIST(new Date());
};

/**
 * Get current IST date as ISO string for input[type="date"]
 * @returns {string} YYYY-MM-DD format in IST
 */
export const todayISTString = () => {
  const now = nowIST();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

/**
 * Get current IST time as ISO string for input[type="datetime-local"]
 * @returns {string} YYYY-MM-DDTHH:MM format in IST
 */
export const nowISTString = () => {
  const now = nowIST();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  const hours = String(now.getHours()).padStart(2, '0');
  const minutes = String(now.getMinutes()).padStart(2, '0');
  return `${year}-${month}-${day}T${hours}:${minutes}`;
};

/**
 * Format date for display with relative time (e.g., "Today", "Yesterday", or date)
 * @param {Date|string} date - Date to format
 * @returns {string} Formatted date string
 */
export const formatRelativeDateIST = (date) => {
  if (!date) return '';
  const istDate = toIST(date);
  const today = nowIST();
  
  // Reset time to midnight for comparison
  const dateOnly = new Date(istDate.getFullYear(), istDate.getMonth(), istDate.getDate());
  const todayOnly = new Date(today.getFullYear(), today.getMonth(), today.getDate());
  
  const diffDays = Math.floor((todayOnly - dateOnly) / (1000 * 60 * 60 * 24));
  
  if (diffDays === 0) return 'Today';
  if (diffDays === 1) return 'Yesterday';
  if (diffDays < 7) return `${diffDays} days ago`;
  
  return formatDateIST(date);
};

/**
 * Convert date string to IST for datetime-local input
 * @param {Date|string} date - Date to convert
 * @returns {string} YYYY-MM-DDTHH:MM format in IST
 */
export const toDateTimeLocalIST = (date) => {
  if (!date) return '';
  const istDate = toIST(date);
  const year = istDate.getFullYear();
  const month = String(istDate.getMonth() + 1).padStart(2, '0');
  const day = String(istDate.getDate()).padStart(2, '0');
  const hours = String(istDate.getHours()).padStart(2, '0');
  const minutes = String(istDate.getMinutes()).padStart(2, '0');
  return `${year}-${month}-${day}T${hours}:${minutes}`;
};

/**
 * Convert date string to IST for date input
 * @param {Date|string} date - Date to convert
 * @returns {string} YYYY-MM-DD format in IST
 */
export const toDateIST = (date) => {
  if (!date) return '';
  const istDate = toIST(date);
  const year = istDate.getFullYear();
  const month = String(istDate.getMonth() + 1).padStart(2, '0');
  const day = String(istDate.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

