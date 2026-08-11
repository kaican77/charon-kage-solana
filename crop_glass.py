from PIL import Image
img = Image.open('/home/ubuntu/.hermes/profiles/kagecharon/cache/screenshots/browser_screenshot_5cf355e60840452b9dcac5ffd2fb0e08.png')
w, h = img.size
print('size', w, h)
cx, cy = w // 2, h // 2
box = (cx - 200, cy - 200, cx + 200, cy + 200)
card = img.crop(box)
card = card.resize((800, 800), Image.LANCZOS)
card.save('/home/ubuntu/charon/refs/8-glass.png', optimize=True)
print('saved center crop', card.size)
