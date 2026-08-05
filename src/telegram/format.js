import { escapeHtml, fmtPct, fmtPnl, fmtSol, fmtUsd, short, gmgnLink, txLink, accountLink, divider, lightDivider, progressBar } from '../format.js';

const ROUTE_ICONS = {
  fees: '💸',
  graduated: '🎓',
  trending: '📈',
  smart_money: '🧠',
  akashi_zone: '⚡',
  dip_buy: '📉',
};

export function formatRecipients(shareholders) {
  if (!shareholders?.length) return '';
  return shareholders.slice(0, 5).map((holder, index) => {
    const pct = holder.bps != null ? ` (${fmtPct(holder.bps / 100)})` : '';
    const label = shareholders.length > 1 ? `Recipient ${index + 1}` : 'Recipient';
    return `${label}: <a href="${accountLink(holder.pubkey)}">${short(holder.pubkey)}</a>${pct}`;
  }).join('\n') + '\n';
}

export function signalLabel(signals = {}) {
  const parts = [
    signals.hasFeeClaim ? `${ROUTE_ICONS.fees} fees` : null,
    signals.hasGraduated ? `${ROUTE_ICONS.graduated} graduated` : null,
    signals.hasTrending ? `${ROUTE_ICONS.trending} trending` : null,
  ].filter(Boolean);
  return parts.join(' + ') || signals.route || 'unknown';
}

function routeIcon(route) {
  return ROUTE_ICONS[route] || '🔎';
}

function verdictTag(decision) {
  if (!decision) return null;
  const map = {
    BUY: { icon: '✅', color: '🟢' },
    WATCH: { icon: '👀', color: '⚪' },
    SKIP: { icon: '⛔', color: '🔴' },
    PASS: { icon: '⛔', color: '🔴' },
    REJECT: { icon: '⛔', color: '🔴' },
  };
  const tag = map[decision.verdict] || { icon: '❔', color: '⚪' };
  return `${tag.icon} ${tag.color} <b>${escapeHtml(decision.verdict)}</b> ${fmtPct(decision.confidence)}`;
}

export function candidateSummary(candidate, decision = null) {
  const chartWindow = candidate.chart?.windows?.find(row => row.label === 'ath_context_24h_5m' && row.available)
    || candidate.chart?.windows?.find(row => row.label === 'recent_24h_5m' && row.available);
  const route = candidate.signals?.label || signalLabel(candidate.signals);
  const icon = routeIcon(candidate.signals?.route);
  const tokenName = candidate.token.name || candidate.token.symbol || 'Unknown';
  const tokenSym = candidate.token.symbol && candidate.token.name
    ? ` (${escapeHtml(candidate.token.symbol)})` : '';
  const sections = [];
  sections.push(`🛶 <b>CHARON · CANDIDATE</b>`);
  sections.push(divider());
  sections.push(`${icon} <b>Signal:</b> ${escapeHtml(route)}`);
  sections.push(`🪙 <b>${escapeHtml(tokenName)}</b>${tokenSym}`);
  sections.push(`🔗 <a href="${gmgnLink(candidate.token.mint)}">${short(candidate.token.mint)}</a>`);
  sections.push(`<code>${escapeHtml(candidate.token.mint)}</code>`);
  sections.push(lightDivider());
  sections.push([
    `💰 Mcap: ${fmtUsd(candidate.metrics.marketCapUsd)}`,
    `💧 Liq: ${fmtUsd(candidate.metrics.liquidityUsd)}`,
    `💸 Fees: ${fmtSol(candidate.metrics.gmgnTotalFeesSol)} SOL`,
    `🎓 Grad vol: ${fmtUsd(candidate.metrics.graduatedVolumeUsd)}`,
  ].join('  '));
  sections.push([
    `👥 Holders: ${candidate.metrics.holderCount || '?'}`,
    `📊 Top20: ${fmtPct(candidate.holders.top20Percent)}`,
    `🔝 Max holder: ${fmtPct(candidate.holders.maxHolderPercent)}`,
    `👛 Saved: ${candidate.savedWalletExposure.holderCount}/${candidate.savedWalletExposure.checked}`,
  ].join('  '));
  if (candidate.trending) {
    sections.push(lightDivider());
    sections.push([
      `📈 Trending: #${candidate.trending.rank || '?'}/${escapeHtml(candidate.trending.interval || '')}`,
      `Vol: ${fmtUsd(candidate.metrics.trendingVolumeUsd)}`,
      `Swaps: ${candidate.metrics.trendingSwaps || 0}`,
      `🔥 Hot: ${candidate.metrics.trendingHotLevel || 0}`,
      `🧠 Smart: ${candidate.metrics.trendingSmartDegenCount || 0}`,
    ].join('  '));
  }
  if (chartWindow) {
    sections.push([
      `⛰ ATH ctx: ${fmtPct(chartWindow.belowHighPercent)} from 24h high`,
      `Bottom: ${fmtPct(chartWindow.aboveLowPercent)}`,
      `Blast risk: ${candidate.chart.topBlastRisk ? '⚠️ yes' : '✅ no'}`,
    ].join('  '));
  }
  if (candidate.twitterNarrative?.metrics) {
    sections.push([
      `🐦 ${candidate.twitterNarrative.metrics.likes} likes`,
      `${candidate.twitterNarrative.metrics.retweets} RT`,
      `${candidate.twitterNarrative.metrics.replies} replies`,
      `${candidate.twitterNarrative.metrics.quotes} quotes`,
    ].join('  '));
  }
  if (candidate.feeClaim) sections.push(`💸 Fee claim: <b>${fmtSol(candidate.feeClaim.distributedSol)} SOL</b>`);
  if (candidate.twitterNarrative?.text) sections.push(`📰 Narrative: ${escapeHtml(candidate.twitterNarrative.text.slice(0, 220))}`);
  if (!candidate.filters.passed) sections.push(`⛔ Filtered: ${escapeHtml(candidate.filters.failures.join('; '))}`);
  if (decision) {
    sections.push(divider());
    sections.push(verdictTag(decision));
    if (decision.reason) sections.push(`💭 ${escapeHtml(decision.reason.slice(0, 300))}`);
  }
  return sections.filter(Boolean).join('\n');
}

export function compactCandidateLine(row, index = null) {
  const candidate = row.candidate;
  const prefix = index == null ? '' : `${index}. `;
  const name = candidate.token?.symbol || candidate.token?.name || short(candidate.token?.mint || '');
  const signal = candidate.signals?.label || signalLabel(candidate.signals);
  const icon = routeIcon(candidate.signals?.route);
  return [
    `${prefix}🪙 <b>${escapeHtml(name)}</b>`,
    `<a href="${gmgnLink(candidate.token.mint)}">${short(candidate.token.mint)}</a>`,
    `${icon} ${escapeHtml(signal)}`,
    `💰 ${fmtUsd(candidate.metrics?.marketCapUsd)}`,
    `💧 ${fmtUsd(candidate.metrics?.liquidityUsd)}`,
    candidate.feeClaim ? `💸 ${fmtSol(candidate.feeClaim.distributedSol)} SOL` : null,
  ].filter(Boolean).join('  ');
}

export function batchRevealSummary(batchId, rows, decision, triggerCandidateId = null) {
  const selected = rows.find(row => row.id === Number(decision.selected_candidate_id));
  const trigger = rows.find(row => row.id === Number(triggerCandidateId));
  const lines = [
    '🧭 <b>CHARON · SCREENING</b>',
    divider(),
    `📦 Batch: <b>#${batchId}</b> · 🔍 Screened: <b>${rows.length}</b>`,
    trigger ? `⚡ Trigger: ${compactCandidateLine(trigger)}` : null,
    selected ? `🎯 Pick: ${compactCandidateLine(selected)}` : '🎯 Pick: <b>none</b>',
    divider(),
    `🤖 Decision: <b>${escapeHtml(decision.verdict || 'WATCH')}</b> ${fmtPct(decision.confidence || 0)}`,
    decision.reason ? `💭 ${escapeHtml(String(decision.reason).slice(0, 420))}` : null,
  ];
  return lines.filter(Boolean).join('\n');
}

export function formatPosition(position) {
  const pnl = position.pnl_percent != null
    ? Number(position.pnl_percent)
    : position.entry_mcap && position.high_water_mcap
      ? (Number(position.high_water_mcap) / Number(position.entry_mcap) - 1) * 100
      : 0;
  const pnlTag = fmtPnl(pnl);
  return [
    `📍 <b>${escapeHtml(position.symbol || short(position.mint))}</b> #${position.id}`,
    divider(),
    `🔗 <a href="${gmgnLink(position.mint)}">${short(position.mint)}</a>`,
    `📊 Status: <b>${escapeHtml(position.status)}</b> · 🎛 Mode: <b>${escapeHtml(position.execution_mode || 'dry_run')}</b> · 🎯 Strategy: <b>${escapeHtml(position.strategy_id || 'dip_buy')}</b>`,
    position.entry_signature ? `➡️ Entry TX: <a href="${txLink(position.entry_signature)}">${short(position.entry_signature)}</a>` : null,
    `💰 Entry mcap: ${fmtUsd(position.entry_mcap)} · ⛰ High: ${fmtUsd(position.high_water_mcap)}`,
    `💵 Size: ${fmtSol(position.size_sol)} SOL · ${pnlTag.icon} PnL: <b>${pnlTag.text}</b>`,
    `🎯 TP: ${fmtPct(position.tp_percent)} · 🛑 SL: ${fmtPct(position.sl_percent)} · 📉 Trail: ${position.trailing_enabled ? `${fmtPct(position.trailing_percent)}` : 'off'}`,
    position.exit_reason ? `🚪 Exit: ${escapeHtml(position.exit_reason)} at ${fmtUsd(position.exit_mcap)} (${fmtPct(position.pnl_percent)})` : null,
    position.exit_signature ? `⬅️ Exit TX: <a href="${txLink(position.exit_signature)}">${short(position.exit_signature)}</a>` : null,
  ].filter(Boolean).join('\n');
}

export function compactDecisionCandidate(row) {
  if (!row) return null;
  const c = row.candidate;
  return {
    candidateId: row.id,
    mint: c.token?.mint,
    route: c.signals?.route,
    signals: c.signals,
    token: c.token,
    metrics: c.metrics,
    feeClaim: c.feeClaim,
    trending: c.trending,
    jupiterAsset: c.jupiterAsset ? {
      liquidity: c.jupiterAsset.liquidity,
      mcap: c.jupiterAsset.mcap,
      fdv: c.jupiterAsset.fdv,
      usdPrice: c.jupiterAsset.usdPrice,
      fees: c.jupiterAsset.fees,
      holderCount: c.jupiterAsset.holderCount,
      audit: c.jupiterAsset.audit,
      stats1h: c.jupiterAsset.stats1h,
      stats24h: c.jupiterAsset.stats24h,
    } : null,
    holders: {
      count: c.holders?.count,
      top20Percent: c.holders?.top20Percent,
      maxHolderPercent: c.holders?.maxHolderPercent,
      top20: c.holders?.top20,
    },
    chart: c.chart,
    savedWalletExposure: c.savedWalletExposure,
    twitterNarrative: c.twitterNarrative,
    filters: c.filters,
    createdAtMs: c.createdAtMs,
  };
}
