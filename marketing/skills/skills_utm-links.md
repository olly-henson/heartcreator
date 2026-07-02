# Skills File â€” UTM Link Creation
# Trigger phrase: "UTM links please"

> When Olly says "UTM links please", follow this file exactly. Ask for the context (what platform, what content, what destination) and generate the correct UTM links. Log every link created in `memory/utm-link-log.md`.

---

## What UTM links are

Tags added to the end of a URL that tell GA4 and GHL exactly where a visitor came from. Invisible to the visitor. Stored on the GA4 Traffic Acquisition report and on each GHL contact record.

---

## The three destinations

| Destination | Base URL |
|---|---|
| Meditation Download | `https://ollyhenson.com/meditation` |
| Coaching Application | `https://ollyhenson.com/coaching-application` |
| Practice Guide | `https://ollyhenson.com/practice-guide` |
| Homepage | `https://ollyhenson.com` |

---

## UTM parameter rules

| Parameter | What it means | Rules |
|---|---|---|
| `utm_source` | The platform | `instagram`, `youtube`, `email`, `website` |
| `utm_medium` | How they got there | `bio`, `manychat`, `manychat_story`, `description`, `pinned_comment`, `nurture`, `homepage` |
| `utm_campaign` | What it's promoting | `meditation`, `coaching` |
| `utm_content` | Specific piece of content | YouTube: full video title in kebab-case (all words). Email: `email-1`, `email-2` etc. Leave blank if not applicable. |

---

## Platform reference

### Instagram

| Placement | utm_source | utm_medium |
|---|---|---|
| Bio (/links page) | `instagram` | `bio` |
| ManyChat — Reels (keyword: HEART) | `instagram` | `reels` |
| ManyChat — Stories (keyword: HEART) | `instagram` | `stories` |
| ManyChat — Stories (keyword: COACHING → coaching application) | `instagram` | `dm` |

### YouTube

| Placement | utm_source | utm_medium |
|---|---|---|
| Bio | `youtube` | `bio` |
| Video description | `youtube` | `description` |
| Pinned comment | `youtube` | `pinned_comment` |

For YouTube, always add `utm_content` with the full video title in kebab-case. Example: video titled "Why Heart Coherence Changes Everything" â†’ `utm_content=why-heart-coherence-changes-everything`

### Email

| Placement | utm_source | utm_medium | utm_content |
|---|---|---|---|
| Nurture sequence email | `email` | `nurture` | `email-1`, `email-2` etc. |

### Website

| Placement | utm_source | utm_medium |
|---|---|---|
| Homepage CTA | `website` | `homepage` |

---

## How to build a link

Base URL + `?` + parameters joined by `&`

**Formula:**
```
{base_url}?utm_source={source}&utm_medium={medium}&utm_campaign={campaign}&utm_content={content}
```

Drop `utm_content` if not applicable.

**Example â€” YouTube video description, meditation:**
```
https://ollyhenson.com/meditation?utm_source=youtube&utm_medium=description&utm_campaign=meditation&utm_content=why-heart-coherence-changes-everything
```

**Example — Instagram ManyChat Stories (coaching application):**
```
https://ollyhenson.com/coaching-application?utm_source=instagram&utm_medium=dm&utm_campaign=hcp&ref=Applied%20through%20Insta%20DM%20link
```

**Example — Instagram ManyChat Reels:**
```
https://ollyhenson.com/meditation?utm_source=instagram&utm_medium=reels&utm_campaign=meditation
```

**Example â€” Email 3 in nurture sequence:**
```
https://ollyhenson.com/coaching-application?utm_source=email&utm_medium=nurture&utm_campaign=coaching&utm_content=email-3
```

---

## Process when "UTM links please" is triggered

1. Ask: **What platform?** (Instagram / YouTube / Email / Website)
2. Ask: **What placement?** (bio / description / pinned comment / ManyChat / story / email number)
3. Ask: **What destination?** (meditation / coaching application / homepage)
4. Ask: **Video title or email number?** (only if YouTube or email)
5. Generate the raw URL(s)
6. Log in `memory/utm-link-log.md`

---

## Where links live in GA4

- **Reports â†’ Acquisition â†’ Traffic Acquisition** â€” visits by source
- **Reports â†’ Acquisition â†’ User Acquisition** â€” first-time visitors by source
- Key events (`generate_lead`, `application_submitted`) are tied to source automatically

## Where links live in GHL

- Every contact record â†’ UTM Source / UTM Medium / UTM Campaign / UTM Content fields
- Filter contacts by source in GHL Smart Lists
