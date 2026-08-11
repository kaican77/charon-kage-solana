from PIL import Image

def crop_card(src, out):
    img = Image.open(src)
    w, h = img.size
    px = img.load()

    # Cari bbox non-bg: bg terminal = (10,15,10); tapi beda tiap card.
    # Lebih aman: cari bbox dari semua pixel yang BUKAN warna paling umum (background).
    from collections import Counter
    cnt = Counter()
    for y in range(0, h, 5):
        for x in range(0, w, 5):
            cnt[px[x, y][:3]] += 1
    bg = cnt.most_common(1)[0][0]
    print('bg:', bg)

    def diff(x, y):
        r, g, b = px[x, y][:3]
        return abs(r - bg[0]) > 25 or abs(g - bg[1]) > 25 or abs(b - bg[2]) > 25

    rows = [y for y in range(h) if any(diff(x, y) for x in range(0, w, 3))]
    cols = [x for x in range(w) if any(diff(x, y) for y in range(0, h, 3))]
    if not rows or not cols:
        print('nothing', src)
        return
    rmin, rmax = rows[0], rows[-1]
    cmin, cmax = cols[0], cols[-1]
    print('bbox:', rmin, rmax, cmin, cmax, 'size:', cmax-cmin+1, 'x', rmax-rmin+1)

    side = 400
    cx = (cmin + cmax) // 2
    cy = (rmin + rmax) // 2
    box = (max(0, cx - side//2), max(0, cy - side//2), min(w, cx + side//2), min(h, cy + side//2))
    card = img.crop(box)
    if card.size[0] != side or card.size[1] != side:
        canvas = Image.new('RGB', (side, side), bg)
        canvas.paste(card, ((side - card.size[0])//2, (side - card.size[1])//2))
        card = canvas
    card = card.resize((800, 800), Image.LANCZOS)
    card.save(out, optimize=True)
    print('saved', out, card.size)

import sys
crop_card(sys.argv[1], sys.argv[2])
