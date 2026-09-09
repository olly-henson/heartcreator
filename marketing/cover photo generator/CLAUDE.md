# Cover Photo Generator — Claude Instructions

## What this is

This folder holds **two** self-contained HTML tools Olly opens in Chrome:

1. **`cover-photo-generator.html`** — the **community cover** (hero image for the
   Skool group; doubles as a mobile Facebook ad creative). Output **1920 × 1020**.
2. **`program-cover-generator.html`** — the **classroom module covers** for
   *The Attraction Formula* (one per module inside Skool). Output **1460 × 752**
   (Skool's exact classroom thumbnail spec). See the dedicated section below.

Everything from here down to that section is about tool 1.

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

Built 2026-09-09. Makes the **classroom module covers** for *The Attraction
Formula* inside Skool. Output **1460 × 752** (Skool's exact classroom thumbnail
spec — any other ratio crops and the Skool menu button overlaps the art).

### What it produces

Four covers, chosen with the **01 / 02 / 03 / Start** buttons:

| Button | Eyebrow (default) | Keyword (default) |
|---|---|---|
| 01 | STEP 01 | REGULATE |
| 02 | STEP 02 | REWRITE |
| 03 | STEP 03 | REHEARSE |
| Start | START HERE | GET STARTED |

The three R's — **Regulate → Rewrite → Rehearse** — are the module steps Olly
teaches. NB this is a **three**-R sequence with *Rehearse*, which differs from
the "Four R's (Regulate/Rewrite/Remember/Relive)" in
`memory/brand-guidelines-heart-attractor.md` and the argument sheet. Olly is
aware; treat the classroom module naming as its own thing until the wider
positioning docs are reconciled.

### Design (locked with Olly, 2026-09-09)

- **Only** an eyebrow + the big keyword. Ghost background number and the body /
  description line were both explicitly removed — the keyword is the whole focus.
- Cosmic gradient bg `#4B1466 → #150818 → #0A0510`, single magenta accent
  `#B84FE8`, light accent `#E1A6FF`, brand mark "THE ATTRACTION FORMULA"
  bottom-left. Poppins only. Follows `memory/brand-guidelines-heart-attractor.md`.
- Each cover can carry **its own photo** of a person doing that step's work,
  full-bleed behind a magenta **veil** (kept heavy on the left so the keyword
  keeps contrast). Step 1 ships with an embedded default
  (`../assets/step-regulate-source.png`); the rest start photo-less.
- Keyword auto-shrinks if it would run past the safe area.

### Structure

- `STEPS` array — one object per cover: `{ eb, n, img, ix, iy, iz, scrim }`
  (eyebrow, keyword, Image obj, x %, y %, zoom %, veil %). Per-cover photo +
  framing are held here, in memory only — nothing is persisted, so slider
  positions reset on reload. To make a framing permanent, bake the `ix/iy/iz/
  scrim` numbers into the `STEPS` default for that cover.
- One `render()`, redraws on every control change. `EMBEDDED_REGULATE` near the
  top holds the Step-1 photo as a base64 data URI (injected via a python
  `str.replace` on a `__REGULATE_B64__` placeholder — don't hand-edit the blob).
- Controls: cover selector · Eyebrow · Keyword · Choose image / Remove ·
  Image X / Y / zoom · Veil strength · Keyword size · Glow strength · Stardust ·
  Gradient on keyword · Download this PNG · Download all 4 · Reset text.

### Swapping / adding a photo

Same pattern as tool 1: resize ≤1600 px wide with PIL, `quality≈82`,
base64-encode, replace the placeholder/constant via python (not the Edit tool —
the blob is ~270 KB). Or just hand Olly the tool and let him use **Choose
image…** at runtime.

After any change, tell Olly to **reload the file in Chrome**.
