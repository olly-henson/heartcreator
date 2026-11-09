"""Put a screenshot into a clean laptop mockup (white background, soft shadow).
Usage: python -I tools/laptop_mockup.py SCREENSHOT OUT.jpg [width=1400]
Made 2026-11-09 for the Plan of action step images (Olly: "they need to be mock ups")."""
import sys
from PIL import Image, ImageDraw, ImageFilter
src, out = sys.argv[1], sys.argv[2]; W = int(sys.argv[3]) if len(sys.argv) > 3 else 1400
shot = Image.open(src).convert('RGB')
sw = int(W * 0.78); sh = int(sw * 10 / 16)                       # 16:10 screen
shot = shot.resize((sw, int(shot.height * sw / shot.width)), Image.LANCZOS)
screen = Image.new('RGB', (sw, sh), shot.getpixel((2, shot.height - 2))); screen.paste(shot.crop((0, 0, sw, min(sh, shot.height))), (0, 0))
bz = int(sw * 0.025); top = int(sw * 0.035)
lw, lh = sw + 2 * bz, sh + bz + top
base_h = int(W * 0.035); H = int(lh + base_h + W * 0.09)
img = Image.new('RGB', (W, H), 'white')
x0 = (W - lw) // 2; y0 = int(W * 0.03)
sh_layer = Image.new('L', (W, H), 0); d = ImageDraw.Draw(sh_layer)
d.rounded_rectangle((x0 + 10, y0 + 30, x0 + lw - 10, y0 + lh + base_h + 25), 30, fill=90)
img.paste((200, 190, 215), (0, 0), sh_layer.filter(ImageFilter.GaussianBlur(28)))
d = ImageDraw.Draw(img)
d.rounded_rectangle((x0, y0, x0 + lw, y0 + lh), int(sw * 0.03), fill=(28, 26, 32))              # lid
d.ellipse((W // 2 - 5, y0 + top // 2 - 5, W // 2 + 5, y0 + top // 2 + 5), fill=(70, 70, 80))    # camera
img.paste(screen, (x0 + bz, y0 + top))
by = y0 + lh; bw = int(lw * 1.16); bx = (W - bw) // 2
d.rounded_rectangle((bx, by, bx + bw, by + base_h), base_h // 2, fill=(205, 205, 212))           # base
d.rectangle((bx, by, bx + bw, by + base_h // 3), fill=(225, 225, 230))
d.rounded_rectangle((W // 2 - int(bw * 0.08), by, W // 2 + int(bw * 0.08), by + base_h // 3), 6, fill=(185, 185, 192))  # notch
img = img.crop((0, 0, W, by + base_h + int(W * 0.04)))
img.save(out, quality=88)
