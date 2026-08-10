export function escapeHtml(value) {
  return String(value ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

export function short(address) {
  if (!address || address.length < 12) return String(address ?? '');
  return `${address.slice(0, 6)}…${address.slice(-4)}`;
}

export function fmtSol(value) {
  const n = Number(value);
  return Number.isFinite(n) ? n.toFixed(4) : '?';
}

export function fmtUsd(value) {
  const n = Number(value);
  if (!Number.isFinite(n)) return '?';
  if (n >= 1e6) return `$${(n / 1e6).toFixed(2)}M`;
  if (n >= 1e3) return `$${(n / 1e3).toFixed(1)}K`;
  return `$${n.toFixed(0)}`;
}

export function fmtPct(value) {
  const n = Number(value);
  return Number.isFinite(n) ? `${n.toFixed(1)}%` : '?';
}

export function fmtPnl(value) {
  const n = Number(value);
  if (!Number.isFinite(n) || n === 0) return { icon: '⚪', text: '0.0%' };
  if (n > 0) return { icon: '🟢', text: `+${n.toFixed(1)}%` };
  return { icon: '🔴', text: `${n.toFixed(1)}%` };
}

export function progressBar(value, width = 10) {
  const n = Math.max(0, Math.min(100, Number(value) || 0));
  const filled = Math.round((n / 100) * width);
  return '▓'.repeat(filled) + '░'.repeat(width - filled);
}

export function divider() {
  return '━━━━━━━━━━━━━━━━━━';
}

export function lightDivider() {
  return '───────────────────';
}

export function gmgnLink(mint) {
  return `https://gmgn.ai/sol/token/${mint}`;
}

export function txLink(signature) {
  return `https://solscan.io/tx/${signature}`;
}

export function accountLink(address) {
  return `https://solscan.io/account/${address}`;
}
