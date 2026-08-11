from PIL import Image

src = '/home/ubuntu/.hermes/profiles/kagecharon/cache/screenshots/browser_screenshot_3eaf4b88bd14425ca91d4f4104577eb1.png'
img = Image.open(src)
w, h = img.size
print('full size:', w, h)

# Grid: 3 kolom x 2 baris, tiap cell 400x400 + label, gap 24px, padding 24px
# Cell width = 400, gap = 24 → 3*400 + 2*24 = 1248, + padding 48 = 1296
# Cell height = 400 + label ~30, baris = 2
# Deteksi otomatis: cari posisi card (bg #10141d) di grid

px = img.load()

def find_card_bounds():
    # Card bg = #10141d = (16,20,29); body bg = #0b0e14 = (11,14,20)
    # Cari semua region yang punya warna card
    card_color = (16, 20, 29)
    cells = []
    visited = set()
    for y in range(0, h, 10):
        for x in range(0, w, 10):
            if (x, y) in visited:
                continue
            r, g, b = px[x, y][:3]
            if abs(r - card_color[0]) <= 8 and abs(g - card_color[1]) <= 8 and abs(b - card_color[2]) <= 8:
                # flood-ish: cari bounds region ini
                # expand kiri
                x0 = x
                while x0 > 0:
                    r2, g2, b2 = px[x0 - 10, y][:3]
                    if abs(r2 - card_color[0]) <= 10 and abs(g2 - card_color[1]) <= 10 and abs(b2 - card_color[2]) <= 10:
                        x0 -= 10
                    else:
                        break
                # cari batas card: scan baris di x ini, cari kontigu card rows
                y0 = y
                while y0 > 0:
                    r2, g2, b2 = px[x0, y0 - 10][:3]
                    if abs(r2 - card_color[0]) <= 10 and abs(g2 - card_color[1]) <= 10 and abs(b2 - card_color[2]) <= 10:
                        y0 -= 10
                    else:
                        break
                # deteksi tinggi card (400px): scan ke bawah dari y0 di x0
                y1 = y0
                while y1 < h - 10:
                    r2, g2, b2 = px[x0, y1 + 10][:3]
                    if abs(r2 - card_color[0]) <= 10 and abs(g2 - card_color[1]) <= 10 and abs(b2 - card_color[2]) <= 10:
                        y1 += 10
                    else:
                        break
                # lebar: scan kanan dari (x0, (y0+y1)//2)
                x1 = x0
                midy = (y0 + y1) // 2
                while x1 < w - 10:
                    r2, g2, b2 = px[x1 + 10, midy][:3]
                    if abs(r2 - card_color[0]) <= 10 and abs(g2 - card_color[1]) <= 10 and abs(b2 - card_color[2]) <= 10:
                        x1 += 10
                    else:
                        break
                cells.append((x0, y0, x1, y1))
                # tandai visited area ini
                for yy in range(y0, y1 + 1, 10):
                    for xx in range(x0, x1 + 1, 10):
                        visited.add((xx, yy))
    return cells

cells = find_card_bounds()
print('cells found:', len(cells))
# dedupe + sort
cells = sorted(set(cells), key=lambda c: (c[1], c[0]))
for i, c in enumerate(cells):
    x0, y0, x1, y1 = c
    print(f'cell {i}: ({x0},{y0})-({x1},{y1}) size {x1-x0+1}x{y1-y0+1}')
    # crop dengan padding kecil
    p = 4
    box = (max(0, x0 - p), max(0, y0 - p), min(w, x1 + p), min(h, y1 + p))
    card = img.crop(box)
    # pad/resize ke 800x800 1:1
    if card.size[0] != card.size[1]:
        side = max(card.size)
        canvas = Image.new('RGB', (side, side), (11, 14, 20))
        canvas.paste(card, ((side - card.size[0]) // 2, (side - card.size[1]) // 2))
        card = canvas
    card = card.resize((800, 800), Image.LANCZOS)
    label = chr(ord('A') + i)
    out = f'/home/ubuntu/charon/pnl-simple-{label}.png'
    card.save(out, optimize=True)
    print(f'  saved {out} {card.size}')
