from PIL import Image

def crop_card(src, out):
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
    if not rows or not cols:
        print('nothing found', src)
        return
    rmin, rmax = rows[0], rows[-1]
    cmin, cmax = cols[0], cols[-1]
    print(src, 'bbox:', rmin, rmax, cmin, cmax, 'size:', cmax - cmin + 1, 'x', rmax - rmin + 1)

    # card 400x400; crop exact 400x400 dari bbox (kalau bbox > 400, ambil tengah)
    side = 400
    cx = (cmin + cmax) // 2
    cy = (rmin + rmax) // 2
    box = (cx - side // 2, cy - side // 2, cx + side // 2, cy + side // 2)
    box = (max(0, box[0]), max(0, box[1]), min(w, box[2]), min(h, box[3]))
    card = img.crop(box)
    # pad kalau kurang
    if card.size[0] != side or card.size[1] != side:
        canvas = Image.new('RGB', (side, side), bg)
        canvas.paste(card, ((side - card.size[0]) // 2, (side - card.size[1]) // 2))
        card = canvas
    card = card.resize((800, 800), Image.LANCZOS)
    card.save(out, optimize=True)
    print('saved', out, card.size)

# A
crop_card('/home/ubuntu/.hermes/profiles/kagecharon/cache/screenshots/browser_screenshot_4ac0f9d905c445f79ea83d05eac0de3a.png',
          '/home/ubuntu/charon/pnl-simple-A.png')
# B
crop_card('/home/ubuntu/.hermes/profiles/kagecharon/cache/screenshots/browser_screenshot_60b574397591486991af63009fe2d730.png',
          '/home/ubuntu/charon/pnl-simple-B.png')
# C
crop_card('/home/ubuntu/.hermes/profiles/kagecharon/cache/screenshots/browser_screenshot_bdacb48a16484d3690471ac389048b1e.png',
          '/home/ubuntu/charon/pnl-simple-C.png')
# D
crop_card('/home/ubuntu/.hermes/profiles/kagecharon/cache/screenshots/browser_screenshot_63e2ae63028445af9f276037839fbdd8.png',
          '/home/ubuntu/charon/pnl-simple-D.png')
# E
crop_card('/home/ubuntu/.hermes/profiles/kagecharon/cache/screenshots/browser_screenshot_22678b396cb84b62af720621367ea402.png',
          '/home/ubuntu/charon/pnl-simple-E.png')
# F
crop_card('/home/ubuntu/.hermes/profiles/kagecharon/cache/screenshots/browser_screenshot_a8db8de5d1ad4ef7884646a472fdf2b3.png',
          '/home/ubuntu/charon/pnl-simple-F.png')
