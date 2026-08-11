import { db } from './src/db/connection.js';
import { updateStrategyConfig } from './src/db/settings.js';

// Config smart_money yang valid (dari sesi sebelumnya, sebelum ke-klobok
// sama bug apply script) + tweak baru yang diminta.
const cfg = {
  entry_mode: 'immediate',
  min_source_count: 2,
  require_fee_claim: false,
  token_age_max_ms: 86400000,
  min_mcap_usd: 50000,
  max_mcap_usd: 1000000,
  min_fee_claim_sol: 0,
  min_gmgn_total_fee_sol: 10,
  min_holders: 500,
  max_top20_holder_percent: 75,
  min_saved_wallet_holders: 0,
  max_ath_distance_pct: -60,
  min_graduated_volume_usd: 0,
  trending_min_volume_usd: 5000,
  trending_min_swaps: 100,
  trending_max_rug_ratio: 1,
  trending_max_bundler_rate: 0.25,
  position_size_sol: 0.1,
  max_open_positions: 10,
  tp_percent: 50,
  sl_percent: -30,
  trailing_enabled: true,
  trailing_percent: 10,
  partial_tp: false,
  partial_tp_at_percent: 100,
  partial_tp_sell_percent: 0,
  max_hold_ms: 0,
  use_llm: true,
  llm_min_confidence: 70,
  llm_candidate_pick_count: 10,
  trending_enabled: true,
  trending_source: 'jupiter',
  trending_interval: '5m',
  trending_limit: 100,
  trending_order_by: 'volume',
  trending_allow_degen: false,
  max_whale_percent: 30,
  min_smart_degen_count: 3,
  min_renowned_count: 1,
  max_rsi_14: 60,
};

updateStrategyConfig('smart_money', cfg);
console.log('saved. verifying...');

const row = db.prepare("SELECT config_json FROM strategies WHERE id='smart_money'").get();
const parsed = JSON.parse(row.config_json);
console.log('min_smart_degen_count:', parsed.min_smart_degen_count);
console.log('min_renowned_count:', parsed.min_renowned_count);
console.log('max_rsi_14:', parsed.max_rsi_14);
console.log('trending_min_swaps:', parsed.trending_min_swaps);
console.log('llm_min_confidence:', parsed.llm_min_confidence);
console.log('trailing_enabled:', parsed.trailing_enabled);
console.log('trailing_percent:', parsed.trailing_percent);
console.log('min_mcap_usd:', parsed.min_mcap_usd);
console.log('min_holders:', parsed.min_holders);
console.log('max_ath_distance_pct:', parsed.max_ath_distance_pct);
console.log('tp/sl:', parsed.tp_percent, parsed.sl_percent);
