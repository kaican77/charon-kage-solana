from PIL import Image

src = '/home/ubuntu/.hermes/profiles/kagecharon/cache/screenshots/browser_screenshot_3eaf4b88bd14425ca91d4f4104577eb1.png'
img = Image.open(src)
w, h = img.size

# Layout: page padding 24px, gap 24px, card 400x400, label ~20px di atas card
# Grid 3 kolom x 2 baris:
# kolom x: 24 + i*(400+24)
# baris y: 24 (label) + 20 (label height) + 8 (margin) + j*(400+24+label+gap)
# Lebih aman: cari label "A · SUPER MINIMAL" dulu? No — pakai estimasi:
# Baris 1: label y≈24-44, card y≈52-452
# Baris 2: label y≈476-496, card y≈504-904
# Tapi screenshot 1362px tinggi → baris 2 ke-crop? 904 < 1362 OK

padding = 24
gap = 24
card = 400
label_h = 30  # label + margin

cols = [padding + i * (card + gap) for i in range(3)]
rows = [padding + label_h + j * (card + gap + label_h) for j in range(2)]

print('cols:', cols, 'rows:', rows)
for j in range(2):
    for i in range(3):
        idx = j * 3 + i
        if idx >= 6:
            break
        x0 = cols[i]
        y0 = rows[j]
        box = (x0, y0, x0 + card, y0 + card)
        c = img.crop(box)
        label = chr(ord('A') + idx)
        out = f'/home/ubuntu/charon/pnl-simple-{label}.png'
        c = c.resize((800, 800), Image.LANCZOS)
        c.save(out, optimize=True)
        print(f'{label}: saved {out} box={box} -> {c.size}')
