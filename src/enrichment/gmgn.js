import { randomUUID } from 'node:crypto';
import { GMGN_API_KEY, GMGN_CACHE_TTL_MS, GMGN_ENABLED, JSON_HEADERS } from '../config.js';
import { now, sleep } from '../utils.js';
import { numSetting, setting } from '../db/settings.js';

const gmgnCache = new Map();

// Cap cache size — same OOM protection as Jupiter asset cache. GMGN cache
// entries are bigger (token info + rank rows), so cap tighter at 300.
const GMGN_CACHE_MAX = 300;
function gmgnCacheSet(mint, data) {
  if (gmgnCache.size >= GMGN_CACHE_MAX) {
    const oldest = gmgnCache.keys().next().value;
    if (oldest !== undefined) gmgnCache.delete(oldest);
  }
  gmgnCache.set(mint, { at: now(), data });
}
let lastGmgnRequestAt = 0;
let gmgnQueue = Promise.resolve();
const gmgnBackoff = {
  tokenUntil: 0,
  tokenReason: '',
  trendingUntil: 0,
  trendingReason: '',
};

async function paceGmgnRequest() {
  const delayMs = Math.max(0, numSetting('gmgn_request_delay_ms', 2500));
  if (!delayMs) return;
  const elapsed = now() - lastGmgnRequestAt;
  if (elapsed < delayMs) await sleep(delayMs - elapsed);
  lastGmgnRequestAt = now();
}

function enqueueGmgn(work) {
  const run = gmgnQueue.then(work, work);
  gmgnQueue = run.catch(() => {});
  return run;
}

function gmgnErrorText(status, payload, fallback) {
  const raw = String(payload?.raw || payload?.message || payload?.error || fallback || '');
  if (/<title>\s*Just a moment/i.test(raw) || /challenge-platform|cf_chl/i.test(raw)) {
    return 'Cloudflare managed challenge';
  }
  return `${status || ''} ${payload?.code || ''} ${raw}`.replace(/\s+/g, ' ').trim().slice(0, 240);
}

function appendParams(url, params = {}) {
  for (const [key, value] of Object.entries(params)) {
    if (value == null) continue;
    if (Array.isArray(value)) {
      for (const entry of value.filter(item => item != null && item !== '')) {
        url.searchParams.append(key, String(entry));
      }
    } else {
      url.searchParams.set(key, String(value));
    }
  }
}

async function gmgnFetch(pathname, { params = {} } = {}) {
  if (!GMGN_ENABLED) throw new Error('GMGN disabled');
  return enqueueGmgn(async () => {
    const url = new URL(`https://openapi.gmgn.ai${pathname}`);
    appendParams(url, {
      ...params,
      timestamp: Math.floor(now() / 1000),
      client_id: randomUUID(),
    });
    const maxRetries = Math.max(0, Math.floor(numSetting('gmgn_max_retries', 2)));
    for (let attempt = 0; attempt <= maxRetries; attempt++) {
      await paceGmgnRequest();
      const res = await fetch(url, {
        method: 'GET',
        headers: {
          'X-APIKEY': GMGN_API_KEY,
          'Content-Type': 'application/json',
        },
      });
      const text = await res.text().catch(() => '');
      let payload = {};
      try {
        payload = text ? JSON.parse(text) : {};
      } catch {
        payload = { raw: text };
      }
      if (res.ok) return payload;
      const message = gmgnErrorText(res.status, payload, `GMGN ${pathname} ${res.status}`);
      const rateLimited = res.status === 429 || /rate limit|temporarily banned/i.test(String(message));
      if (rateLimited && attempt < maxRetries) {
        const retryAfter = Number(res.headers.get('retry-after'));
        const backoffMs = Number.isFinite(retryAfter)
          ? retryAfter * 1000
          : /temporarily banned/i.test(String(message))
            ? 60_000
            : Math.min(30_000, 3000 * 2 ** attempt);
        await sleep(backoffMs);
        continue;
      }
      const error = new Error(message);
      error.response = { status: res.status, data: payload, headers: Object.fromEntries(res.headers.entries()) };
      throw error;
    }
    throw new Error(`GMGN ${pathname} failed`);
  });
}

function gmgnBackoffKey(kind) {
  return kind === 'trending' ? 'trendingUntil' : 'tokenUntil';
}

function gmgnReasonKey(kind) {
  return kind === 'trending' ? 'trendingReason' : 'tokenReason';
}

function gmgnBackoffActive(kind) {
  return now() < Number(gmgnBackoff[gmgnBackoffKey(kind)] || 0);
}

function setGmgnBackoff(kind, err) {
  const status = err.response?.status;
  if (status !== 403 && status !== 429) return;
  const body = err.response?.data || {};
  const resetAtMs = Number(body.reset_at || 0) * 1000;
  const challenge = /Cloudflare managed challenge/i.test(String(err.message));
  const fallbackMs = challenge ? 30 * 60 * 1000 : status === 403 ? 10 * 60 * 1000 : 60 * 1000;
  const until = resetAtMs > now() ? resetAtMs : now() + fallbackMs;
  const reason = gmgnErrorText(status, body, err.message);
  gmgnBackoff[gmgnBackoffKey(kind)] = until;
  gmgnBackoff[gmgnReasonKey(kind)] = reason;
  console.log(`[gmgn:${kind}] backing off until ${new Date(until).toISOString()} (${reason})`);
}

function gmgnStatusText(kind) {
  if (!GMGN_ENABLED) return 'off';
  const key = gmgnBackoffKey(kind);
  if (!gmgnBackoffActive(kind)) return 'ok';
  const seconds = Math.max(1, Math.ceil((Number(gmgnBackoff[key]) - now()) / 1000));
  return `blocked ${seconds}s`;
}

function marketCapFromGmgn(info) {
  const direct = Number(info?.market_cap ?? info?.mcap);
  if (Number.isFinite(direct) && direct > 0) return direct;
  const price = Number(info?.price);
  const supply = Number(info?.circulating_supply ?? info?.total_supply);
  return Number.isFinite(price) && Number.isFinite(supply) ? price * supply : null;
}

function tokenPriceFromGmgn(info) {
  const price = Number(info?.price);
  return Number.isFinite(price) ? price : null;
}

async function fetchGmgnTokenInfo(mint, useCache = true) {
  if (!GMGN_ENABLED) return null;
  const cached = gmgnCache.get(mint);
  if (useCache && cached && now() - cached.at < GMGN_CACHE_TTL_MS) return cached.data;
  if (gmgnBackoffActive('token')) {
    return null;
  }

  try {
    const payload = await gmgnFetch('/v1/token/info', {
      params: { chain: 'sol', address: mint },
    });
    const data = payload?.data?.data || payload?.data || payload;
    gmgnCacheSet(mint, data);
    return data;
  } catch (err) {
    setGmgnBackoff('token', err);
    if (err.response?.status !== 403 && err.response?.status !== 429) {
      console.log(`[gmgn] ${mint.slice(0, 8)}... ${err.response?.status || ''} ${err.message}`);
    }
    gmgnCacheSet(mint, null);
    return null;
  }
}

function normalizedTrendingRows(payload) {
  const rows = payload?.data?.data?.rank
    || payload?.data?.rank
    || payload?.rank
    || payload?.data?.data
    || payload?.data
    || [];
  return Array.isArray(rows) ? rows : [];
}

const SMART_FIELD_KEYS = [
  'smart_degen_count', 'renowned_count', 'sniper_count', 'top70_sniper_hold_rate',
  'rat_trader_amount_rate', 'top_10_holder_rate', 'rug_ratio', 'bundler_rate',
  'is_wash_trading', 'is_honeypot', 'dev_team_hold_rate', 'dexscr_boost_fee',
];

// Extract the smart-money / risk fields GMGN rank rows carry. Returns {} when
// the row has none of them (server-fed signals often omit these).
export function extractSmartFields(row) {
  if (!row || typeof row !== 'object') return {};
  const out = {};
  for (const key of SMART_FIELD_KEYS) {
    if (row[key] !== undefined && row[key] !== null) out[key] = row[key];
  }
  return out;
}

// Look up a mint inside the GMGN trending rank (any interval) and return the
// raw row if found. Used as a fallback when the signal server did not include
// smart-money fields for a candidate.
export async function fetchGmgnRankRow(mint, { interval = '1h', limit = 100 } = {}) {
  if (!GMGN_ENABLED) return null;
  try {
    const payload = await gmgnFetch('/v1/market/rank', {
      params: { chain: 'sol', interval, limit },
    });
    const rows = normalizedTrendingRows(payload);
    return rows.find(row => String(row.address) === String(mint)) || null;
  } catch (err) {
    setGmgnBackoff('trending', err);
    return null;
  }
}

// Fetch OHLCV candles for a token. Returns [{ time, open, high, low, close, volume }].
export async function fetchGmgnKline(mint, { resolution = '15m', limit = 30 } = {}) {
  if (!GMGN_ENABLED) return [];
  try {
    const payload = await gmgnFetch('/v1/market/token_kline', {
      params: { chain: 'sol', address: mint, resolution, limit },
    });
    const list = payload?.data?.data?.list || payload?.data?.list || payload?.list || [];
    return Array.isArray(list) ? list : [];
  } catch (err) {
    setGmgnBackoff('trending', err);
    return [];
  }
}

// Wilder-style RSI over the last N closes. Returns null when insufficient data.
export function calcRsi(closes, period = 14) {
  if (!Array.isArray(closes) || closes.length < period + 1) return null;
  const vals = closes.map(Number).filter(Number.isFinite);
  if (vals.length < period + 1) return null;
  let gainSum = 0;
  let lossSum = 0;
  for (let i = vals.length - period; i < vals.length; i++) {
    const diff = vals[i] - vals[i - 1];
    if (diff >= 0) gainSum += diff;
    else lossSum -= diff;
  }
  const avgGain = gainSum / period;
  const avgLoss = lossSum / period;
  if (avgLoss === 0) return 100;
  const rs = avgGain / avgLoss;
  return 100 - 100 / (1 + rs);
}

export {
  gmgnFetch,
  fetchGmgnTokenInfo,
  gmgnBackoffActive,
  setGmgnBackoff,
  gmgnStatusText,
  marketCapFromGmgn,
  tokenPriceFromGmgn,
  normalizedTrendingRows,
};
