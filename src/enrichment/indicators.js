/**
 * Technical indicators for Charon screening.
 * Native implementations (no TA lib) — stdlib only.
 */

// Wilder-style Average True Range over the last N candles.
// candles: [{ high, low, close }]. Returns array of ATR values (length = candles.length - period)
// or [] when insufficient data.
export function calcAtr(candles, period = 10) {
  if (!Array.isArray(candles) || candles.length < period + 1) return [];
  const out = [];
  let prevClose = Number(candles[0].close);
  let prevAtr = null;
  for (let i = 1; i < candles.length; i++) {
    const h = Number(candles[i].high);
    const l = Number(candles[i].low);
    const c = Number(candles[i].close);
    if (!Number.isFinite(h) || !Number.isFinite(l) || !Number.isFinite(c)) continue;
    const tr = Math.max(h - l, Math.abs(h - prevClose), Math.abs(l - prevClose));
    prevAtr = prevAtr == null ? tr : (prevAtr * (period - 1) + tr) / period;
    if (i >= period) out.push(prevAtr);
    prevClose = c;
  }
  return out;
}

/**
 * TradingView-style SuperTrend.
 * candles: [{ high, low, close }]
 * period: ATR period (default 10)
 * multiplier: ATR multiplier (default 3)
 * Returns:
 *   { line, direction, upperBand, lowerBand }
 *   - line: supertrend line value at the LAST candle
 *   - direction: 1 = uptrend (line below price), -1 = downtrend (line above price)
 *   - upperBand / lowerBand: final band values
 *   Null when insufficient data.
 */
export function calcSupertrend(candles, period = 10, multiplier = 3) {
  if (!Array.isArray(candles) || candles.length < period + 1) return null;
  const atrs = calcAtr(candles, period);
  if (atrs.length === 0) return null;

  let upperBand = null;
  let lowerBand = null;
  let supertrend = null;
  let direction = 1;

  // ATR[i] corresponds to candle index (period + i)
  for (let i = 1; i < candles.length; i++) {
    const idx = i - period; // index into atrs array (aligned: atr at candle i)
    if (idx < 0) continue;
    const atr = atrs[idx];
    if (!Number.isFinite(atr)) continue;
    const h = Number(candles[i].high);
    const l = Number(candles[i].low);
    const c = Number(candles[i].close);
    if (!Number.isFinite(h) || !Number.isFinite(l) || !Number.isFinite(c)) continue;

    const mid = (h + l) / 2;
    const newUpper = mid + multiplier * atr;
    const newLower = mid - multiplier * atr;

    // Standard Supertrend flip logic
    upperBand = upperBand == null || newUpper < upperBand || c > upperBand ? newUpper : upperBand;
    lowerBand = lowerBand == null || newLower > lowerBand || c < lowerBand ? newLower : lowerBand;

    if (supertrend == null) {
      supertrend = newUpper;
      direction = -1; // start in downtrend (line above price)
    } else if (supertrend === upperBand) {
      direction = c < lowerBand ? -1 : 1;
    } else {
      direction = c > upperBand ? 1 : -1;
    }
    supertrend = direction === 1 ? lowerBand : upperBand;
  }

  return { line: supertrend, direction, upperBand, lowerBand };
}

/**
 * Distance of current price from the supertrend line, as a percentage.
 * Positive = price above line. Negative = below.
 * Returns null when calcSupertrend yields nothing.
 */
export function supertrendDistancePct(candles, period = 10, multiplier = 3) {
  const st = calcSupertrend(candles, period, multiplier);
  if (!st || !Number.isFinite(st.line)) return null;
  const last = candles[candles.length - 1];
  const price = Number(last.close);
  if (!Number.isFinite(price) || price <= 0) return null;
  return ((price - st.line) / st.line) * 100;
}
