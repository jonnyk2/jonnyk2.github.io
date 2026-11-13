"""Builds the site's pixel art: img/px-scene.png (the studio hero scene), img/px-knight.png (4-frame sprite strip of
the knight's corner of the scene: cape in the wind, sword glint; CSS plays it over the scene), img/og.png (link preview).
The Emberwrought screenshots are shown as captured, never pixelated. Run from the repo root:  python tools/make_pixels.py   (needs Pillow)."""
import math, random
from PIL import Image, ImageDraw

W, H = 192, 120
NAVY = (13, 11, 30)
BAYER = [[0, 8, 2, 10], [12, 4, 14, 6], [3, 11, 1, 9], [15, 7, 13, 5]]

def lerp(a, b, t):
    return tuple(round(a[i] + (b[i] - a[i]) * t) for i in range(3))

# cape outlines per animation frame (kx, ky = the knight's feet); frames 0-1-2-1 make a gust that comes and goes
CAPES = [
    [(-1, -11), (-9, -4), (-6, -3), (-12, 1), (-1, -2)],
    [(-1, -11), (-10, -6), (-7, -4), (-13, -2), (-1, -2)],
    [(-1, -11), (-11, -8), (-8, -6), (-14, -4), (-1, -3)],
    [(-1, -11), (-10, -6), (-7, -4), (-13, -2), (-1, -2)],
]
KNIGHT_BOX = (58, 68, 88, 90)  # the sprite strip's crop of the scene: x0, y0, x1, y1

def scene(frame=0):
    random.seed(7)
    im = Image.new('RGB', (W, H), NAVY)
    px = im.load()
    # sky: banded gradient with ordered dithering between bands (a 16-bit console look)
    stops = [(0, NAVY), (40, (24, 18, 52)), (70, (52, 30, 82)), (92, (96, 44, 98))]
    for y in range(H):
        for i in range(len(stops) - 1):
            (y0, c0), (y1, c1) = stops[i], stops[i + 1]
            if y0 <= y < y1 or (i == len(stops) - 2 and y >= y1):
                t = min(1, (y - y0) / (y1 - y0))
                break
        bands = 4
        for x in range(W):
            tt = t * bands
            lo = math.floor(tt)
            frac = tt - lo
            step = lo + (1 if frac * 16 > BAYER[y % 4][x % 4] else 0)
            px[x, y] = lerp(c0, c1, min(step, bands) / bands)
    # stars
    for _ in range(40):
        x, y = random.randrange(W), random.randrange(0, 50)
        px[x, y] = (243, 234, 216) if random.random() < 0.3 else (140, 128, 190)
    d = ImageDraw.Draw(im)
    # sun: coral to pink, with synthwave gaps across its lower half
    cx, cy, r = 128, 52, 30
    for y in range(cy - r, cy + r + 1):
        half = int(math.sqrt(max(0, r * r - (y - cy) ** 2)))
        t = (y - (cy - r)) / (2 * r)
        col = lerp((255, 120, 110), (255, 61, 127), t)
        if y > cy + 4 and (y - cy) % 7 in (0, 1) and y < cy + r - 2:
            continue
        d.line([(cx - half, y), (cx + half, y)], fill=col)
    # clouds
    for (x, y, w) in [(70, 30, 26), (150, 24, 20), (100, 60, 34), (164, 66, 22), (40, 46, 18)]:
        d.rectangle([x, y, x + w, y + 2], fill=(86, 66, 150))
        d.rectangle([x + 4, y - 2, x + w - 6, y - 1], fill=(86, 66, 150))
        d.rectangle([x + 2, y + 3, x + w - 2, y + 3], fill=(62, 46, 118))
    # far mountains
    far = (48, 36, 96)
    d.polygon([(40, 120), (88, 74), (104, 82), (124, 66), (140, 76), (168, 62), (192, 80), (192, 120)], fill=far)
    d.polygon([(0, 120), (0, 88), (30, 80), (60, 96), (80, 120)], fill=far)
    # castle on the high peak
    cast = (30, 22, 62)
    base_y = 70
    d.polygon([(84, 104), (106, 80), (110, 75), (142, 75), (150, 82), (176, 104)], fill=(38, 29, 80))
    d.rectangle([110, base_y - 14, 140, base_y + 6], fill=cast)
    for (x, h) in [(110, 24), (118, 30), (126, 36), (134, 28), (140, 22)]:
        d.rectangle([x, base_y - h, x + 3, base_y], fill=cast)
        d.polygon([(x - 1, base_y - h), (x + 1.5, base_y - h - 6), (x + 4, base_y - h)], fill=cast)
    for (x, y) in [(115, base_y - 8), (123, base_y - 12), (131, base_y - 9), (127, base_y - 26), (137, base_y - 6)]:
        px[x, y] = (255, 179, 107)
    # mid hills
    mid = (40, 32, 74)
    d.polygon([(0, 120), (0, 100), (50, 92), (96, 100), (150, 90), (192, 98), (192, 120)], fill=mid)
    # ruined arches on the right
    ru = (66, 54, 104)
    for x in (150, 168):
        d.rectangle([x, 80, x + 3, 104], fill=ru)
        d.rectangle([x + 12, 84, x + 15, 104], fill=ru)
        d.rectangle([x, 78, x + 15, 81], fill=ru)
        d.rectangle([x + 4, 82, x + 11, 86], fill=ru)
    d.rectangle([186, 90, 189, 104], fill=ru)
    # the cliff, with grass and flowers on its lip
    cliff = (34, 26, 60)
    d.polygon([(0, 120), (0, 92), (24, 88), (70, 86), (92, 90), (98, 100), (90, 120)], fill=cliff)
    d.polygon([(90, 120), (98, 104), (130, 108), (192, 104), (192, 120)], fill=(28, 22, 50))
    for x in range(0, 94):
        top = 86 + (2 if x < 24 else 0) + (1 if x % 9 == 0 else 0)
        if x > 70:
            top = 86 + (x - 70) // 6
        px[x, top] = (110, 191, 74)
        px[x, top + 1] = (63, 143, 58)
        if x % 5 == 0:
            px[x, top - 1] = (110, 191, 74)
    for x in range(98, 192):
        top = 104 + (1 if x % 7 == 0 else 0)
        px[x, top] = (63, 143, 58)
    for (x, y) in [(10, 87), (34, 85), (52, 85), (120, 107), (160, 103), (176, 103)]:
        px[x, y] = (230, 90, 170)
    # the knight at the cliff edge, cape blowing back
    kx, ky = 74, 86
    body = (26, 21, 48)
    d.rectangle([kx, ky - 11, kx + 3, ky - 1], fill=body)          # body
    d.rectangle([kx, ky - 15, kx + 3, ky - 12], fill=(232, 224, 208))  # helm
    px[kx - 1, ky - 15] = (232, 224, 208)
    d.polygon([(kx + dx, ky + dy) for dx, dy in CAPES[frame]], fill=(255, 61, 127))
    d.line([(kx - 1, ky - 10), (kx - 7 - (frame % 2) - (2 if frame == 2 else 0), ky - 5 - (1 if frame == 2 else 0))], fill=(176, 30, 90))
    d.line([(kx + 4, ky - 6), (kx + 11, ky + 1)], fill=(207, 214, 230))  # sword
    d.rectangle([kx + 3, ky - 7, kx + 4, ky - 6], fill=(150, 120, 80))
    if frame == 2:  # plume streams back and the blade catches the sun
        px[kx - 2, ky - 15] = (232, 224, 208)
        px[kx + 9, ky - 1] = (255, 255, 255)
        px[kx + 8, ky - 2] = (255, 220, 230)
    d.rectangle([kx, ky - 1, kx + 1, ky], fill=body)
    d.rectangle([kx + 2, ky - 1, kx + 3, ky], fill=body)
    return im

if __name__ == '__main__':
    s = scene()
    s.save('img/px-scene.png', optimize=True)
    s.resize((W * 6, H * 6), Image.NEAREST).save('img/og.png', optimize=True)  # link-preview image
    x0, y0, x1, y1 = KNIGHT_BOX
    fw, fh = x1 - x0, y1 - y0
    strip = Image.new('RGB', (fw * len(CAPES), fh))
    for i in range(len(CAPES)):
        strip.paste(scene(i).crop(KNIGHT_BOX), (i * fw, 0))
    strip.save('img/px-knight.png', optimize=True)
    print('ok')
