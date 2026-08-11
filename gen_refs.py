import os

OUT = '/home/ubuntu/charon/refs'
os.makedirs(OUT, exist_ok=True)

CARDS = {}

# 1. TERMINAL — hacker green-on-black monospace, sharp rectangle, ASCII border
CARDS['1-terminal'] = """<!DOCTYPE html><html><head><meta charset="UTF-8"><style>
*{margin:0;padding:0;box-sizing:border-box}
body{background:#0a0f0a;font-family:'Courier New',monospace}
.card{width:400px;height:400px;background:#0a0f0a;border:2px solid #22ff55;color:#22ff55;padding:24px;display:flex;flex-direction:column;position:relative}
.card::before{content:'┌────────────────────────────┐';position:absolute;top:6px;left:10px;color:#1a8a33;font-size:10px}
.card::after{content:'└────────────────────────────┘';position:absolute;bottom:6px;left:10px;color:#1a8a33;font-size:10px}
.h{font-size:16px;font-weight:bold;letter-spacing:1px}
.h span{color:#1a8a33}
.cursor{display:inline-block;width:8px;height:14px;background:#22ff55;animation:none}
.lines{flex:1;margin-top:14px;font-size:13px;line-height:1.7}
.lines .d{color:#1a8a33}
.pnl{font-size:44px;font-weight:bold;text-shadow:0 0 12px #22ff55;text-align:center}
.blink{color:#22ff55}
</style></head><body><div class="card">
<div class="h">$ CHARON <span>v1.0</span><span class="cursor">▮</span></div>
<div class="lines">
<div><span class="d">$</span> token: FIRETAKE</div>
<div><span class="d">$</span> strat: akashi_zone</div>
<div><span class="d">$</span> size: 0.5000 SOL</div>
<div><span class="d">$</span> entry: $125.0K</div>
<div><span class="d">$</span> now: $187.0K</div>
</div>
<div class="pnl">+49.6%</div>
<div style="text-align:center;font-size:12px;color:#1a8a33">[ OK ]<span class="blink">▮</span></div>
</div></body></html>"""

# 2. NEON CYBERPUNK — glowing pink/cyan
CARDS['2-neon'] = """<!DOCTYPE html><html><head><meta charset="UTF-8"><style>
*{margin:0;padding:0;box-sizing:border-box}
body{background:#0b0014;font-family:'Segoe UI',Roboto,sans-serif}
.card{width:400px;height:400px;background:radial-gradient(circle at 30% 20%,#1a0b2e,#0b0014);border:1px solid #ff2fd6;border-radius:20px;padding:28px;color:#fff;display:flex;flex-direction:column;box-shadow:0 0 24px #ff2fd655,inset 0 0 30px #00e5ff22}
.h{font-size:18px;font-weight:800;letter-spacing:2px;background:linear-gradient(90deg,#00e5ff,#ff2fd6);-webkit-background-clip:text;background-clip:text;color:transparent}
.sub{color:#8a6fb8;font-size:12px;margin-top:4px}
.spacer{flex:1}
.pnl{font-size:52px;font-weight:900;text-align:center;background:linear-gradient(180deg,#39ff88,#00e5ff);-webkit-background-clip:text;background-clip:text;color:transparent;text-shadow:0 0 30px #00e5ff66}
.tag{text-align:center;color:#ff2fd6;font-size:12px;letter-spacing:3px;margin-top:8px}
</style></head><body><div class="card">
<div class="h">FIRETAKE ⚡</div>
<div class="sub">akashi_zone · dry_run</div>
<div class="spacer"></div>
<div class="pnl">+49.6%</div>
<div class="tag">0.5 SOL · 0x42</div>
</div></body></html>"""

# 3. TRADINGVIEW — light grid, candles
CARDS['3-tradingview'] = """<!DOCTYPE html><html><head><meta charset="UTF-8"><style>
*{margin:0;padding:0;box-sizing:border-box}
body{background:#f7f8fa;font-family:Roboto,'Segoe UI',sans-serif}
.card{width:400px;height:400px;background:#fff;border:1px solid #e1e4ea;border-radius:8px;padding:20px;display:flex;flex-direction:column}
.h{display:flex;justify-content:space-between;align-items:center}
.sym{font-size:17px;font-weight:700;color:#131722}
.price{font-size:15px;color:#131722;font-family:Roboto Mono,monospace}
.tags{display:flex;gap:6px;margin-top:8px}
.tag{background:#f0f3fa;color:#5d6b82;font-size:11px;padding:2px 8px;border-radius:4px;font-weight:600}
.chart{flex:1;margin:10px 0 4px;border-bottom:1px solid #e1e4ea;background:repeating-linear-gradient(0deg,transparent 0 18px,#f7f8fa 18px 19px),repeating-linear-gradient(90deg,transparent 0 24px,#f7f8fa 24px 25px)}
.row{display:flex;justify-content:space-between;font-size:12px;color:#5d6b82;padding:2px 0;font-family:Roboto Mono,monospace}
.row b{color:#131722}
.pnl{font-size:26px;font-weight:700;color:#089981;text-align:right}
</style></head><body><div class="card">
<div class="h"><span class="sym">FIRETAKE</span><span class="price">$187.0K</span></div>
<div class="tags"><span class="tag">akashi_zone</span><span class="tag">dry_run</span><span class="tag">SOL</span></div>
<div class="chart"><svg width="358" height="120" viewBox="0 0 358 120"><path d="M0,95 L36,88 L72,74 L108,80 L144,58 L180,40 L216,28 L252,16 L288,22 L324,12 L358,14" stroke="#089981" stroke-width="2" fill="none"/><circle cx="358" cy="14" r="3" fill="#089981"/></svg></div>
<div class="row"><span>Entry</span><b>$125.0K</b></div>
<div class="row"><span>Size</span><b>0.5000 SOL</b></div>
<div class="row"><span>PnL</span><b class="pnl" style="font-size:inherit">+49.6%</b></div>
</div></body></html>"""

# 4. GMGN CLEAN — white, mint green, friendly
CARDS['4-gmgn'] = """<!DOCTYPE html><html><head><meta charset="UTF-8"><style>
*{margin:0;padding:0;box-sizing:border-box}
body{background:#f2f4f7;font-family:'Segoe UI',Roboto,sans-serif}
.card{width:400px;height:400px;background:#fff;border-radius:16px;padding:26px;display:flex;flex-direction:column;box-shadow:0 6px 20px rgba(0,0,0,.07)}
.h{display:flex;align-items:center;gap:8px}
.logo{width:26px;height:26px;border-radius:8px;background:#22c55e;display:flex;align-items:center;justify-content:center;font-size:14px;color:#fff;font-weight:800}
.sym{font-size:18px;font-weight:700;color:#111}
.pill{background:#ecfdf5;color:#059669;font-size:11px;padding:2px 8px;border-radius:20px;font-weight:600;margin-left:auto}
.div{height:1px;background:#eef1f5;margin:14px 0}
.f{display:flex;justify-content:space-between;padding:5px 0;font-size:14px;color:#333}
.f .v{font-weight:700;color:#111}
.spacer{flex:1}
.pnlrow{display:flex;align-items:baseline;justify-content:space-between}
.pnl{font-size:30px;font-weight:800;color:#16a34a}
.badge{background:#f0fdf4;color:#16a34a;font-size:11px;font-weight:700;padding:3px 10px;border-radius:20px}
</style></head><body><div class="card">
<div class="h"><span class="logo">C</span><span class="sym">FIRETAKE</span><span class="pill">● live</span></div>
<div style="color:#8a94a6;font-size:12px;margin-top:4px">akashi_zone · 0.5000 SOL</div>
<div class="div"></div>
<div class="f"><span>Entry mcap</span><span class="v">$125.0K</span></div>
<div class="f"><span>ATH mcap</span><span class="v">$198.0K</span></div>
<div class="f"><span>Current mcap</span><span class="v">$187.0K</span></div>
<div class="spacer"></div>
<div class="pnlrow"><span class="badge">● position open</span><span class="pnl">+49.6%</span></div>
</div></body></html>"""

# 5. BONKBOT PURPLE — dark indigo, purple glow
CARDS['5-bonkbot'] = """<!DOCTYPE html><html><head><meta charset="UTF-8"><style>
*{margin:0;padding:0;box-sizing:border-box}
body{background:#0d0818;font-family:'Segoe UI',Roboto,sans-serif}
.card{width:400px;height:400px;background:linear-gradient(160deg,#1c1140,#140a2e 60%,#0d0818);border:1px solid #3a2a6e;border-radius:18px;padding:26px;display:flex;flex-direction:column;color:#fff;box-shadow:0 0 30px #7c3aed33}
.h{display:flex;align-items:center;gap:8px}
.dot{width:9px;height:9px;border-radius:50%;background:#a78bfa;box-shadow:0 0 8px #a78bfa}
.sym{font-size:18px;font-weight:800}
.chain{background:#2a1d54;color:#a78bfa;font-size:10px;padding:2px 8px;border-radius:10px;margin-left:auto;font-weight:700;letter-spacing:1px}
.div{height:1px;background:#2f2360;margin:14px 0}
.f{display:flex;justify-content:space-between;padding:4px 0;font-size:13.5px;color:#c4b5fd}
.f .v{color:#fff;font-weight:700}
.spacer{flex:1}
.pnl{font-size:34px;font-weight:900;color:#4ade80;text-shadow:0 0 16px #4ade8066}
.pills{display:flex;gap:8px;margin-top:10px}
.pill{flex:1;text-align:center;padding:7px 0;border-radius:10px;font-size:11.5px;font-weight:700;background:#2a1d54;color:#c4b5fd}
</style></head><body><div class="card">
<div class="h"><span class="dot"></span><span class="sym">FIRETAKE</span><span class="chain">SOL</span></div>
<div style="color:#8b7fc4;font-size:12px;margin-top:4px">akashi_zone · dry_run</div>
<div class="div"></div>
<div class="f"><span>Entry</span><span class="v">$125.0K</span></div>
<div class="f"><span>Current</span><span class="v">$187.0K</span></div>
<div class="f"><span>Size</span><span class="v">0.5000 SOL</span></div>
<div class="spacer"></div>
<div class="pnl">🟢 +49.6%</div>
<div class="pills"><span class="pill">TP 100%</span><span class="pill">SL -50%</span><span class="pill">TRAIL 16%</span></div>
</div></body></html>"""

# 6. GOLD LUXURY — navy + gold
CARDS['6-gold'] = """<!DOCTYPE html><html><head><meta charset="UTF-8"><style>
*{margin:0;padding:0;box-sizing:border-box}
body{background:#0a0d14;font-family:Georgia,'Times New Roman',serif}
.card{width:400px;height:400px;background:linear-gradient(180deg,#101826,#0a0d14);border:1px solid #b8962e;border-radius:4px;padding:30px;display:flex;flex-direction:column;color:#f5ecd2;box-shadow:0 0 40px #b8962e22}
.h{display:flex;align-items:center;gap:10px;border-bottom:1px solid #b8962e55;padding-bottom:12px}
.sym{font-size:20px;font-weight:700;letter-spacing:2px;color:#f0d98c}
.sub{color:#8a7b4a;font-size:11px;letter-spacing:2px;margin-top:4px;text-transform:uppercase}
.spacer{flex:1}
.pnl{font-size:50px;font-weight:700;color:#f0d98c;text-align:center;text-shadow:0 0 20px #b8962e66}
.amount{text-align:center;color:#8a7b4a;font-size:13px;letter-spacing:1px;margin-top:6px}
.foot{display:flex;justify-content:space-between;border-top:1px solid #b8962e55;padding-top:12px;font-size:12px;color:#8a7b4a}
.foot b{color:#f0d98c}
</style></head><body><div class="card">
<div class="h"><span class="sym">FIRETAKE</span><span style="color:#8a7b4a;font-size:12px">#42</span></div>
<div class="sub">Akashi Zone · Dry Run</div>
<div class="spacer"></div>
<div class="pnl">+49.6%</div>
<div class="amount">0.5000 SOL</div>
<div class="spacer"></div>
<div class="foot"><span>ENTRY <b>$125K</b></span><span>NOW <b>$187K</b></span></div>
</div></body></html>"""

# 7. LOSS RED — showing a losing position
CARDS['7-loss'] = """<!DOCTYPE html><html><head><meta charset="UTF-8"><style>
*{margin:0;padding:0;box-sizing:border-box}
body{background:#12060a;font-family:'Segoe UI',Roboto,sans-serif}
.card{width:400px;height:400px;background:radial-gradient(circle at 70% 20%,#2a0a12,#12060a);border:1px solid #ef4444aa;border-radius:16px;padding:26px;display:flex;flex-direction:column;color:#fff;box-shadow:0 0 30px #ef444422}
.h{display:flex;align-items:center;gap:8px}
.dot{width:9px;height:9px;border-radius:50%;background:#ef4444;box-shadow:0 0 8px #ef4444}
.sym{font-size:18px;font-weight:800}
.st{color:#fca5a5;font-size:11px;margin-left:auto;background:#7f1d1d;padding:3px 10px;border-radius:20px;font-weight:700}
.div{height:1px;background:#3f1a22;margin:14px 0}
.f{display:flex;justify-content:space-between;padding:4px 0;font-size:13.5px;color:#fda4af}
.f .v{color:#fff;font-weight:700}
.spacer{flex:1}
.pnl{font-size:38px;font-weight:900;color:#ef4444;text-shadow:0 0 18px #ef444466;text-align:center}
.warn{text-align:center;font-size:12px;color:#fca5a5;margin-top:6px}
</style></head><body><div class="card">
<div class="h"><span class="dot"></span><span class="sym">REKTCOIN</span><span class="st">STOP LOSS</span></div>
<div style="color:#f87171;font-size:12px;margin-top:4px">akashi_zone · 0.5000 SOL</div>
<div class="div"></div>
<div class="f"><span>Entry</span><span class="v">$250.0K</span></div>
<div class="f"><span>Current</span><span class="v">$172.0K</span></div>
<div class="spacer"></div>
<div class="pnl">🔻 -31.2%</div>
<div class="warn">SL -50% hit · position closed</div>
</div></body></html>"""

# 8. GLASSMORPHISM — colorful bg, frosted glass
CARDS['8-glass'] = """<!DOCTYPE html><html><head><meta charset="UTF-8"><style>
*{margin:0;padding:0;box-sizing:border-box}
body{background:linear-gradient(135deg,#312e81,#7c3aed 50%,#db2777);font-family:'Segoe UI',Roboto,sans-serif}
.card{width:400px;height:400px;background:rgba(255,255,255,.12);border:1px solid rgba(255,255,255,.3);border-radius:24px;padding:28px;display:flex;flex-direction:column;color:#fff;backdrop-filter:blur(14px);box-shadow:0 8px 32px rgba(0,0,0,.3)}
.h{display:flex;align-items:center;gap:8px}
.sym{font-size:19px;font-weight:800;text-shadow:0 1px 4px rgba(0,0,0,.3)}
.tag{background:rgba(255,255,255,.2);font-size:11px;padding:3px 10px;border-radius:20px;margin-left:auto;font-weight:600}
.div{height:1px;background:rgba(255,255,255,.25);margin:14px 0}
.f{display:flex;justify-content:space-between;padding:4px 0;font-size:14px}
.f .v{font-weight:700}
.spacer{flex:1}
.pnl{font-size:38px;font-weight:900;color:#a7f3d0;text-shadow:0 2px 10px rgba(0,0,0,.4);text-align:center}
.sub{text-align:center;font-size:12px;color:rgba(255,255,255,.85);margin-top:6px}
</style></head><body><div class="card">
<div class="h"><span class="sym">FIRETAKE</span><span class="tag">akashi_zone</span></div>
<div style="font-size:12px;color:rgba(255,255,255,.85);margin-top:4px">dry_run · 0.5000 SOL</div>
<div class="div"></div>
<div class="f"><span>Entry</span><span class="v">$125.0K</span></div>
<div class="f"><span>Current</span><span class="v">$187.0K</span></div>
<div class="spacer"></div>
<div class="pnl">+49.6%</div>
<div class="sub">● position open</div>
</div></body></html>"""

# 9. EDITORIAL — off-white, huge serif number, tiny uppercase labels
CARDS['9-editorial'] = """<!DOCTYPE html><html><head><meta charset="UTF-8"><style>
*{margin:0;padding:0;box-sizing:border-box}
body{background:#efe9df;font-family:Georgia,'Times New Roman',serif}
.card{width:400px;height:400px;background:#faf7f2;padding:34px;display:flex;flex-direction:column;color:#1a1a1a}
.top{display:flex;justify-content:space-between;font-size:11px;letter-spacing:3px;color:#8a8578;text-transform:uppercase}
.spacer{flex:1}
.big{font-size:78px;font-weight:400;line-height:1;color:#1a1a1a}
.small{font-size:13px;color:#8a8578;letter-spacing:2px;text-transform:uppercase;margin-top:10px}
.rule{height:1px;background:#c9c2b2;margin:18px 0}
.meta{display:flex;justify-content:space-between;font-size:11px;letter-spacing:2px;color:#8a8578;text-transform:uppercase}
.meta b{color:#1a1a1a;font-weight:600}
</style></head><body><div class="card">
<div class="top"><span>FIRETAKE</span><span>#42</span></div>
<div class="spacer"></div>
<div class="big">+49.6<span style="font-size:34px">%</span></div>
<div class="small">Akashi Zone · Dry Run</div>
<div class="rule"></div>
<div class="meta"><span>Entry <b>$125K</b></span><span>Now <b>$187K</b></span><span>Size <b>0.5 SOL</b></span></div>
</div></body></html>"""

for name, html in CARDS.items():
    path = f'{OUT}/{name}.html'
    with open(path, 'w') as f:
        f.write(html)
    print('wrote', path)
