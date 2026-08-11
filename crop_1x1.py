from PIL import Image

src = '/home/ubuntu/.hermes/profiles/kagecharon/cache/screenshots/browser_screenshot_6efee1f1ff87468296e3268e4ea1b707.png'
img = Image.open(src)
w, h = img.size
px = img.load()
bg = (11, 14, 20)

def row_diff(y):
    for x in range(0, w, 3):
        r, g, b = px[x, y][:3]
        if abs(r - bg[0]) > 25 or abs(g - bg[1]) > 25 or abs(b - bg[2]) > 25:
            return True
    return False

def col_diff(x):
    for y in range(0, h, 3):
        r, g, b = px[x, y][:3]
        if abs(r - bg[0]) > 25 or abs(g - bg[1]) > 25 or abs(b - bg[2]) > 25:
            return True
    return False

rows = [y for y in range(h) if row_diff(y)]
cols = [x for x in range(w) if col_diff(x)]
rmin, rmax = rows[0], rows[-1]
cmin, cmax = cols[0], cols[-1]
print('bbox:', rmin, rmax, cmin, cmax)
print('size:', cmax - cmin + 1, 'x', rmax - rmin + 1)

# Center-crop jadi persegi 1:1 pakai sisi card terbesar
card_w = cmax - cmin + 1
card_h = rmax - rmin + 1
side = max(card_w, card_h)
cx = (cmin + cmax) // 2
cy = (rmin + rmax) // 2
box = (cx - side // 2, cy - side // 2, cx + side // 2, cy + side // 2)
# clamp ke bounds gambar
box = (max(0, box[0]), max(0, box[1]), min(w, box[2]), min(h, box[3]))
# kalau gak cukup, crop ke card bounds dulu lalu pad dengan bg
cropped = img.crop(box)
print('cropped size:', cropped.size)
# Resize jadi 800x800 persis
out = '/home/ubuntu/charon/pnl-1x1.png'
if cropped.size[0] != cropped.size[1]:
    # pad ke persegi dengan warna bg
    side2 = max(cropped.size)
    canvas = Image.new('RGB', (side2, side2), bg)
    canvas.paste(cropped, ((side2 - cropped.size[0]) // 2, (side2 - cropped.size[1]) // 2))
    cropped = canvas
cropped = cropped.resize((800, 800), Image.LANCZOS)
cropped.save(out, optimize=True)
print('saved:', out, cropped.size)
