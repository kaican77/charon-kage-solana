import os

STYLES = {
'A': """
  .A { background:#10141d; border:1px solid #232c3d; border-radius:16px; padding:28px; color:#e8ecf3; display:flex; flex-direction:column; }
  .A .row1 { display:flex; align-items:center; gap:8px; }
  .A .dot { width:10px; height:10px; border-radius:50%; background:#22c55e; }
  .A .t { font-size:19px; font-weight:800; }
  .A .spacer { flex:1; }
  .A .pnl { font-size:34px; font-weight:800; color:#22c55e; margin-top:auto; text-align:center; }
  .A .sub2 { color:#8b93a7; font-size:13px; text-align:center; margin-top:6px; }
""",
'B': """
  .B { background:#10141d; border:1px solid #232c3d; border-radius:16px; padding:28px; color:#e8ecf3; display:flex; flex-direction:column; }
  .B .row1 { display:flex; align-items:center; gap:8px; }
  .B .dot { width:10px; height:10px; border-radius:50%; background:#22c55e; }
  .B .t { font-size:19px; font-weight:800; }
  .B .div { height:1px; background:#1c2333; margin:16px 0; }
  .B .f { display:flex; justify-content:space-between; padding:4px 0; font-size:14px; }
  .B .lbl { color:#9aa3b8; } .B .val { font-weight:700; }
  .B .spacer { flex:1; }
  .B .pnl { font-size:30px; font-weight:800; color:#22c55e; text-align:center; }
""",
'C': """
  .C { background:#10141d; border:1px solid #232c3d; border-radius:16px; padding:28px; color:#e8ecf3; display:flex; flex-direction:column; }
  .C .pnl { font-size:40px; font-weight:800; color:#22c55e; text-align:center; margin-top:6px; }
  .C .sym { font-size:15px; color:#8b93a7; text-align:center; margin-top:2px; }
  .C .spacer { flex:1; }
  .C .f { display:flex; justify-content:space-between; padding:4px 0; font-size:13.5px; }
  .C .lbl { color:#9aa3b8; } .C .val { font-weight:700; }
  .C .div { height:1px; background:#1c2333; margin:10px 0; }
""",
'D': """
  .D { background:#10141d; border:1px solid #232c3d; border-radius:16px; padding:28px; color:#e8ecf3; display:flex; flex-direction:column; }
  .D .row1 { display:flex; align-items:center; gap:8px; }
  .D .dot { width:10px; height:10px; border-radius:50%; background:#22c55e; }
  .D .t { font-size:19px; font-weight:800; }
  .D .sub { color:#8b93a7; font-size:12.5px; margin-top:4px; }
  .D .spacer { flex:1; }
  .D .pnl { font-size:28px; font-weight:800; color:#22c55e; text-align:center; }
  .D .pills { display:flex; gap:8px; margin-top:14px; }
  .D .pill { flex:1; text-align:center; padding:7px 0; border-radius:8px; font-size:12px; font-weight:700; background:#1e293b; }
  .D .pill.tp { color:#fbbf24; } .D .pill.sl { color:#f87171; } .D .pill.tr { color:#38bdf8; }
""",
'E': """
  .E { background:#10141d; border:1px solid #232c3d; border-radius:16px; padding:28px; color:#e8ecf3; display:flex; flex-direction:column; align-items:center; }
  .E .sym { font-size:17px; font-weight:700; margin-top:16px; }
  .E .spacer { flex:1; }
  .E .pnl { font-size:56px; font-weight:800; color:#22c55e; }
  .E .tag { font-size:12px; color:#8b93a7; margin-top:6px; }
""",
'F': """
  .F { background:#10141d; border:1px solid #232c3d; border-radius:16px; padding:28px; color:#e8ecf3; display:flex; flex-direction:column; }
  .F .row1 { display:flex; align-items:center; gap:8px; }
  .F .dot { width:10px; height:10px; border-radius:50%; background:#22c55e; }
  .F .t { font-size:19px; font-weight:800; }
  .F .spark { margin:10px 0; }
  .F .spacer { flex:1; }
  .F .pnl-row { display:flex; justify-content:space-between; align-items:baseline; }
  .F .pnl { font-size:26px; font-weight:800; color:#22c55e; }
  .F .sub2 { color:#8b93a7; font-size:12.5px; }
""",
}

BODIES = {
'A': """  <div class="row1"><span class="dot"></span><span class="t">FIRETAKE</span></div>
  <div class="spacer"></div>
  <div class="pnl">🟢 +49.6%</div>
  <div class="sub2">0.5000 SOL · akashi_zone</div>""",
'B': """  <div class="row1"><span class="dot"></span><span class="t">FIRETAKE</span></div>
  <div class="div"></div>
  <div class="f"><span class="lbl">💰 Entry</span><span class="val">$125.0K</span></div>
  <div class="f"><span class="lbl">💵 Current</span><span class="val">$187.0K</span></div>
  <div class="spacer"></div>
  <div class="pnl">🟢 +49.6%</div>""",
'C': """  <div class="pnl">+49.6%</div>
  <div class="sym">🟢 FIRETAKE · 0.5 SOL</div>
  <div class="spacer"></div>
  <div class="div"></div>
  <div class="f"><span class="lbl">Entry</span><span class="val">$125.0K</span></div>
  <div class="f"><span class="lbl">Current</span><span class="val">$187.0K</span></div>""",
'D': """  <div class="row1"><span class="dot"></span><span class="t">FIRETAKE</span></div>
  <div class="sub">⚡ akashi_zone · 🟢 dry_run</div>
  <div class="spacer"></div>
  <div class="pnl">🟢 +49.6%</div>
  <div class="pills">
    <span class="pill tp">TP 100%</span>
    <span class="pill sl">SL -50%</span>
    <span class="pill tr">Trail 16%</span>
  </div>""",
'E': """  <div class="spacer"></div>
  <div class="pnl">+49.6%</div>
  <div class="sym">🟢 FIRETAKE</div>
  <div class="tag">0.5 SOL · akashi_zone</div>
  <div class="spacer"></div>""",
'F': """  <div class="row1"><span class="dot"></span><span class="t">FIRETAKE</span></div>
  <div class="spark">
    <svg width="344" height="60" viewBox="0 0 344 60" fill="none">
      <defs>
        <linearGradient id="g" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stop-color="#22c55e" stop-opacity="0.35"/>
          <stop offset="100%" stop-color="#22c55e" stop-opacity="0"/>
        </linearGradient>
      </defs>
      <path d="M0,47 L38,43 L77,35 L115,38 L153,24 L192,13 L230,8 L268,3 L306,5 L344,4 L344,60 L0,60 Z" fill="url(#g)"/>
      <polyline points="0,47 38,43 77,35 115,38 153,24 192,13 230,8 268,3 306,5 344,4" stroke="#22c55e" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/>
    </svg>
  </div>
  <div class="spacer"></div>
  <div class="pnl-row">
    <span class="sub2">💸 0.5 SOL</span>
    <span class="pnl">🟢 +49.6%</span>
  </div>""",
}

for v in 'ABCDEF':
    html = f"""<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<style>
  * {{ margin:0; padding:0; box-sizing:border-box; }}
  body {{ background:#0b0e14; font-family:-apple-system,'Segoe UI',Roboto,sans-serif; }}
  .card {{ width:400px; height:400px; }}
{STYLES[v]}
</style>
</head>
<body>
<div class="card {v}">
{BODIES[v]}
</div>
</body>
</html>
"""
    path = f'/home/ubuntu/charon/pnl-single-{v}.html'
    with open(path, 'w') as f:
        f.write(html)
    print('wrote', path)
