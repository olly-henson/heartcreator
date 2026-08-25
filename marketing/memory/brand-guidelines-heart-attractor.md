# Brand Guidelines — Heart Attractor (VSL / Skool Platform Spec)

> Confirmed 2026-08-19. This is the **Heart Attractor-specific** design system — distinct from the generic `brand-guidelines.md` (Olly Henson Coaching umbrella brand). Use this file for the VSL, Skool About Page slides, and any Heart Attractor product visual asset. If the two files conflict, this one wins for Heart Attractor work.

---

## Colour Palette (exact hex)

| Name | Hex | Use |
|------|-----|-----|
| Background gradient (odd slides) | `#4B1466` → `#150818` → `#0A0510` | VSL slide background |
| Background gradient (even slides) | `#3D1252` → `#150818` → `#0A0510` | VSL slide background, alternates with odd |
| Primary accent (magenta/violet) | `#B84FE8` | Badges, CTAs, key highlights |
| Accent gradient (headline highlight) | `#B84FE8` → `#E1A6FF` | Gradient text treatment on headlines |
| Body text | `#EBD9E2` | Body copy |
| Headlines | `#fff` | Headline text |
| Badge/eyebrow text | `#B84FE8` on transparent, border `rgba(184,79,232,.4)` | Eyebrow labels above headlines |

## Typography

**Poppins** (weights 400/500/600/700/800). No serif anywhere.

- Badge/eyebrow: 14px, semibold, uppercase, 0.05em letter-spacing
- Headline: 40–64px, weight 800, line-height 1.15
- Body: 24–32px, weight 400, line-height 1.4–1.5
- Big step numbers/accents: 48–96px, weight 800, accent color

## Tone

Dark, cosmic/moody background with a **single** vivid magenta-to-violet accent — everything else muted/neutral, no competing colors. Warm but credible; mechanism-led, not hype-led.

**Avoid corporate/SaaS-feeling chrome** — bordered badge pills, dashed rings, perfectly symmetric layouts read as "too corporate" per direct feedback. Prefer asymmetry, glow, organic curves for a warmer feel while keeping structure legible.

## Design Principles

- Never perfect symmetry for "warm" brand assets — vary sizing, asymmetric spacing, organic curves.
- Fill canvas richness (corner glows, subtle scattered dots/stardust) rather than leaving flat empty space.
- Consistent spacing scale (8px-based), not ad-hoc pixel values.
- Real screenshots should never be upscaled past native resolution (causes blur) — cap target width at source width, apply light UnsharpMask if needed for crispness after any downscale.

---

## VSL / About Page Layout Spec

**Platform:** Skool About Page, full-screen slides (100vh), scroll-snap between them.

**Layout:** 50/50 split — webcam box (left, 4:3 aspect) + text column (right). Image placeholders: 16:9 aspect, ~70–80% of text column width, 20px border-radius (matches webcam box radius). Nav dots on right edge + progress label top-left ("STEP X / Y").

### Hard-won layout lessons (from iterative Claude Code debugging)

When specifying layout fixes to a coding agent, always define **explicit relationships** between elements, not just individual values — this was the recurring root cause of a multi-round debugging loop:

- Column widths must be explicit (`1fr 1fr` grid), not content-sized (`auto auto`), or the row won't center properly and leftover space dumps unevenly to one side.
- The whole row must be explicitly centered (`margin: 0 auto` or `justify-content: center`) within the usable width (viewport minus any fixed nav rail) — never assume centering happens automatically.
- Any decorative UI overlay (e.g., a platform's own menu button) must be excluded from centering/fit calculations.
- Vertical fit: compute the full stack's required height (image + gaps + text, accounting for real wrapped line counts) against the actual available frame height before finalizing font sizes — text must never be clipped/truncated; if it doesn't fit, shrink images first, then fonts, never truncate text.
- Match sibling elements' sizes/bottoms explicitly (e.g., "image width ≤ webcam width," "both columns end at the same y") — nothing should float independently.
- Always verify with actual measured/logged numbers (gutters, computed heights) before declaring a fix done — visual "looks fine" checks repeatedly missed real mismatches.

### Final VSL headline slide copy

> **The Attraction Formula**
> A simple daily meditation practice that rewrites the subconscious programs blocking you from love

---

## Key Visual Assets Built (2026-08-19 session)

- **The Attraction Formula wave graphic** — a coherence-wave diagram (one tall peak "Regulate," three smaller rhythmic peaks "Rewrite / Remember / Relive"), chosen as an accurate representation of real HRV/heart-coherence waveforms, not just decoration. Final approved version: title above, wave below, brand colors. Exported 1920×1080 (locked/final).
- **Belief rewrite graphic** — "Old Belief → New Belief" pairing all 5 core Internal Working Models with secure counterparts. Exported 1080×1350 (Instagram 4:5 post format).
- **"What's Inside" composite** — real Skool screenshots (Classroom + Community feed) framed as overlapping windows on brand background. Exported 1920×1080. Built from actual product screenshots, not mockups.
- **Cover/thumbnail image** — "Attract Your Partner" black & white wedding photo of Olly and his wife with gradient script title treatment.

---

## Platform/Technical Notes

- **Skool thumbnail spec: exactly 1460×752px.** Mismatched aspect ratios cause cropping/UI overlap issues (confirmed via Skool community forum reports of Skool's own menu button overlapping thumbnail content when source image doesn't match spec).
- **GHL email spacing:** blank lines inside a single text block are unreliable — GHL applies automatic 1em block margins that can collapse manually-typed blank lines. Fix: use GHL's dedicated Spacer element between text blocks (Marketing → Emails → Templates → Add Elements (+) → Spacer) rather than relying on blank lines, especially for the gap after the final line of body text before a footer/signature.
- **Instagram hashtags (2026 platform behavior):** Instagram removed hashtag-following in Dec 2024 and capped posts to 5 hashtags in Dec 2025. Hashtags now function as AI topic-labeling, not discovery/targeting — keyword-rich captions and on-screen text (which Instagram's AI reads/transcribes) matter far more for reaching a specific audience than hashtag selection.
