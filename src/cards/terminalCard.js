// Terminal-style PnL card rendered to PNG via sharp (no browser, no canvas).
// Mirrors the retro green-on-black CRT aesthetic the operator picked.
import sharp from 'sharp';

const W = 800;
const H = 800;
const PAD = 48;
const BG = '#0a0f0a';
const FG = '#22ff55';
const DIM = '#1a8a33';
const BORDER = '#1a8a33';

function esc(s) {
  return String(s ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

function fmtUsd(v) {
  const n = Number(v);
  if (!Number.isFinite(n)) return '$?';
  if (n >= 1e6) return `$${(n / 1e6).toFixed(2)}M`;
  if (n >= 1e3) return `$${(n / 1e3).toFixed(1)}K`;
  return `$${n.toFixed(0)}`;
}

// Convert a value to a terminal "line" (uppercase-ish, monospace feel is handled by font)
export function buildTerminalSvg(position) {
  const pnl = Number(position.pnl_percent ?? position.pnlPercent ?? 0);
  const pnlText = `${pnl >= 0 ? '+' : ''}${pnl.toFixed(1)}%`;
  const pnlColor = pnl >= 0 ? FG : '#ff5555';
  const status = position.status === 'closed' ? 'CLOSED' : 'OPEN';
  const mode = String(position.execution_mode || 'dry_run').toUpperCase();
  const strat = String(position.strategy_id || 'akashi_zone').toUpperCase();
  const symbol = esc(String(position.symbol || 'TOKEN'));
  const size = Number(position.size_sol ?? 0);
  const entry = fmtUsd(position.entry_mcap);
  const current = fmtUsd(position.mcap || position.high_water_mcap || position.entry_mcap);

  const lines = [
    `$ CHARON v1.0`,
    `$ token: ${symbol}`,
    `$ strat: ${strat}`,
    `$ mode: ${mode}`,
    `$ size: ${size.toFixed(4)} SOL`,
    `$ entry: ${entry}`,
    `$ now:   ${current}`,
    `$ pnl:   ${pnlText}`,
    `$ status: ${status}`,
  ];
  const lineH = 34;
  const topY = 160;
  const textX = 70;

  let svg = `<svg width="${W}" height="${H}" xmlns="http://www.w3.org/2000/svg">`;
  svg += `<rect width="${W}" height="${H}" fill="${BG}"/>`;
  svg += `<rect x="${PAD - 8}" y="${PAD - 8}" width="${W - 2 * (PAD - 8)}" height="${H - 2 * (PAD - 8)}" fill="none" stroke="${BORDER}" stroke-width="2" rx="6"/>`;

  lines.forEach((line, i) => {
    const y = topY + i * lineH;
    const isHeader = i === 0;
    const isPnl = i === 7;
    const color = isPnl ? pnlColor : isHeader ? '#33ff77' : FG;
    const weight = isHeader || isPnl ? 700 : 400;
    const sizePx = isPnl ? 40 : isHeader ? 26 : 24;
    const text = isPnl ? pnlText : line;
    svg += `<text x="${textX}" y="${y}" font-family="monospace" font-size="${sizePx}" font-weight="${weight}" fill="${color}">${esc(text)}</text>`;
  });

  // Big PnL centered lower
  svg += `<text x="${W / 2}" y="${H - 150}" text-anchor="middle" font-family="monospace" font-size="110" font-weight="800" fill="${pnlColor}" opacity="0.95">${esc(pnlText)}</text>`;
  // status line with cursor block
  svg += `<text x="${W / 2}" y="${H - 80}" text-anchor="middle" font-family="monospace" font-size="22" fill="${DIM}">[ ${esc(status)} ]</text>`;
  svg += `<rect x="${W / 2 + 92}" y="${H - 96}" width="14" height="24" fill="${FG}"/>`;

  svg += `</svg>`;
  return svg;
}

export async function renderTerminalCard(position) {
  const svg = buildTerminalSvg(position);
  return sharp(Buffer.from(svg)).png().toBuffer();
}
