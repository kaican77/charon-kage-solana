from PIL import Image

img = Image.open('/home/ubuntu/.hermes/profiles/kagecharon/cache/screenshots/browser_screenshot_74fdafd608ec4a8e84198e29630c4abe.png')
print('size:', img.size)
w, h = img.size
px = img.load()
bg = (11, 14, 20)
# scan baris/kolom yang beda dari background
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
rows = [y for y in range(h) if row_diff(y)]
cols = [x for x in range(w) if col_diff(x)]
rmin, rmax = rows[0], rows[-1]
cmin, cmax = cols[0], cols[-1]
print('bbox:', rmin, rmax, cmin, cmax)
p = 12
box = (max(0, cmin - p), max(0, rmin - p), min(w, cmax + p), min(h, rmax + p))
cropped = img.crop(box)
out = '/home/ubuntu/charon/pnl-card-example.png'
cropped.save(out, optimize=True)
print('saved:', out, cropped.size)
