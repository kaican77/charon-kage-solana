import { db } from '/home/ubuntu/charon/src/db/connection.js';
const since = Date.now() - 2*3600e3;

const cols = db.prepare("PRAGMA table_info(llm_decisions)").all().map(c => c.name);
console.log('llm_decisions cols:', cols.join(', '));

const rows = db.prepare(`SELECT * FROM llm_decisions WHERE created_at_ms > ? ORDER BY created_at_ms DESC LIMIT 5`).all(since);
if (rows.length === 0) console.log('  (no rows in last 2h)');
for (const r of rows) {
  console.log('---');
  for (const c of cols) {
    let v = r[c];
    if (v && typeof v === 'object') v = JSON.stringify(v).slice(0, 140);
    console.log('  ' + c + ': ' + String(v).slice(0, 180));
  }
}

const cc = db.prepare("SELECT COUNT(*) n FROM decision_cache WHERE created_at_ms > ?").get(since);
console.log('\ndecision_cache (2h):', cc.n);
const dc = db.prepare("SELECT id, candidate_id, confidence, verdict, created_at_ms FROM decision_cache WHERE created_at_ms > ? ORDER BY created_at_ms DESC LIMIT 5").all(since);
for (const r of dc) console.log('cache', r.id, String(r.candidate_id||'').slice(0,8), 'conf='+r.confidence, r.verdict, new Date(r.created_at_ms).toISOString().slice(11,19));
