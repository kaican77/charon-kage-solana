import { renderTerminalCard, buildTerminalSvg } from './src/cards/terminalCard.js';
import fs from 'node:fs';

const pos = {
  symbol: 'FIRETAKE',
  strategy_id: 'akashi_zone',
  execution_mode: 'dry_run',
  status: 'open',
  size_sol: 0.5,
  entry_mcap: 125000,
  mcap: 187000,
  pnl_percent: 49.6,
};
const buf = await renderTerminalCard(pos);
fs.writeFileSync('/tmp/test-terminal.png', buf);
console.log('PNG bytes:', buf.length);
console.log('SVG preview:', buildTerminalSvg(pos).slice(0, 120) + '...');
