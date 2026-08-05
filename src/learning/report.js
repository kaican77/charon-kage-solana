import { escapeHtml, fmtPct, fmtSol, fmtPnl, divider } from '../format.js';
import { formatWindow } from '../utils.js';

export function learningReportText(runId, summary, lessons) {
  const pnl = fmtPnl(summary.positions.avgPnlPercent || 0);
  return [
    '🧠 <b>CHARON · LEARNING</b>',
    divider(),
    `📦 Run: <b>#${runId}</b> · ⏱ Window: <b>${formatWindow(summary.windowMs)}</b>`,
    `🔒 Closed: ${summary.positions.closed}/${summary.positions.opened} · 🎯 Win rate: ${fmtPct(summary.positions.winRate)}`,
    `${pnl.icon} Avg PnL: <b>${pnl.text}</b> · 💵 Total: ${fmtSol(summary.positions.totalPnlSol)} SOL`,
    summary.positions.byRoute?.length ? `🏆 Best route: <b>${escapeHtml(summary.positions.byRoute[0].route)}</b> avg ${fmtPct(summary.positions.byRoute[0].avgPnlPercent)} (${summary.positions.byRoute[0].count})` : null,
    divider(),
    '💡 <b>Lessons</b>',
    ...lessons.map((item, index) => `${index + 1}. ${escapeHtml(item.lesson)}`),
  ].filter(Boolean).join('\n');
}
