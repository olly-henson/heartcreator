# Skill — Cover Photo Generator

How to **use** the tools to make a cover, and how to **improve** them.
Read this and the folder `CLAUDE.md` before either.

Three tools in this folder:

- **`cover-photo-generator.html`** — the **community / hero cover**.
  Output 1920 × 1020 PNG (Skool cover ratio 1084 × 576). Doubles as a mobile
  Facebook ad creative. Sections A–C below.
- **`program-cover-generator.html`** — the **classroom module covers** for
  *The Attraction Formula* (Regulate / Rewrite / Rehearse / Get Started).
  Output 1460 × 752 PNG (Skool classroom thumbnail spec). Section D below.
- **`about-page-tile-generator.html`** — the **Skool About Page tiles** for the
  three steps. Output 1400 × 790 PNG. Same look as the classroom covers but
  keeps the section **sub text**. Section E below.

---

## A. Making a cover photo

### 1. Get the photo in

- If Olly pastes a photo in chat, that is **not** a file you can read. Ask
  him to save it somewhere inside the working tree — e.g.
  `heartattractor\marketing\assets\` — and give you the filename.
- `H:\` (Google Drive for Desktop) is **not readable** — reads outside the
  working directories are blocked. Don't rely on it.
- Embed it so the tool loads it automatically:

  ```bash
  cd "…/marketing/cover photo generator"
  python - <<'EOF'
  from PIL import Image
  import base64
  im = Image.open(r'C:\path\to\photo.PNG').convert('RGB')
  w = 1400
  im = im.resize((w, round(im.height*w/im.width)), Image.LANCZOS)
  im.save('_tmp.jpg', quality=84, optimize=True)
  b64 = 'data:image/jpeg;base64,' + base64.b64encode(open('_tmp.jpg','rb').read()).decode()
  open('_b64.txt','w').write(b64)
  EOF
  # then replace the EMBEDDED_PHOTO="..." string in the HTML with the _b64.txt
  # contents (use a python replace, not the Edit tool — it's ~850 KB), and
  # delete _tmp.jpg / _b64.txt
  ```

- Keep the embedded JPEG ≤ ~1400 px wide / ≤ ~700 KB so the HTML stays
  manageable. `data:` URIs don't taint the canvas; a `file://` relative
  `<img>` **does** and breaks Download PNG — always embed.

### 2. Set sensible defaults for that photo, then hand off

You cannot see the live render. Set defaults from the photo's geometry,
tell Olly which 2–3 sliders to fine-tune, and ask for an exported PNG back.

Framing logic:
- **Portrait photo, wide frame** → no horizontal overflow. `Horizontal
  position` is dead; use **Shift left/right (px)** to move the subject.
  Tons of vertical overflow → `Vertical position` does the work.
- Put both faces in the **upper ⅔ with headroom**; the busy part (hug,
  hands, lower body) goes **under the bar**.
- **Bar height**: tall enough to fully cover the busy area, low enough that
  its feathered top clears the nearest chin with visible air. ~26–34 %.
- **Bar darkness**: 90–100. It must read as a *solid* band, not a wash —
  if you can see detail through it behind the text, it's too weak.

### 3. Check it as a thumbnail

Shrink the preview to ~¼ size (≈ 300 px wide = the Skool Discovery card and
the FB feed thumbnail). The hook `manifest LOVE / no doubts` must still be
legible. If it turns to mush, the headline is too small or there's too much
text.

### 4. Review checklist before Olly uploads

- [ ] No text touches a face, hair, or the embrace.
- [ ] Nothing critical within ~40 px of any edge (Skool crops).
- [ ] Bar edge is a soft fade, not a hard guillotine line across the photo.
- [ ] Text is centred in the bar — equal air above and below.
- [ ] Colours are brand: `#d946ef`, `#E1A6FF`, `#f8f4ff`, `#0A0510`.
- [ ] Reads in under ~1.7 s; one message only.
- [ ] Legible shrunk to thumbnail size.

### 5. Be honest

If the faces are clipped, the bar cuts awkwardly, or contrast is weak —
say so plainly. Don't wave it through to be nice; Olly asked for that
directly. Give the specific slider fix.

---

## B. Design rules (why the tool is shaped this way)

Learned over one long build session + web research on mobile FB ad creative
and text-over-photo layout.

1. **Skool crops uploaded images**, top especially. Never ship at 100 %
   scale; keep a margin buffer on every edge. (Pre-dates this tool — see
   `feedback_skool_about_page_images` memory.)
2. **Mobile thumbnail = ~1.7 s to stop the scroll.** One message, one
   focal point, one CTA at most. The brand name does **not** go on the
   image.
3. **Text lives in the negative space**, never over the subject. For a
   photo with a clear empty zone, use it; otherwise use a **bottom banner**
   over the least-busy area.
4. **Contrast-first.** White / magenta on a bright background fails. Put
   text on a solid dark bar (aim ~4.5:1). A faint gradient is not enough.
5. **Big, bold, few words.** Headline legible at 48 px+ *as displayed on a
   phone* — which means huge on the 1920-wide canvas.
6. **Emotion in the photo does the stopping** — a genuine laugh / embrace /
   eye contact. Composition tension (profile vs. forward) helps.
7. **Centre text geometrically.** The `no doubts` box is the tallest
   element; pin its centre to the middle of the bar. Don't eyeball padding.
8. Landscape 1.88:1 is fixed for the Skool cover. If Olly ever wants a
   dedicated FB feed ad, 4:5 (1080 × 1350) is a *separate* asset and
   performs better on mobile — flag it, don't force it into this tool.

Sources consulted: rule-of-thirds / negative-space guides (careerfoundry,
thenounproject, alvarotrigo); FB ad creative best practice
(adlibrary.com, genero.com, wask.co); text-overlay guidance
(coinis.com, roaspig.com, overlaytext.com).

---

## C. Improving the tool

- One file, one `render()`. Every `<input>` fires `render()` on `input`.
- Changing a **default**: update the `value="…"` on the `<input>` *and* the
  `<span id="…-v">` text next to it, or the readout lies until first drag.
- **Text metrics**: measure with `ctx.measureText`; for vertical placement
  use `actualBoundingBoxAscent/Descent` where precision matters. Don't hand-
  tune magic offsets if a measurement will do.
- **`transform: scale()` gotcha** (if a scaled wrapper is ever added): use
  `el.offsetWidth`, not `getBoundingClientRect().width`, for layout maths —
  the latter returns post-transform size.
- Keep it **self-contained**: no new external files, no build step, only the
  existing Google Fonts `<link>`.
- Preserve the **data-URI embed** pattern for the photo (canvas taint).
- After any change, tell Olly to **reload in Chrome**.

### Backlog / ideas (do only if asked)

- A style toggle: "bottom bar" vs "right-third block" vs "top strip".
- Per-word colour pickers pinned to the brand tokens.
- A 4:5 output mode for a dedicated FB feed ad.
- Live "thumbnail preview" pane at ~300 px so the small-size check is built
  in.
- Snap-to-centre / edge guides on the drag.

---

## D. `program-cover-generator.html` — classroom module covers

Built 2026-09-09. Read the **Tool 2** section of `CLAUDE.md` first.

### What it is

Four Skool classroom module covers at **1460 × 752** (exact spec — other ratios
crop and Skool's menu button overlaps the art). Selector buttons
**01 / 02 / 03 / Start** → keywords **REGULATE / REWRITE / REHEARSE / GET
STARTED**, eyebrows **STEP 01/02/03 / START HERE**. Both eyebrow and keyword are
editable text fields.

The three steps (Olly's own wording, 2026-09-09):
- **Regulate** — calm the nervous system out of survival-based, needy, attached
  energy.
- **Rewrite** — rewrite the core beliefs from the past that block love and drive
  self-sabotage.
- **Rehearse** — mentally and emotionally rehearse being with the partner until
  it already feels real.

(These body lines are **not** shown on the cover — Olly had them removed. Keep
them here as reference only.)

### Design rules (locked with Olly)

1. **Keyword + eyebrow only.** No ghost background number, no description line —
   both were explicitly cut. The keyword is the entire focus.
2. Person doing the work sits **full-bleed behind a magenta veil**, heavy on the
   left so the keyword keeps contrast. Not every cover needs a photo — "Get
   Started" ships photo-less on pure gradient.
3. Brand system from `memory/brand-guidelines-heart-attractor.md`: Poppins only,
   cosmic gradient `#4B1466 → #150818 → #0A0510`, single accent `#B84FE8` /
   `#E1A6FF`, "THE ATTRACTION FORMULA" mark bottom-left, glow + stardust, no
   bordered pills / rings.
4. Same thumbnail test as the hero cover — shrink to ~300 px, the keyword must
   still read.

### Adding a photo to a step

- If Olly names a path outside `C:\Users\Olly\AI OS\` he's authorising that one
  file — otherwise ask him to drop it in `../assets/`.
- Resize ≤ 1600 px wide, `quality≈82`, base64-encode, and replace the constant
  (Step 1 = `EMBEDDED_REGULATE`) via a **python `str.replace`**, not the Edit
  tool — the blob is ~270 KB. Pattern:

  ```bash
  cd "…/marketing/cover photo generator"
  python - <<'EOF'
  from PIL import Image
  import base64
  im = Image.open(r'C:\path\to\photo.png').convert('RGB')
  w = 1600
  im = im.resize((w, round(im.height*w/im.width)), Image.LANCZOS)
  im.save('_tmp.jpg', quality=82, optimize=True)
  b64 = 'data:image/jpeg;base64,' + base64.b64encode(open('_tmp.jpg','rb').read()).decode()
  open('_b64.txt','w').write(b64)
  EOF
  # then python-replace the constant / placeholder with _b64.txt contents,
  # delete _tmp.jpg / _b64.txt
  ```

- Or don't embed at all — hand Olly the tool and let him use **Choose image…**
  at runtime (loads into that cover's slot, in memory).

### Locking a framing

Slider state (`ix/iy/iz/scrim` and the runtime photo) lives only in the browser
— it resets on reload. When Olly says he likes a framing, get the four numbers
(**Image X, Image Y, Image zoom, Veil strength**) and bake them into that
cover's object in the `STEPS` array as the new default.

### Previewing without a browser

Headless Chrome screenshots the whole page:

```bash
"/c/Program Files/Google/Chrome/Application/chrome.exe" --headless --disable-gpu \
  --hide-scrollbars --window-size=1900,1150 --screenshot="$TEMP/pcg.png" \
  "file:///C:/Users/Olly/AI%20OS/heartattractor/marketing/cover%20photo%20generator/program-cover-generator.html"
```

To preview a non-default cover, copy to a temp file and inject a
`.steps button[n].click()` into `boot()` before screenshotting; add
`--virtual-time-budget=2500`.

### Improving it

- Same self-contained rules as tool 1: one `render()`, one Google Fonts
  `<link>`, no build step, data-URI photos (no `file://` `<img>` — canvas taint).
- Changing a default: update the `<input value="…">` **and** its `<span id="…-v">`
  readout.
- The `STEPS` array is the single source of per-cover state — add a 5th cover by
  adding an object + a selector button with the next `data-step` index.

---

## E. `about-page-tile-generator.html` — Skool About Page tiles

Built 2026-09-09. A fork of tool D (Section D) — read that first; only the
differences are listed here.

- **Output 1400 × 790** (the About Page tile size Olly specified), not 1460 × 752.
- **Sub text is shown** under the keyword — this is the whole reason it's a
  separate tool. The three defaults are Olly's step descriptions (see
  `CLAUDE.md` Tool 3). Wrapped, left-aligned, its own **Sub text size** slider.
- **Three tiles only** (01 / 02 / 03 → REGULATE / REWRITE / REHEARSE). No
  "Start" tile.
- `STEPS` objects carry an extra `d` (sub text): `{ eb, n, d, img, ix, iy, iz,
  scrim }`. `EMBEDDED_REGULATE` is encoded at 1500 px wide here.
- Skool **crops the top** of About Page uploads (see
  `feedback_skool_about_page_images`) — the content block is vertically centred
  and every element stays well clear of all four edges. Keep it that way.
- Everything else — brand system, veil kept heavy on the left, headless-preview
  trick, "lock a framing by baking `ix/iy/iz/scrim` into `STEPS`" — is identical
  to tool D. Filenames: `attraction-formula-about-tile-step-0X-<name>.png`.
