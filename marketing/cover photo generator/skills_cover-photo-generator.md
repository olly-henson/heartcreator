# Skill — Cover Photo Generator

How to **use** the tools to make a cover, and how to **improve** them.
Read this and the folder `CLAUDE.md` before either.

Four tools in this folder:

- **`cover-photo-generator.html`** — the **community / hero cover**.
  Output 1920 × 1020 PNG (Skool cover ratio 1084 × 576). Doubles as a mobile
  Facebook ad creative. Sections A–C below.
- **`program-cover-generator.html`** — the **classroom course covers**: text
  only, big bold white capitals on flat purple (since 2026-10-22).
  Output 1460 × 752 PNG (Skool classroom thumbnail spec). Section D below.
- **`about-page-tile-generator.html`** — the **Skool About Page tiles** for the
  three steps. Output 1400 × 790 PNG. Same look as the old photo classroom covers but
  keeps the section **sub text**. Section E below.
- **`join-card-generator.html`** — a **risk-free checklist + real group-card
  screenshot** promo graphic (checklist left, arrow pointing at an uploaded
  screenshot right). Output 1600 × 900 PNG. Different layout family, own
  local-storage save/load. Section F below.
- **`relationship-ad-generator.html`** — the tool behind the **live Skool
  cover / Facebook ad**: dark left panel with headline + CTA pill, photo right.
  Output 1920 × 1080 PNG. Section G below.

---

## 0. Find the right tool first

Olly names tools by what they make ("the cover photo tool", "the risk-free
tile"), not by file name, and several tools share wording. **Before opening or
editing anything, match his reference image or wording to a tool**: grep each
`.html` for its distinctive text (e.g. `FIND OUT MORE` → relationship ad,
risk-free checklist → join card) and check the output size. On 2026-09-25 I
opened `cover-photo-generator.html` (similar "Attract someone... Build Your Life
With" copy) and added a Save feature to it; his live cover actually came from
`relationship-ad-generator.html`. Open the tool for him with
`Start-Process "<full path>"` and give the `file:///` link too.

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

- **Build the plain version Olly describes first, then iterate.** He cut off
  a three-layout question with "just set that first and then we can play
  around with it". Make exactly the change he stated, render it, show it; offer
  refinements after. Add controls one per request (as with the join card).
- **Per-element size sliders multiply the auto-fitted size** (relationship ad:
  `s1`/`s2`/`s3`/`btnsz`), so each slider changes only its own element; let
  line spacing follow each line's size; add new sliders to the saved-ids list.
- **Pinned preview**: wrap the canvas in a `position:sticky; top:0` container
  capped at ~45vh so slider changes stay visible while scrolling (Olly asked
  for "a preview option to see the changes"; the canvas already live-updated,
  it just scrolled away). Done in the relationship ad; offer it for the others.
- **Changing a layout that has a save**: bump the storage key, and when an old
  save loads, keep its sliders/colours but ignore texts and drag offsets that
  belong to the old layout (they'd overwrite the new defaults).
- **Checking a render without Olly**: `chrome --headless=new --screenshot`
  with `--virtual-time-budget=6000` into the session scratchpad works for the
  top of the page. Screenshots of a *scrolled* page come out blank (even for an
  unchanged old version), so it can't prove sticky/scroll behaviour; say so.

### Never

- **Never** edit a tool before confirming it's the one that made Olly's
  reference image.
- **Never** lead with a menu of design options when Olly has described what
  he wants; build that first.
- **Never** change a layout without handling the existing saved state (it can
  silently restore the old text over the new layout).
- **Never** start building when Olly says he's getting reference images. Back
  up, stop and wait, then match the reference (2026-10-22: the classroom
  covers were rebuilt from his screenshot, not from my guess).
- **Never** add photos, eyebrows, brand marks or effects to the classroom
  covers. They are text only on flat purple.

### Backlog / ideas (do only if asked)

- A style toggle: "bottom bar" vs "right-third block" vs "top strip".
- Per-word colour pickers pinned to the brand tokens.
- A 4:5 output mode for a dedicated FB feed ad.
- Live "thumbnail preview" pane at ~300 px so the small-size check is built
  in (offered to Olly 2026-09-25 alongside the pinned preview; not requested yet).
- Save changes on the remaining tools (Olly asked for Save "on the tools";
  cover builder, join card and relationship ad have one now).
- Snap-to-centre / edge guides on the drag.

---

## D. `program-cover-generator.html` — classroom course covers (text only)

Rebuilt 2026-10-22. Read the **Tool 2** section of `CLAUDE.md` first.

### What it is

Skool classroom course covers at **1460 × 752** (exact spec). An editable list
of covers (add / rename / remove). Defaults: GET STARTED, THE ATTRACTION
FORMULA, BONUS MATERIALS, THE CONSCIOUS CREATOR PROGRAM.

### Design rules (locked with Olly, 2026-10-22)

1. **Text only.** Flat brand-purple background (default `#4B1466`; swatches
   `#3A0F52`, `#5E1A80`, `#150818`), the course name in big, bold, white
   capitals, centred, Poppins 800. Olly: "just going to say exactly what it is",
   e.g. GET STARTED in big bold letters.
2. Nothing else on the cover: no photo, no eyebrow ("STEP 01"), no brand mark,
   no glow, no stardust, no gradient text.
3. Reference look: plain block-colour course tiles (dark red tiles with white
   bold caps, two or three balanced lines, generous margins), restyled in our
   font and colours.
4. Lines are **balanced** (no lone word on the first line) and the text
   shrinks to fit 80% width × 66% height. `|` forces a break.
5. Thumbnail test: the mini preview at ~300 px must still read.

### Improving it

- Self-contained: one `render(i)`, one Google Fonts `<link>`, no build.
- **Load the font before drawing:** `document.fonts.load('800 100px Poppins')`
  then boot. `document.fonts.ready` alone let the canvas draw in a system font,
  because the panel UI never used weight 800.
- Saved state is in localStorage key `attraction-formula-classroom-covers-v2`.
  A saved cover list overrides the defaults, so when you add a default cover,
  tell Olly to use **+ Add cover** if he'd already saved.
- Preview with headless **Edge** (Chrome isn't installed here), via PowerShell:
  `& "C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe" --headless=new --disable-gpu --window-size=1500,1000 --virtual-time-budget=10000 "--screenshot=<scratchpad>\pcg.png" "file:///<scratchpad>/pcg.html"`.
  To show another cover, copy the file to the scratchpad and change
  `select(0)` in `boot()` to `select(n)`. Test a short, a medium and a long name.
- The old photo + eyebrow version (Regulate / Rewrite / Rehearse, veil, panel,
  stardust) is kept as `program-cover-generator.photo-version-backup.html`.
  Its lessons that still apply to any canvas tool: never let one slider's value
  also drive another effect's mask, and if a control only works under a
  condition (e.g. a photo is loaded), say so next to the control.

---

## E. `about-page-tile-generator.html` — Skool About Page tiles

Built 2026-09-09. A fork of tool D (Section D) — read that first; only the
differences are listed here.

- **Output 1400 × 790** (the About Page tile size Olly specified), not 1460 × 752.
- **Sub text is shown** under the keyword — this is the whole reason it's a
  separate tool. The three defaults are Olly's step descriptions (see
  `CLAUDE.md` Tool 3). Wrapped, left-aligned, its own **Sub text size** slider.
- **Eyebrow has its own size slider** (**Eyebrow size**, 70–180%); the accent
  rule's gap to the text scales with it.
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

---

## F. `join-card-generator.html` — risk-free / benefits + join card

Built 2026-09-17, from a screenshot Olly shared of a competitor's Skool promo
("Maker School"): a checklist of benefits on the left, a mocked/real group
card on the right, a hand-drawn arrow pointing at the join button. Output
**1600 × 900**. Not a fork of tools D/E — a different layout family (two
columns, no full-bleed photo veil), built fresh.

**Real screenshot, not an illustrated mock.** First built as a fully
canvas-drawn card (wordmark, description, member/online/admin stats, price
button all drawn from scratch). Olly's actual instruction: "I will take a
screenshot and let's use that... that's what Maker Skool has done." The
canvas mock was rebuilt to instead accept an **uploaded screenshot** of
Olly's real Skool group card, sized/positioned to fit the frame — real member
count, real description, real price, zero risk of the mock drifting out of
sync with the live group. **Lesson: when a reference example is itself a
screenshot of something real (not a designed graphic), ask early whether
Olly wants the same — an authentic screenshot embed — rather than defaulting
to a fully illustrated recreation.** It's both more credible and less
ongoing-maintenance.

Key structure:
- Left column: editable headline + up to N bullet textareas (`p0`..`p3` — a
  4th (`p0`) was added mid-session as the *first* bullet; new bullets get
  added by adding a new textarea + including it in the `points` array, the
  `TEXT_IDS` save/load list, and the input-listener array — **all three**,
  easy to forget one).
- Bullet block has its own **spacing**, **vertical position**, **text size**
  sliders — added incrementally as Olly asked for each, one at a time. Don't
  pre-build controls speculatively; this tool grew its whole control surface
  from individual small requests across one session.
- Right column: an uploaded screenshot (`state.img`), sized via **Screenshot
  size** (width in px, height follows the image's real aspect ratio — compute
  this from the actual uploaded image dimensions, don't hardcode a guessed
  ratio) and **Vertical position**.
- A hand-drawn arrow (`drawArrow()`) connects the last bullet's actual
  rendered bottom-right corner (via `wrapText`'s returned `{width,
  lastLineY}`, not a guessed fixed offset) to a point on the screenshot set
  by **Arrow: point at %**. Tuned this session to a chunky, more-curved,
  wide-barb style: stroke width **16.6px**, barb angle **0.75 rad** off the
  shaft, perpendicular bow of **32% of the arrow's straight-line length** —
  use these as the current "good" defaults if asked for a similar arrow
  elsewhere, rather than re-deriving from scratch.
- **Local save/load via `localStorage`** (not the `STEPS`-array pattern of
  tools D/E, since this tool has no multi-cover selector) — a "Save changes"
  button serialises every text field + slider + the screenshot (as a
  re-encoded data URL) to `localStorage`, and reloads it automatically next
  time the file is opened in that browser. Photo save uses
  `canvas.toDataURL()` on a throwaway canvas the image's own size, not the
  original upload blob — keeps it simple, no separate file-storage step.

---

## G. `relationship-ad-generator.html` — live Skool cover / Facebook ad

The tool that made the cover currently on Skool ("ATTRACT / SOMEONE / That You
Can / BUILD YOUR / LIFE WITH" + "FIND OUT MORE"). Canvas **1920 × 1080**.
Skool's cover is 1.88 : 1, so it trims a thin strip top and bottom: keep text
off those edges.

- **Layout:** photo right-anchored; dark left panel (`panelw`, base/glow
  colours, brightness, blend width); headline block top-left inside the panel,
  draggable; gradient CTA pill (`#E1A6FF → #d946ef`) directly under it.
- **Headline, since 2026-09-25: 3 lines**, `ln1`/`ln2`/`ln3` = **ATTRACT / YOUR /
  SOULMATE** (lilac 800 / off-white 600 / lilac 800), all one size, button
  underneath. Block (lines + button) is **vertically centred**; `hl` scales it.
  Size = min(width cap from the widest line, height cap `H*0.80/4.1`).
  Per-line sliders `s1`/`s2`/`s3` and button `btnsz` (Olly, 2026-09-25) multiply
  that auto-fitted size, so each changes only its own line; line spacing follows
  each line's size; they are in `ids`, so Save stores them.
  Olly's brief: the cover must work as a **Facebook ad** and **stand out in
  Skool Discovery**, so fewer words, bigger. He wants to "set that first and
  then play around with it", so styling is not locked.
- **Save:** built-in "Save my changes" → localStorage key
  `attraction-formula-relationship-ad-v2` (sliders, colours, texts, drag
  offset; not the photo itself). A v1 save (old 5-line layout) still loads
  its sliders and colours, but its texts and drag offset are ignored.
- Headless check: `chrome --headless=new --screenshot` into the session
  scratchpad with `--virtual-time-budget=6000` renders the canvas with the
  embedded photo. First render (defaults): SOULMATE runs to the panel's
  fade edge; suggest Headline size ~90% or a wider panel if Olly's export
  shows the same.

---

## H. `roadmap-generator.html` — Skool roadmap image

Built 2026-09-28. Olly's brief: an image for Skool that "clearly shows the
direction and steps someone needs to take (with a reason for each one)" to
attract their soulmate. Portrait **1080 x 1350** so reasons read on a phone.

- **v2 (same day), styled after Olly's reference** (a "Business Timetable"
  infographic): a thick road snaking in two rows. Row 1 left to right: START
  dot, 1 REGULATE, 2 REWRITE; U-turn down the right; row 2 right to left:
  3 REHEARSE, heart. Big two-tone ring nodes (light left half, dark right half,
  dark centre) with drawn icons: waves / pencil / eye+sparkle / heart; number
  badges 1-3; white chevrons on the road; small dot+dash accents; title
  centred between two dotted lines. One colour per road segment: lilac,
  violet, magenta, pink-lilac.
- v1 (a single vertical path) was replaced. Its save key
  (`ohtools:roadmap-generator`) is ignored; v2 uses `ohtools:roadmap-generator-v2`.
- **Layout is measured, not fixed**: row 2 sits below row 1's tallest label
  block (`label(..., draw=false)` measures), the road is centred in the space
  under the heading, and the U-turn is clamped 80px inside the right edge.
  First render with fixed rows put row-1 reasons over the Rehearse circle.
- Defaults: title YOUR ROADMAP, subtitle "Follow these steps in order to
  attract your soulmate.", REGULATE 7 DAYS / REWRITE 30 DAYS / REHEARSE (no
  length), reasons = Olly's About Page tile wording, heart = ATTRACT YOUR
  SOULMATE + "Someone you can build your life with.". All editable.
- **"What you'll do" box** under each reason (`w1`-`w3`, Olly 2026-09-28: "what
  they will actually be doing specifically"): a tinted box headed WHAT YOU'LL
  DO. Defaults are MY drafts from known facts (daily use is a guess; Rehearse
  is vague), flagged to Olly for his wording. The canvas grows taller than
  1350 when the text needs it (`BASE_H`, re-render on height change).
- **2026-09-29: rebuilt from Olly's Skool roadmap post** (his words, condensed;
  the post is the source of truth for this image's copy). Added an **"Ask for
  help" banner** under the title (`helpt`/`helpx`: his "most important point"
  is ongoing, not a step, so it's a banner, not a node) and a **"Why this
  order?" note** under the road (`whyt`/`whyx`). Save key bumped to
  `ohtools:roadmap-generator-v3` so older saves can't hide the new defaults.
  Rewrite = "30-day" per the post. Image is now ~1900px tall.
- **2026-09-29 (later): LANDSCAPE, one row** (Olly: "more landscape"). Canvas
  1920 wide x 1080+ (grows with text). Road runs left to right with gentle
  waves: START, **ASK FOR HELP** (speech bubble, tag ALWAYS, no number badge;
  Olly: make getting help "actually one of the sections"), 1 Regulate,
  2 Rewrite, 3 Rehearse, heart. Five equal columns (160 to W-70, maxW colW-18).
  Text cut to one short line each from his post; "What you'll do" boxes and
  the banner are empty (hidden) by default. "Why this order?" note is
  line-balanced (no orphan word). Save key `ohtools:roadmap-generator-v4`.
  The two-row snake / right-hand turn notes below apply to the old portrait version.
- Preview Artifact: https://claude.ai/artifact/JAh4eDJ7WBp2V9JDd1uuYV (Download
  PNG doesn't work inside the Artifact viewer; download from the local file).
- The right-hand turn is a rounded corner / straight drop / rounded corner,
  fixed 80px inside the right edge; a semicircle ran off the image once the
  rows moved apart.
- Sliders: title, step name, reason, circle size. Save / Back to defaults /
  pinned preview / Download `attraction-formula-roadmap.png`.

---

## Changelog

**2026-09-28 — Skills review of the 2026-09-25 session**
- New Section 0 "Find the right tool first". Why: I edited the wrong tool
  because two tools share headline wording.
- Section C: rules for building the plain version first (Olly interrupted an
  options question), per-element size sliders, the pinned preview pattern,
  save-key migration on layout changes, and the headless-screenshot limit;
  plus a Never list. Why: each came from a request or correction this session.
- Backlog: thumbnail pane marked as offered; Save on remaining tools logged.

**2026-09-25 — relationship-ad-generator.html → 3-line "Attract your soulmate"; Save added to tool 1**
- Olly asked for "the cover photo tool" with "Attract someone to build your
  life with". I opened `cover-photo-generator.html` (it has similar wording)
  and added Save changes to it. His screenshot showed the finished cover came
  from `relationship-ad-generator.html` (which already had a save).
  **Lesson: match his reference image to a tool (grep each tool for its
  distinctive text, e.g. "FIND OUT MORE") before opening or editing.**
- Tool 1 (`cover-photo-generator.html`) gained **Save changes / Back to
  defaults**: localStorage `ohtools:cover-photo-generator` for settings,
  IndexedDB `ohtools`/`photos` for the chosen photo. Not tested in Olly's
  browser yet. Olly also asked for Save in "the tools you've built"; which
  others still need it is open (join card and the ad generator already have
  one).
- Section G added. Headline cut from 5 lines to ATTRACT / YOUR / SOULMATE +
  FIND OUT MORE, on Olly's instruction; he'll adjust the styling next.
- Olly interrupted a 3-option layout question to say "just set it first, then
  we can play around". **With Olly, build the plain version he described
  first, then iterate; don't lead with options.**

**2026-09-22 — Post-session review (join-card-generator.html built, program-cover-generator.html panel bug fixed)**
- **New tool documented**: Section F, `join-card-generator.html` — built from a
  competitor screenshot Olly shared, real-Skool-screenshot approach (not an
  illustrated mock) per his explicit instruction, bullet block controls grown
  incrementally, arrow tuned to specific numeric defaults worth reusing.
- **Real bug fixed in tool D** (`program-cover-generator.html`): "Veil
  strength" was coupled into the panel's coverage mask alpha, not just its
  colour intensity — lowering it for a subtler look was silently eating the
  solid coverage behind the headline too, so "light veil, still fully
  covered" was impossible. Fixed by decoupling the mask's alpha from `sc`.
  Added as a standing rule in Section C: trace which canvas op each slider
  touches before assuming two sliders are independent.
- **"Copy settings from another cover" looked broken twice** — root causes
  were conditional rendering (`if (hasImg)`) and several covers sharing
  identical defaults, both correct behaviour that reads as a bug from the
  outside. Added a rule: state a control's precondition in its hint text up
  front, don't wait for it to be reported as broken.
- Added `join-card-generator.html` to the top-of-file tool listing.

### 2026-10-01 — Attraction Score cover added to `program-cover-generator.html`
- 7th cover: selector button **Score** (`data-step="6"`), eyebrow **CHECK YOUR**, keyword **ATTRACTION SCORE**, no photo. Added at the end of `STEPS` and `STEP_LABELS`. Saved state is restored by index, so the six existing covers keep their saved settings.
- It's for a new Skool classroom "Check Your Attraction Score" (tool: `delivery/attraction-score-snapshot.html`). Headless check: the keyword fits the frame and reads at thumbnail size.

### 2026-10-22 — Classroom covers changed to text only

- `program-cover-generator.html` rebuilt: flat brand purple, big bold white centred capitals (Poppins 800), no photos, eyebrow, brand mark, glow or stardust. Olly's reference was plain block-colour course tiles that say exactly what the course is.
- Balanced line wrapping, auto-shrink to fit, editable cover list, 4 purple swatches, text size slider.
- Lesson learned: load `800 100px Poppins` with `document.fonts.load` before drawing; `document.fonts.ready` alone let the canvas fall back to a system font.
- Old version kept as `program-cover-generator.photo-version-backup.html`. Section D above describes the old photo version.

### 2026-10-22 — Skill review
- Section D rewritten for the text-only covers. The old photo rules (veil, eyebrow, photo embedding, locking a framing, Chrome preview path) were removed because Olly overrode them; the two general canvas lessons are kept as one line.
- Never list: wait for reference images when Olly says they're coming; no photos or extras on classroom covers.
- Top-of-file listing and Section E wording updated to match.
- Added the "The Conscious Creator Program" default cover (Olly asked) and the "saved list overrides defaults" note.

