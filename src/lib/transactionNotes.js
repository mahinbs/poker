/** Matches " — request <uuid>" or " request <uuid>" in legacy credit seated notes */
const LEGACY_CREDIT_REQUEST_UUID =
  /\s*[—–-]\s*request\s+[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/gi;
const LEGACY_REQUEST_UUID = /\s+request\s+[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/gi;

/**
 * Human-readable transaction note/description (hides internal credit request ids).
 */
export function sanitizeTransactionNotesForDisplay(text) {
  if (text == null || typeof text !== 'string') return '';
  return text
    .replace(LEGACY_CREDIT_REQUEST_UUID, '')
    .replace(LEGACY_REQUEST_UUID, '')
    .replace(/\s{2,}/g, ' ')
    .trim();
}
