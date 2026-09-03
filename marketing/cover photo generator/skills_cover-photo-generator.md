# Skill — Cover Photo Generator

How to **use** the tool to make a cover, and how to **improve** the tool.
Read this and the folder `CLAUDE.md` before either.

Tool: `cover photo generator/cover-photo-generator.html`
Output: 1920 × 1020 PNG (Skool cover ratio 1084 × 576). Doubles as a mobile
Facebook ad creative.

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
