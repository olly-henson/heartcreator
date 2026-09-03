# Cover Photo Generator — Claude Instructions

## What this is

A single self-contained HTML tool — `cover-photo-generator.html` — that Olly
opens in Chrome to produce **cover images for the Heart Attractor / The
Attraction Formula Skool community**. The same output doubles as a **mobile
Facebook ad creative**.

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
