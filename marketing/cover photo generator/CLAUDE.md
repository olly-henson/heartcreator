# Cover Photo Generator — Claude Instructions

## What this is

This folder holds **three** self-contained HTML tools Olly opens in Chrome:

1. **`cover-photo-generator.html`** — the **community cover** (hero image for the
   Skool group; doubles as a mobile Facebook ad creative). Output **1920 × 1020**.
2. **`program-cover-generator.html`** — the **classroom course covers**
   (text only on flat purple since 2026-10-22). Output **1460 × 752**
   (Skool's exact classroom thumbnail spec). See the dedicated section below.
3. **`about-page-tile-generator.html`** — the **Skool About Page tiles** for the
   three steps. Output **1400 × 790**. Same look as the old photo version of tool 2, but keeps the section
   **sub text**. See the dedicated section below.

Also in the folder, not yet documented here in full: `join-card-generator.html`
(see skills file Section F), `ad-template-generator.html`, and
**`relationship-ad-generator.html`**, the tool that made the **live Skool cover /
Facebook ad** (dark left panel, headline + "FIND OUT MORE" pill, couple photo
right, 1920 × 1080). See skills file Section G. ⚠️ When Olly says "the cover
photo tool", **match his reference image to a tool before editing anything.**
On 2026-09-25 I opened and changed `cover-photo-generator.html`, but his
finished cover came from `relationship-ad-generator.html`.

**`youtube-thumbnail-generator.html`** (built 2026-10-24) makes **YouTube
thumbnails, 1280 × 720 JPG**. It's a fork of the relationship ad tool:
dark purple panel on the left (base `#0a0510`, glow `#6b21a8`), with Olly's
photo on the right (embedded IMG_2549 from `marketing\thumbnail-photos\`; more
photos in that folder). Up to 3 text lines, each with its own style
(White / Lilac / Gradient / White lighter). Blank lines are dropped. The
default text is WHY LOVE / WON'T MOVE. There's **no CTA pill**, because
thumbnails don't take buttons. Extras compared with the ad tool:
- a "Darken the room behind you" radial vignette, since the source photos are
  taken in a bright room
- a phone-size preview
- a Save key `olly-youtube-thumbnail-v1`

Brand rules come from `marketing\youtube-thumbnail-guide.docx`: max 4 words,
face right / text left, dark background. Its Playfair font is outdated; the
brand now uses Poppins.

**YouTube banner (2026-10-24): `YouTube Cover v3.jpg` (2560 × 1440).** It's built from Olly's Gemini image `YouTube Cover v1.jpg` (1376 × 768). The whole image is scaled ×1.68 **as one piece** and centred on the dark band (rows 255–513, centre 384). Olly spotted that at ×1.5 a strip of light wall showed above and below the band in the desktop view: the band must be at least 423 px tall (the desktop strip's height). Like that, it's centred, so the text + couple fill YouTube's "all devices" box (1546 × 423). The rest of the canvas is filled by **mirroring the image's own edges** (numpy `pad` mode `symmetric`).

Lessons from the two failed versions:
- Pasting a rescaled cut-out of the content onto a separately scaled wall made visible seams.
- Filling the edges with a **blur** looked washed out in YouTube's desktop/TV preview.

Olly then wanted the text and the couple closer together. The text was **moved 80px right in the original** (55, then 25 more at Olly's request):
- I lifted it with a colour mask, refilled its old spot with a vertical blend (the panel behind it is a smooth gradient), added a soft dark glow at the new spot so the white stays readable, and pasted it back.
- The group (text 326 → couple 1117) was then re-centred.
- Moving the couple instead isn't practical, because they sit on textured wall.

Image generators ignore pixel safe zones, so generate the content, then centre it in code. Check copies draw the safe zones: green = 1546 × 423, yellow = 1235 × 338, blue = the desktop strip.

Everything from here down to the Tool 2 section is about tool 1.

### Tool 1 — `cover-photo-generator.html`

Produces **cover images for the Heart Attractor / The Attraction Formula Skool
community**. The same output doubles as a **mobile Facebook ad creative**.

It renders everything to a `<canvas>` (photo + shading + text) so the
**Download PNG** button saves a pixel-perfect file with no screenshotting,
no server and no libraries. Output is **1920 × 1020** — Skool's cover ratio
(1084 × 576, i.e. 1.882 : 1).

This is a **build-and-use tool**, not production infrastructure. It is not
embedded anywhere. Nothing imports it.

## Role

When Olly asks for a new cover, or to change the tool, you are the
**Cover Photo Generator maintainer**. Read `skills_cover-photo-generator.md`
in this folder before doing either — it holds the working process and the
design rules learned the hard way.

## File

```
cover photo generator/
  cover-photo-generator.html   ← the tool (open in Chrome)
  CLAUDE.md                    ← this file
  skills_cover-photo-generator.md
```

The tool file is ~850 KB because the current source photo is **embedded as
a base64 data URI** (`EMBEDDED_PHOTO` near the top of the script). Data URIs
do **not** taint the canvas, so Download PNG keeps working — a plain
`file://` relative-path `<img>` would taint it and break the download.

## Current layout (v4 — "photo + bottom bar")

- Photo **full-bleed** on top, framed with sliders.
- One **solid dark bar** across the bottom (`#0A0510`, feathered top edge).
- One line of text, centred in the bar:
  `manifest` (light lilac `#E1A6FF`) &nbsp; `LOVE` (off-white `#f8f4ff`)
  &nbsp; `no doubts` (white on a magenta `#d946ef` rounded box).
- **No other text.** Brand name and offer are deliberately *not* on the
  image (mobile-thumbnail rule: one message, one focal point).

Headline copy is locked by Olly: **"Manifest Love – Without The Doubts"**,
expressed as `manifest LOVE / no doubts`.

## Controls the tool exposes

| Group | Controls |
|---|---|
| Photo | Choose a different photo · Horizontal position · Shift left/right (px) · Vertical position · Zoom · Black & white |
| Bottom bar | Bar height · Bar darkness |
| Text | Headline size · (drag the text on the preview to nudge) · Reset text position |
| Output | Download PNG |
| Save (2026-09-25) | **Save changes** (sliders, B&W, alignment, text position → `localStorage` key `ohtools:cover-photo-generator`; chosen photo → IndexedDB `ohtools`/`photos`, same key) · **Back to defaults** (clears both, reloads). Per Chrome profile only; file:// pages share one storage area, so namespace keys per tool. |

`Shift left/right (px)` exists because a **portrait** source photo in this
wide frame has *no* horizontal overflow, so `Horizontal position` does
nothing — the px shift moves the image bodily and the bared edge falls
under the bar.

## Palette — must stay Heart Attractor brand

- Magenta: `#d946ef` · Light accent (lilac): `#E1A6FF` · Off-white text: `#f8f4ff`
- Deep background / bar: `#0A0510` (also `#150818`, `#080010`)
- Violet `#a855f7` is in the brand set but currently unused here.

Do not introduce off-palette colours (an earlier version drifted to
`#E879F9` / `#D416EA` — corrected). Full brand system:
`C:\Users\Olly\AI OS\heartattractor\funnel\brand\brand-guidelines.md` and
`heartattractor\marketing\memory\brand-guidelines-heart-attractor.md`.

## Hard rules (see skills file for the why)

1. **Skool crops uploaded images.** Keep everything critical away from all
   four edges; never fill to 100%. Check the design shrunk to ~¼ size
   (that is the Discovery-card thumbnail) — the hook must still read.
2. **Text goes in negative space, never over a face or the subject.**
3. **Contrast first** — text sits on a *solid* bar, not a wispy gradient.
4. **One message.** Cut anything that isn't the hook.
5. **Centre text geometrically**, not by eye (the box is the tallest
   element; its centre pins to the middle of the bar).
6. Keep the tool **self-contained** — no external JS/CSS/font files beyond
   the one Google Fonts `<link>`, no build step.

## Improving the tool

Edit `cover-photo-generator.html` directly. It has one `render()` that
redraws on every control change. When you change a default, update both the
`<input value="…">` and its `<span id="…-v">` readout. To swap the embedded
photo, resize to ≤1400 px wide with PIL, base64-encode, and replace the
`EMBEDDED_PHOTO` string (see skills file for the exact snippet).

After changes, tell Olly to **reload the file in Chrome**.

---

## Tool 2 — `program-cover-generator.html`

Makes the **classroom course covers** for *The Attraction Formula* inside Skool.
Output **1460 × 752** (Skool's exact classroom thumbnail spec).

### Current design (Olly, 2026-10-22): text only

- **No photos.** A flat brand-purple background (default `#4B1466`; swatches
  `#3A0F52`, `#5E1A80`, `#150818`) with the course name in **big, bold, white
  capitals, centred** (Poppins 800). Nothing else: no eyebrow, no brand mark,
  no glow or stardust. Olly's reference: plain block-colour course tiles that
  "just say exactly what it is", e.g. GET STARTED.
- Text wraps on its own with **balanced line lengths**, and shrinks to fit a
  safe area of 80% width × 66% height. `|` forces a line break.
- Editable cover list (add / rename / remove). Defaults: GET STARTED,
  THE ATTRACTION FORMULA, BONUS MATERIALS, THE CONSCIOUS CREATOR PROGRAM.
- Download this PNG / Download all / Save my changes (localStorage key
  `attraction-formula-classroom-covers-v2`). Filenames
  `attraction-formula-<slug>.png`.
- The canvas must load Poppins 800 explicitly (`document.fonts.load('800 100px
  Poppins')`) before the first render, or it draws in a system font.
- The old photo + eyebrow version (Regulate / Rewrite / Rehearse) is kept as
  `program-cover-generator.photo-version-backup.html`.

After any change, render it in headless Edge and look at it, then tell Olly to
**reload the file in Chrome**.

---

## Tool 3 — `about-page-tile-generator.html`

Built 2026-09-09. Makes the **Skool About Page tiles** for the three steps.
Output **1400 × 790** (the About Page tile size Olly specified).

Structurally a fork of the old photo version of Tool 2 (now `program-cover-generator.photo-version-backup.html`) with two deliberate differences:

- **1400 × 790**, not 1460 × 752.
- **Sub text is shown.** Tool 2 (classroom covers) drops the description line;
  the About Page tiles keep it under the keyword. Each tile renders
  eyebrow + keyword + wrapped sub text, block vertically centred (Skool crops
  the top of About Page uploads — see `feedback_skool_about_page_images` memory —
  so nothing critical goes near an edge).

Three tiles only (**01 / 02 / 03** → REGULATE / REWRITE / REHEARSE); no "Start"
tile. Default sub text = Olly's step descriptions:

- Regulate — "Calm your nervous system out of survival-based, needy, attached energy."
- Rewrite — "Rewrite the core beliefs from your past that block love and drive self-sabotage."
- Rehearse — "Mentally and emotionally rehearse being with your partner until it already feels real."

Same brand system, `STEPS` array (`{ eb, n, d, img, ix, iy, iz, scrim }` — note
the extra `d` for sub text), `EMBEDDED_REGULATE` base64 (encoded at 1500 px wide
here), veil-kept-heavy-on-the-left, headless-preview trick, and
"lock a framing by baking ix/iy/iz/scrim into `STEPS`" rule as Tool 2. Extra
controls: **Eyebrow size** and **Sub text size**.
Filenames: `attraction-formula-about-tile-step-0X-<name>.png`.

After any change, tell Olly to **reload the file in Chrome**.
