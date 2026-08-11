/**
 * DLMM pool detection adapter for Charon.
 *
 * Uses Meteora's Pool Discovery API (datapi.meteora.ag) to check whether a
 * token has a DLMM pool on Meteora. Mirrors the approach used by the meridian
 * repo's `tools/screening.js` (POOL_DISCOVERY_BASE).
 *
 * API endpoint:
 *   GET https://pool-discovery-api.datapi.meteora.ag/pools?filter_by=base_mint=<mint>&pool_type=dlmm
 *
 * Returns pool info if found (tvl, volume, fee_active_tvl_ratio, organic_score,
 * holders, bin_step, etc.) or null if no DLMM pool exists.
 */

const METEORA_POOL_DISCOVERY_API =
  process.env.METEORA_POOL_DISCOVERY_API ||
  "https://pool-discovery-api.datapi.meteora.ag";

async function fetchJson(url, { method = "GET", body = null } = {}) {
  const res = await fetch(url, {
    method,
    headers: {
      accept: "application/json",
      ...(body != null ? { "content-type": "application/json" } : {}),
      ...(body != null ? { body: JSON.stringify(body) } : {}),
    },
  });
  if (!res.ok) throw new Error(`Pool Discovery API error: ${res.status} ${res.statusText}`);
  return res.json();
}

/**
 * Check whether a token (by mint) has a DLMM pool on Meteora.
 * Returns true if a DLMM pool exists, false otherwise.
 */
export async function hasDlmmPool(mint) {
  try {
    const pool = await fetchDlmmPoolInfo(mint);
    return pool != null;
  } catch (err) {
    console.log(`[dlmm] hasDlmmPool error for ${mint.slice(0, 8)}...: ${err.message}`);
    return false;
  }
}

/**
 * Fetch DLMM pool info for a token by mint.
 * Returns pool object if found, null otherwise.
 */
export async function fetchDlmmPoolInfo(mint) {
  // NOTE: filter key is `token_x` (the base token), NOT `base_mint`. Verified
  // against the live Pool Discovery API — `base_mint` returns 0 hits.
  const url = `${METEORA_POOL_DISCOVERY_API}/pools?page_size=1&filter_by=token_x=${encodeURIComponent(mint)}&timeframe=5m`;
  const data = await fetchJson(url);
  const pools = Array.isArray(data?.data) ? data.data : [];
  if (pools.length === 0) return null;
  return pools[0];
}

/**
 * Score a DLMM pool (mirrors meridian's scoreCandidate).
 * Higher = better quality pool.
 */
export function scoreDlmmPool(pool) {
  const feeTvl = Number(pool.fee_active_tvl_ratio || 0);
  const organic = Number(pool.organic_score || 0);
  const volume = Number(pool.volume_window || 0);
  const holders = Number(pool.holders || 0);
  return feeTvl * 1000 + organic * 10 + volume / 100 + holders / 100;
}
