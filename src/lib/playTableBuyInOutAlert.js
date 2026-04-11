/**
 * Alert for new table buy-in / buy-out requests.
 * Tries /audio/popup-alert.mp3 from public/; if missing or blocked, uses a short Web Audio beep.
 */
export function playTableBuyInOutAlert() {
  const base = (process.env.PUBLIC_URL || '').replace(/\/$/, '');
  const src = `${base}/audio/popup-alert.mp3`;
  const audio = new Audio(src);
  audio.volume = 0.45;
  const played = audio.play();
  if (played && typeof played.catch === 'function') {
    played.catch(() => playTableBuyInOutBeepFallback());
  }
}

function playTableBuyInOutBeepFallback() {
  try {
    const AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return;
    const ctx = new AC();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.frequency.value = 880;
    osc.type = 'sine';
    const t = ctx.currentTime;
    gain.gain.setValueAtTime(0.12, t);
    gain.gain.exponentialRampToValueAtTime(0.01, t + 0.18);
    osc.start(t);
    osc.stop(t + 0.18);
  } catch {
    /* ignore */
  }
}
