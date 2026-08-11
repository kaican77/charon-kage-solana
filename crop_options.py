from PIL import Image

src = '/home/ubuntu/.hermes/profiles/kagecharon/cache/screenshots/browser_screenshot_92ec8dbf5252499a8d54ec6cc6ea001b.png'
img = Image.open(src)
w, h = img.size
px = img.load()
bg = (11, 14, 20)

def row_diff(y):
    for x in range(0, w, 4):
        r, g, b = px[x, y][:3]
        if abs(r - bg[0]) > 30 or abs(g - bg[1]) > 30 or abs(b - bg[2]) > 30:
            return True
    return False

def col_diff(x):
    for y in range(0, h, 4):
        r, g, b = px[x, y][:3]
        if abs(r - bg[0]) > 30 or abs(g - bg[1]) > 30 or abs(b - bg[2]) > 30:
            return True
    return False

# Cari blok konten: setiap label "OPSI" (teks terang #5b6b8c) dan card (bg #10141d dst)
# Metode: bagi jadi 4 blok sama rata berdasarkan baris non-bg yang kontigu
rows_nonbg = [y for y in range(h) if row_diff(y)]
# Kelompokkan baris non-bg yang berdekatan (< 10px gap)
blocks = []
start = rows_nonbg[0]
prev = rows_nonbg[0]
for y in rows_nonbg[1:]:
    if y - prev > 10:
        blocks.append((start, prev))
        start = y
    prev = y
blocks.append((start, prev))
print('blocks:', blocks)

# Ambil 4 blok terbesar (label + card)
blocks.sort(key=lambda b: b[1] - b[0], reverse=True)
top4 = sorted(blocks[:4])
print('top4:', top4)

cols = [x for x in range(w) if col_diff(x)]
cmin, cmax = cols[0], cols[-1]
p = 8
for i, (top, bot) in enumerate(top4, 1):
    box = (max(0, cmin - p), max(0, top - p), min(w, cmax + p), min(h, bot + p))
    card = img.crop(box)
    out = f'/home/ubuntu/charon/pnl-option-{i}.png'
    card.save(out, optimize=True)
    print(f'option {i}: saved {out} {card.size}')
