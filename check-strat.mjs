import { db } from './src/db/connection.js';

const row = db.prepare("SELECT config_json FROM strategies WHERE id='smart_money'").get();
console.log('smart_money config sekarang (len', row.config_json.length, '):');
console.log(row.config_json.slice(0, 300));
