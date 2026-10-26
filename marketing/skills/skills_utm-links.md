# Skills File — UTM Link Creation
# Trigger phrase: "UTM links please" (or any request for a tracked link)

> When Olly asks for a tracked link, follow this file. Work out platform, placement and destination from the conversation and only ask for what's genuinely missing. Log every link created in `memory/utm-link-log.md`.

---

## What UTM links are

Tags added to the end of a URL that tell GHL (and GA4) where a visitor came from. The funnel pages read them and send them to GHL with the form; GHL saves them on the contact **only if the workflow maps them** (see "GHL side" below). The Business Hub's "Pull from GHL" groups opt-ins and applicants by them.

---

## Destinations

**Current (The Heart Attractor Program funnel, 2026-10-24):**

| Destination | Base URL |
|---|---|
| Free training opt-in (Emotional Resonance) | `https://ollyhenson.com/training` (confirm the path in GHL if unsure) |
| Application (The Heart Attractor Program) | `https://ollyhenson.com/apply` |

**Old funnel (history only, don't use for new links):** `/meditation`, `/coaching-application`, `/practice-guide`, homepage.

---

## UTM parameter rules

| Parameter | What it means | Values |
|---|---|---|
| `utm_source` | The platform | `instagram`, `facebook`, `youtube`, `email`, `website` |
| `utm_medium` | The placement on that platform | `bio`, `dm`, `story_reply`, `comment`, `description`, `pinned_comment`, `welcome_email` |
| `utm_campaign` | The offer or lead magnet it's promoting | `emotional_resonance_training` (opt-in links), `heart_attractor` (application links) |
| `utm_content` | Which video / keyword / piece | Short snake_case name: the video (`emotional_resonance_training`) or the ManyChat keyword (`video_keyword`). Leave off for bio links. |

**Why campaign and content are split this way (Olly, 2026-10-24):** campaign stays the same for everything selling one thing, so he can see "all applications"; content names the exact video, so as YouTube grows he can still see which video sent each applicant. Every new video gets its own `utm_content`; nothing else in the link changes.

---

## Platform reference

### Instagram + Facebook (ManyChat VIDEO keyword → opt-in)

| Placement | utm_source | utm_medium | utm_content |
|---|---|---|---|
| Instagram bio | `instagram` | `bio` | — |
| Instagram comment (ManyChat) | `instagram` | `comment` | `video_keyword` |
| Instagram DM (ManyChat) | `instagram` | `dm` | `video_keyword` |
| Instagram story reply (ManyChat) | `instagram` | `story_reply` | `video_keyword` |
| Facebook comment (ManyChat) | `facebook` | `comment` | `video_keyword` |
| Facebook DM (ManyChat) | `facebook` | `dm` | `video_keyword` |

Comment vs DM only tracks separately if ManyChat has a separate flow (and link) for each. Say so when giving the links.

### YouTube (→ application)

| Placement | utm_source | utm_medium | utm_content |
|---|---|---|---|
| Video description | `youtube` | `description` | the video's short name |
| Pinned comment | `youtube` | `pinned_comment` | the video's short name |

### Email

| Placement | utm_source | utm_medium | utm_content |
|---|---|---|---|
| Training welcome email (→ application) | `email` | `welcome_email` | `emotional_resonance_training` |

---

## Examples (live, 2026-10-24)

```
https://ollyhenson.com/apply?utm_source=youtube&utm_medium=description&utm_campaign=heart_attractor&utm_content=emotional_resonance_training
https://ollyhenson.com/apply?utm_source=youtube&utm_medium=pinned_comment&utm_campaign=heart_attractor&utm_content=emotional_resonance_training
https://ollyhenson.com/training?utm_source=instagram&utm_medium=bio&utm_campaign=emotional_resonance_training
https://ollyhenson.com/training?utm_source=instagram&utm_medium=dm&utm_campaign=emotional_resonance_training&utm_content=video_keyword
```

Full opt-in set: `marketing\utm-links-emotional-resonance-optin.txt`.

---

## Rules and constraints

- **Visible long links hurt clicks.** Olly spotted the pinned-comment link looking huge and spammy (2026-10-24). Wherever people can SEE the link (YouTube description, pinned comment, any post text), give a short redirect on his own domain (GHL Settings → Domains → URL Redirects), e.g. `ollyhenson.com/youtube-apply` → the full UTM link. Bio links and ManyChat buttons hide the URL, so they can use the long link.
- **Every new placement with a visible link needs its own short path** (`/youtube-apply-2`, `/apply-now-2` for the next video).
- **Check the GHL side whenever you make links for a page.** UTMs reach GHL in the webhook but are only saved if that page's workflow Create/Update Contact step maps UTM Source / Medium / Campaign / Content. Map them by TYPING `{{inboundWebhookRequest.utm_source}}` etc.: a picked chip can silently not pull the value. A contact with no UTM values shows as "Unknown" in the Hub.
- **Deliver links copy-ready**: a table for reading, plus a `.txt` saved in `marketing\` and opened in Notepad. Copying long lines out of the terminal truncated text for Olly.
- **Testing a page directly (no `?utm_…`) correctly shows "Unknown".** To test tracking, open one of the tracked links.

### Never

- Never paste a raw UTM link into visible YouTube text without offering the short redirect.
- Never invent a page path as if confirmed. Say which path you assumed.
- Never use the old medium names (`reels`, `stories`, `manychat`, `nurture`) or the old "full video title in kebab-case" content rule for new links.

---

## Process

1. Work out platform, placement and destination from context. Ask only for what's missing.
2. Build the link: `{base}?utm_source=…&utm_medium=…&utm_campaign=…&utm_content=…` (drop `utm_content` for bio links).
3. If the link will be visible, add the short-redirect path.
4. Check (or remind Olly) that the destination page's GHL workflow maps the UTM fields.
5. Give a table + save a `.txt` and open it in Notepad.
6. Log in `memory/utm-link-log.md`.

---

## Where the data shows up

- **Business Hub** → Pull from GHL → Sales tab "Where they came from" (per source) and Overview (opt-in rate / application rate, all sources together).
- **GHL** → each contact's UTM Source / Medium / Campaign / Content fields; smart lists can filter by them.
- **GA4** → Reports → Acquisition → Traffic Acquisition (if the GA4 tag is on the page).

---

## Changelog

- **2026-10-24:** Rebuilt for the high-ticket funnel. New destinations (/training, /apply); new convention (campaign = offer, content = video/keyword short name), replacing "content = full title kebab-case" and the old reels/stories/manychat mediums (overridden). Added: short redirects for visible links (Olly found the long pinned-comment link off-putting); per-placement Instagram/Facebook comment/DM table; GHL mapping check (UTMs arrived but weren't saved because the workflows didn't map them); copy-ready delivery via Notepad (terminal copy truncated text); process now infers context instead of asking four questions. Fixed broken characters in the file.
