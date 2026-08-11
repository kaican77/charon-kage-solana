import { db } from './src/db/connection.js';

const row = db.prepare("SELECT config_json FROM strategies WHERE id='smart_money'").get();
console.log('RAW config_json:');
console.log(row.config_json);
