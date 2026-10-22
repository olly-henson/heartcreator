# Messaging Tools: links and files

Every messaging and content tool built for The Attraction Formula community, with its live link and the local file it's published from. To manage or update any of them, read `skills_messaging-tools.md` in this folder first.

Last updated: 2026-10-19

## Messaging (source of truth first)

| Tool | What it's for | Live link | Local file |
|---|---|---|---|
| **Messaging Center** | ⭐ Source of truth. Core message, content pillars, Skool classroom, feed posts, About page and group description, DMs, and the side-by-side with the FitPro post | https://claude.ai/artifact/QPbzwHtvFExE8qqZKbB8ea | `marketing\messaging-center.html` |
| **One-Word Transitions** | Example posts in the FitPro "one thing you're missing" style. Tabs: Original (FitPro), Dating, AI in business, Weight loss, Trending, Current focus (your niche post) | https://claude.ai/artifact/6PHj9D8pfY5LSnjSDDugeD | `marketing\one-word-transitions.html` |
| **Belief Bridge** | Step-by-step argument builder modelled on the FitPro Authority Matrix post, with a stress test chat and survey import | https://claude.ai/artifact/EdbVXzFSYbRJ98wRckMuk9 | `marketing\belief-bridge.html` |
| **Messaging Survey** | The prospect survey whose answers feed Belief Bridge. The live version goes into a GHL page; this link is only a preview | https://claude.ai/artifact/3oNyhfCQM15GUDdPiQvn6c | `website\sections\messaging-survey.html` + `messaging-survey.gs` |

## Content

| Tool | What it's for | Live link | Local file |
|---|---|---|---|
| **Content Idea Generator** | Tabs by platform. **Instagram** tab: Reels = authority headers only (the cover title Olly reads out; he adds the rest and the CTA); Stories = connection posts (story, lifestyle, questions), one simple idea per generation, built only from Olly's connection posts sheet (hook, the sheet format used, what to film and say, optional sticker and CTA). **Skool** tab: written feed posts for paying members (member philosophy, teaching, accountability, what's normal, wins, life, engagement, welcome). **Memes** tab: popular meme templates (bell curve, Buff Doge vs Cheems, Drake, etc.) showing old belief vs the right emotional state; pick the template and where it goes (Story, Reel, Skool post, feed post) and get the text for each panel plus how to post it. "Make image" on each meme card (or "Make a meme from scratch") draws it in the page: edit the text, pick Story 1080x1920 / Feed 1080x1350 / Meme only and Light/Dark, then Save image (PNG). Templates live in `marketing\memes\templates\` and are published with the page as `memes/templates/…`. Click any title to edit it. Add to queue saves to the account database (status line shows ✓ Saved) and clears the card; an empty list auto-generates a fresh batch. Queued titles and Olly's rewrites are fed back as the standard to match; "Not this one" rejections (with reasons) are fed back as what to avoid. Separate queues for Reels, Stories, Skool posts and Memes (one `ideaqueue` db collection, items tagged by `channel`; older items sorted by their label). Queued titles are only fed back to the same type. The core message includes an AUDIENCE VOICE block from the Messaging Survey (angles and phrases); pick "What the audience told us" in the part dropdown to build from it. (It was the Consciousness Level Checker) | https://claude.ai/artifact/WsnecJvYahvCKVDevtrUqc | `marketing\consciousness-level-checker.html` (old file name kept so the link still works) |
| **Reel Title Generator** | Reel titles (the on-screen text, not the hook) | https://claude.ai/artifact/2c3YH7DXhNi4iubpTExBR4 | `marketing\reel-title-generator.html` |
| **Content Survey** | The member content survey | https://claude.ai/artifact/WfzE5mFdYRtprWcthX7mn3 | `website\sections\content-survey.html` + `.gs` |

## Images (local tools, opened in the browser)

| Tool | What it makes | Local file |
|---|---|---|
| **Join Card Generator** | The "100% risk-free" checklist with your real Skool card and an arrow (1600×900) | `marketing\cover photo generator\join-card-generator.html` |
| **Relationship Ad Generator** | Live Skool cover and Facebook ads | `marketing\cover photo generator\relationship-ad-generator.html` |
| **Roadmap Generator** | Roadmap image ([preview](https://claude.ai/artifact/JAh4eDJ7WBp2V9JDd1uuYV); download PNG from the local file) | `marketing\cover photo generator\roadmap-generator.html` |
| **Program Cover Generator** | Skool classroom covers: text only, big bold white capitals on flat purple (1460×752). Covers: Get Started, The Attraction Formula, Bonus Materials, The Conscious Creator Program; add or rename any | `marketing\cover photo generator\program-cover-generator.html` |
| Other cover tools | About page tiles, ad templates | `marketing\cover photo generator\` (see `skills_cover-photo-generator.md`) |

## Where things are kept

- **Argument sheet:** `marketing\memory\argument_sheet_heart_attractor.md` (v6, "the right emotional state", matches the Messaging Center)
- **Survey takeaways:** `messaging-tools\survey-responses.md` (each response, what it told us, what changed, patterns table)
- **Survey data:** Google Sheet via the Apps Script web app at `https://script.google.com/macros/s/AKfycbyk5IU4fKBrxD2WFCBI3TC1L2_a3wBn_FswtXzRMUfm-xXFotOn_QwfVVBofZUAD7AlIQ/exec`
- **Instagram Reel caption** (keyword ATTRACTION): in the Business Hub (hub.ollyhenson.com) and on the Messaging Center Content tab
- **Business Hub:** https://claude.ai/artifact/8nRmZKS15eztDrUTdMive5 (preview); live at hub.ollyhenson.com

Every link opens only for you until you share it. In Claude Code, `/artifacts` lists them all.

## Still to do

- [ ] Build the Find Your State training in Skool (the outline is on the Messaging Center classroom tab)
- [ ] Paste the Messaging Survey into a GHL page
- [ ] Decide whether to add the "friends aren't flawless, they just felt an emotional connection with the person they met" crack to the Messaging Center (so far only in the Content Idea Generator)
- [ ] Delete the test row (source "claude-test") from the survey Sheet
- [ ] Decide on the radio analogy, then swap it into the Current focus example post
- [ ] Confirm the price ($30/month), what HeartMath allows, and whether to mention live calls
- [ ] Update the Instagram skill files to the v6 argument
