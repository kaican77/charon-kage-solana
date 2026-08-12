import { db } from './connection.js';

export function setting(key, fallback = '') {
  return db.prepare('SELECT value FROM settings WHERE key = ?').get(key)?.value ?? fallback;
}

export function setSetting(key, value) {
  db.prepare(`
    INSERT INTO settings (key, value) VALUES (?, ?)
    ON CONFLICT(key) DO UPDATE SET value = excluded.value
  `).run(key, String(value));
}

export function boolSetting(key, fallback = false) {
  const value = setting(key, fallback ? 'true' : 'false');
  return value === 'true' || value === '1' || value === 'yes';
}

export function numSetting(key, fallback = 0) {
  const value = Number(setting(key, String(fallback)));
  return Number.isFinite(value) ? value : fallback;
}

const strategyCache = { id: null, config: null, at: 0 };

export function activeStrategy() {
  if (strategyCache.config && Date.now() - strategyCache.at < 5000) return strategyCache.config;
  const row = db.prepare('SELECT * FROM strategies WHERE enabled = 1 LIMIT 1').get();
  if (!row) {
    const fallback = strategyById('smart_money');
    if (fallback) return fallback;
    return defaultStrategy();
  }
  const cfg = JSON.parse(row.config_json);
  delete cfg.enabled;
  strategyCache.id = row.id;
  strategyCache.config = { id: row.id, name: row.name, ...cfg };
  strategyCache.at = Date.now();
  return strategyCache.config;
}

export function strategyById(id) {
  const row = db.prepare('SELECT * FROM strategies WHERE id = ?').get(id);
  if (!row) return null;
  const cfg = JSON.parse(row.config_json);
  delete cfg.enabled;
  return { id: row.id, name: row.name, ...cfg };
}

export function allStrategies() {
  return db.prepare('SELECT * FROM strategies ORDER BY id').all().map(row => {
    const cfg = JSON.parse(row.config_json);
    // Delete any stale `enabled` key from config_json — the column is the
    // source of truth for `enabled`. Stale config keys (left over from older
    // code that did `{ ...strategyById(id), ...newFields }`) used to shadow
    // the column and produce wrong values in the Telegram menu.
    delete cfg.enabled;
    return {
      id: row.id,
      name: row.name,
      enabled: Boolean(row.enabled),
      ...cfg,
    };
  });
}

export function setActiveStrategy(id) {
  db.prepare('UPDATE strategies SET enabled = 0').run();
  db.prepare('UPDATE strategies SET enabled = 1 WHERE id = ?').run(id);
  strategyCache.config = null;
  strategyCache.at = 0;
}

export function updateStrategyConfig(id, config) {
  // Defensive: config MUST be a plain object. A string/number/array spread
  // into `{ ...clean }` silently corrupts config_json (e.g. {"0":"t","1":"r"}).
  // Refuse invalid input instead of writing garbage to the DB.
  if (!config || typeof config !== 'object' || Array.isArray(config)) {
    throw new Error(`updateStrategyConfig(${id}): config must be a plain object, got ${typeof config}`);
  }
  // Strip `enabled` if it leaked in — column is the source of truth.
  const { enabled: _ignored, ...clean } = config;
  db.prepare('UPDATE strategies SET config_json = ? WHERE id = ?').run(JSON.stringify(clean), id);
  if (strategyCache.id === id) {
    strategyCache.config = null;
    strategyCache.at = 0;
  }
  // Live-sync position size to open positions of this strategy (size is a snapshot at entry;
  // user expects inline size edits to apply to running positions too).
  if (Number.isFinite(Number(config.position_size_sol)) && Number(config.position_size_sol) > 0) {
    db.prepare('UPDATE dry_run_positions SET size_sol = ? WHERE strategy_id = ? AND status = \'open\'').run(Number(config.position_size_sol), id);
  }
}

export function strategySetting(key, fallback) {
  const strat = activeStrategy();
  if (strat[key] !== undefined && strat[key] !== null) return strat[key];
  return numSetting(key, fallback);
}

export function bankrollSol() {
  return numSetting('bankroll_sol', 0.5);
}

export function addBankroll(amount) {
  const next = Math.max(0, bankrollSol() + Number(amount));
  setSetting('bankroll_sol', next.toFixed(4));
  return next;
}

export function resetBankroll(defaultSol = 0.5) {
  setSetting('bankroll_sol', defaultSol.toFixed(4));
  return defaultSol;
}

function defaultStrategy() {
  return {
    id: 'smart_money', name: 'Smart Money',
    entry_mode: 'immediate', min_source_count: 2, require_fee_claim: false,
    token_age_max_ms: 86400000, min_mcap_usd: 10000, max_mcap_usd: 1000000,
    min_fee_claim_sol: 0, min_gmgn_total_fee_sol: 0, min_holders: 1000,
    max_top20_holder_percent: 50, min_saved_wallet_holders: 0, max_ath_distance_pct: 0,
    min_graduated_volume_usd: 0, trending_min_volume_usd: 5000, trending_min_swaps: 100,
    trending_max_rug_ratio: 0.2, trending_max_bundler_rate: 0.3,
    position_size_sol: 0.1, max_open_positions: 10,
    tp_percent: 100, sl_percent: -25, trailing_enabled: false, trailing_percent: 0,
    partial_tp: true, partial_tp_at_percent: 100, partial_tp_sell_percent: 50,
    max_hold_ms: 0, use_llm: true, llm_min_confidence: 70,
  };
}

// Resolve live TP/SL/trailing for a position.
// Priority: manual per-position override (tp_sl_rules) > strategy config (live sync) > position snapshot.
export function positionTpSl(position) {
  const id = Number(position?.id);
  const manual = Number.isFinite(id) && id > 0
    ? db.prepare('SELECT tp_percent, sl_percent, trailing_enabled, trailing_percent FROM tp_sl_rules WHERE position_id = ?').get(id)
    : null;
  const strat = position?.strategy_id ? strategyById(position.strategy_id) : null;
  const tp = manual?.tp_percent ?? strat?.tp_percent ?? position?.tp_percent ?? 50;
  const sl = manual?.sl_percent ?? strat?.sl_percent ?? position?.sl_percent ?? -25;
  const trailingEnabled = manual ? Boolean(manual.trailing_enabled) : (strat?.trailing_enabled ?? Boolean(position?.trailing_enabled));
  const trailingPercent = manual?.trailing_percent ?? strat?.trailing_percent ?? position?.trailing_percent ?? 20;
  return {
    tp_percent: Number(tp),
    sl_percent: Number(sl),
    trailing_enabled: trailingEnabled ? 1 : 0,
    trailing_percent: Number(trailingPercent),
  };
}
