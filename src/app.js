import { setDefaultResultOrder } from 'node:dns';
import { APP_NAME, SIGNAL_SERVER_URL, SIGNAL_POLL_MS, GRADUATED_POLL_MS, TRENDING_POLL_MS, POSITION_CHECK_MS, validateConfig } from './config.js';
import { initDb, db } from './db/connection.js';
import { pruneExpiredCache } from './db/decisions.js';
import { numSetting } from './db/settings.js';
import { initLiveExecution } from './liveExecutor.js';
import { setupTelegram } from './telegram/commands.js';
import { monitorPositions } from './execution/positions.js';
import { processCandidateFromSignals, maybeProcessDegenCandidate } from './pipeline/orchestrator.js';
import { sendTelegram } from './telegram/send.js';
import { makeFailureTracker } from './utils.js';

setDefaultResultOrder('ipv4first');
validateConfig();

// On startup, drop screening state from previous runs so no stale candidates
// or pending intents can trigger buys after a restart. Open positions survive.
export function resetScreeningState() {
  const nowMs = Date.now();
  const maxAge = Number(process.env.LLM_CANDIDATE_MAX_AGE_MS || 10 * 60 * 1000);
  const cutoff = nowMs - Math.max(30_000, maxAge);
  const staleCandidates = db.prepare(`
    DELETE FROM candidates
    WHERE status IN ('candidate', 'watch', 'pass')
      AND created_at_ms < ?
  `).run(cutoff);
  const staleIntents = db.prepare(`
    DELETE FROM trade_intents
    WHERE status = 'pending'
      AND created_at_ms < ?
  `).run(cutoff);
  console.log(`[bot] reset screening state: removed ${staleCandidates.changes} stale candidates, ${staleIntents.changes} stale intents (fresh start)`);
}

export async function startCharon() {
  initDb();
  resetScreeningState();
  initLiveExecution();
  setupTelegram();

  if (SIGNAL_SERVER_URL) {
    // ── Server mode: fetch signals from signal server ──────────────────────
    const { fetchServerSignals, setCandidateHandler, setDegenHandler } = await import('./signals/serverClient.js');

    setCandidateHandler(processCandidateFromSignals);
    setDegenHandler(maybeProcessDegenCandidate);

    const alert = (msg) => sendTelegram(msg);
    const trackServer = makeFailureTracker('server signals', alert);
    const trackDip = makeFailureTracker('dip monitor', alert);

    await fetchServerSignals().catch(error => console.log(`[server] initial fetch failed: ${error.message}`));
    const signalPollMs = Math.max(30_000, numSetting('signal_poll_ms', SIGNAL_POLL_MS));
    setInterval(() => trackServer(() => fetchServerSignals()), signalPollMs);
    console.log(`[bot] signal poll interval: ${Math.round(signalPollMs / 1000)}s`);

    // Price monitor for dip buy strategy
    const { monitorPriceAlerts, cleanupAlerts } = await import('./signals/priceMonitor.js');
    const { setCandidateHandler: setAlertHandler } = await import('./signals/priceMonitor.js');
    setAlertHandler(processCandidateFromSignals);
    setInterval(() => trackDip(() => monitorPriceAlerts()), 10_000);
    setInterval(() => cleanupAlerts(), 60 * 60 * 1000);
    setInterval(() => { const n = pruneExpiredCache(); if (n > 0) console.log(`[cache] pruned ${n} expired decision_cache entries`); }, 30 * 60 * 1000);

    console.log(`[bot] ${APP_NAME} started (server mode: ${SIGNAL_SERVER_URL})`);
  } else {
    // ── Standalone mode: direct polling (legacy) ───────────────────────────
    const { fetchGraduatedCoins } = await import('./signals/graduated.js');
    const { fetchGmgnTrending, setDegenHandler } = await import('./signals/trending.js');
    const { startWebsocket, setCandidateHandler } = await import('./signals/feeClaim.js');

    setDegenHandler(maybeProcessDegenCandidate);
    setCandidateHandler(processCandidateFromSignals);

    await fetchGraduatedCoins().catch(error => console.log(`[graduated] initial fetch failed: ${error.message}`));
    await fetchGmgnTrending().catch(error => console.log(`[trending] initial fetch failed: ${error.message}`));

    setInterval(() => fetchGraduatedCoins().catch(error => console.log(`[graduated] ${error.message}`)), GRADUATED_POLL_MS);
    setInterval(() => fetchGmgnTrending().catch(error => console.log(`[trending] ${error.message}`)), TRENDING_POLL_MS);
    startWebsocket();

    console.log(`[bot] ${APP_NAME} started (standalone mode)`);
  }

  // Position monitoring runs in both modes
  const trackPositions = makeFailureTracker('position monitor', (msg) => sendTelegram(msg));
  setInterval(() => trackPositions(() => monitorPositions()), POSITION_CHECK_MS);
}
