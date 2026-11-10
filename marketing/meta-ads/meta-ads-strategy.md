# Meta Ads Strategy: First Campaign

Drafted 2026-11-10. **Changed the same day (Olly):** ads are now ManyChat comment/DM ads for the Feeling Finder, replacing the 2026-11-02 plan of click ads to /training. Still fixed from 2026-11-02: Pixel + CAPI via GHL, CAC/LTV in the Hub, LTV at least 3x CAC.

## 1. The goal

Prove one thing: **strangers from an ad will comment or DM FEELING, do the Feeling Finder, apply and buy at a cost we can afford.** On the way, they follow @attractwitholly and keep seeing his Reels for free.

- Working LTV: about **$2,000** (annual $2,500, monthly $497 x 3–4 months).
- Rule: LTV at least 3x CAC, so **max CAC = about $650 per sale**.
- Budget: **$10 a day (Olly, 2026-11-10) = about $300 a month.** The first 30 days judge **cost per Feeling Finder sign-up and sign-up → application rate**; sales and CAC are judged at 60–90 days.
- Raise the budget only when the numbers in section 6 say so, never on a hunch.

Real baseline, 1–10 Nov 2026: 506 Feeling Finder visits (Hub tracker) → 200 sign-ups (40%) → 142 application page visits from the results page (71%) → 15 applications from them (10.5%); overall 200 Feeling Finder sign-ups → 16 applications (15 had done the Feeling Finder) = **7.5% apply**. Expect ad leads (strangers) to apply less, maybe half.

## 2. The funnel the ad feeds

Ad (existing Reel, ends "comment FEELING", no button) → they **comment FEELING** → that Reel's own ManyChat automation DMs a tracked Feeling Finder link → Feeling Finder opt-in (Lead) → daily emails + the usual DM follow-up ("So where are things at right now?") → application → plan of action → sales video → join.

Unlike website ads, ManyChat and Olly's own DMs now help get them to apply, and many will follow the account.

## 3. Campaign structure

| Setting | Choice |
|---|---|
| Campaigns | **1**: `HA | Cold | Feeling | DM` |
| Objective | **Engagement**, conversion location **On your ad**, goal **maximise engagement**. Works like a boost: no button, people just comment (Olly, 2026-11-10) |
| Ad build | **Use existing post**: the live Reel itself, so comments land on the real post (ManyChat's comment trigger fires, comments + likes build up as social proof) |
| Budget | $10/day at campaign level |
| Ad sets | **1** broad ad set |
| Countries | United States, Canada, United Kingdom, Australia, New Zealand, Ireland |
| Age | 28–55 (hard minimum 28) |
| Gender | All (Meta will lean to women on its own) |
| Interests | None. Advantage+ audience on |
| Placements | Instagram only (Reels, Feed, Stories, Explore). The DM + follow path only works on Instagram |
| Ads | **3** at launch (section 4) |
| Account currency | **USD** (can't be changed later) |

At $10/day all spend stays cold. Retargeting is **campaign 2**, only once the budget is $30+/day and warm audiences pass about 2,000 people.

## 4. The ads

**Creative = his best organic Reels from the last 60 days** (tools/top-reels.mjs, 10 Nov), used as they are. They already end on "comment FEELING", so **no recutting and no ad ending to film.**

1. The fastest way to... (top scorer, 51 likes / 12 comments): the outcome angle
2. This pushes love away quickly: the "what's going wrong" angle
3. How to feel confident that you'll find love: the belief angle

Check first: each of the 3 ends on FEELING (not VIDEO/HEART) and its post has a working ManyChat comment trigger. Bench: The fastest way to attract marriage and children; How to 'attract' a committed relationship.

The organic caption stays (an existing post can't be changed in the ad). No button.

**Watch:** "maximise engagement" can bring likes rather than FEELING comments. If after 14 days comments are fine but Feeling Finder sign-ups are low, test a second version with a Send message button (Engagement → Message destinations → Instagram, ManyChat Instagram Ads trigger) against it.

**Meta copy rule:** never state or imply the viewer's personal situation ("Are you single?", "You're lonely"). Meta rejects that.

Every 2 weeks: replace the weakest ad with the best organic Reel since. Keep 3 live.

## 5. Tracking

- **Comments on the ad (decided 2026-11-10):** when an ad goes live, its Reel gets its **own ManyChat comment automation** ("specific post", keyword FEELING) sending a link with `utm_source=meta&utm_medium=paid&utm_content=comment-<reel short name>` and the tag `meta ad`. Only advertise Reels **at least 7 days old**: by then organic reach has mostly died, so nearly every new comment comes from the ad. Small overlap accepted. When the ad stops, switch the post back to the normal automation. Test with one comment that the post-specific automation wins over the general FEELING one.
- **Pixel + Conversions API through GHL** on the Feeling Finder, application and join pages: events **Lead**, **SubmitApplication**, **Purchase** (with value). Verify ollyhenson.com.
- **Hub:** "Meta ad" line in ovPlainSource + an **Ads** card (spend, conversations, Feeling Finder sign-ups, cost per sign-up, applications, sales, CAC, LTV:CAC).
- **ManyChat contact limit:** the Essential plan caps contacts at 250. Ads add contacts fast. Check the limit and keep bulk-deleting old contacts (tested safe) or upgrade before launch.

## 6. Numbers to watch (and what to do)

| When | Check | Action |
|---|---|---|
| Days 1–7 | Nothing | Don't touch anything. Meta needs a week to learn |
| Day 8 on | Ad spent $15+ with 0 FEELING comments | Turn that ad off, swap in a bench Reel |
| Day 8 on | Hook rate (3-sec views ÷ impressions) under 25% | Swap the Reel |
| Day 14 | Cost per FEELING comment | Target under $2.25 (= $8 sign-up at ~70% link taps x 40% Feeling Finder sign-up rate) |
| Day 14 | FEELING comment → Feeling Finder sign-up | Under 40% = fix the DM wording |
| Day 14 | Cost per Feeling Finder sign-up | **Target under $8 (Olly, 2026-11-10).** Max affordable = $650 x apply rate x buy rate: at 5% apply and 1 in 4 buying = $8; at 7.5% = $12; at 3.75% = $6. Re-check the line once ad leads' real apply rate is known |
| Day 30 | Sign-ups under $8 **and** at least 1 application from ads | Raise to $20/day |
| Day 30 | Sign-ups but no applications | Fix the emails / DM follow-up, not the ads |
| Each later month | CAC under $650 | Raise budget 20% every 3–4 days while it holds |

Rough first month ($300): 75–100 FEELING comments, 30–50 Feeling Finder sign-ups, 1–3 applications, maybe a sale. Plus new followers. Guesses until 2 weeks of real numbers.

## 7. Build order (one step at a time)

1. Check the ad account exists in Meta Business (currency USD, timezone, payment method)
2. Connect the Facebook Page and @attractwitholly to the ad account
3. Check the ManyChat contact limit (bulk-delete or upgrade)
4. ManyChat: one post-specific FEELING automation per ad Reel (section 8); turn it on when its ad starts
5. Check the 3 Reels end on FEELING; comment once on each to check the post-specific link arrives, not the general one
6. GHL Feeling Finder workflow: if UTM Source = meta → add tag `meta ad` (permanent first-touch marker; plain UTM fields can be overwritten by a later opt-in). Judge ads on first touch in the Hub, not Meta's 7-day window.
7. Verify ollyhenson.com; Pixel + CAPI in GHL; fire test events
8. Hub Ads card (spend typed in weekly). UTMs + ovPlainSource line DONE 2026-11-10
9. Build the campaign (Engagement → On your ad → maximise engagement, existing posts, Instagram placements), set it live, log the start date here

## 8. Launch Reels and their links (ready 2026-11-10)

All 3 end on FEELING (caption checked in GHL). Comment counts before any boost are saved in `reel-baseline-2026-11-10.json`; note the count again the day the boost starts.

| Ad | Reel | Posted | Boost from | ManyChat link (that Reel's own FEELING automation) |
|---|---|---|---|---|
| 1 | The fastest way to ♥️ (instagram.com/reel/DfXiJqjCoFD) | 5 Nov | 12 Nov | `https://ollyhenson.com/feeling?utm_source=meta&utm_medium=paid&utm_campaign=feeling_finder&utm_content=comment-fastest-way` |
| 2 | How to feel confident that you'll find love (instagram.com/reel/DfX20D7lAMS) | 5 Nov | 12 Nov | `https://ollyhenson.com/feeling?utm_source=meta&utm_medium=paid&utm_campaign=feeling_finder&utm_content=comment-feel-confident` |
| 3 | This pushes love away quickly (instagram.com/reel/DfhZu7DirGq) | 9 Nov | 16 Nov | `https://ollyhenson.com/feeling?utm_source=meta&utm_medium=paid&utm_campaign=feeling_finder&utm_content=comment-pushes-love-away` |

Ad 3 is the youngest, so it waits until it's a week old. Until then, run ads 1 and 2 at $5/day each (or one campaign at $10/day).

**ManyChat automation per Reel** (copy the existing FEELING comment automation, then change):
- Trigger: Post or Reel comments → **specific post** = that Reel; keyword FEELING (same as the general one)
- Public comment reply + DM: same wording as the normal FEELING flow
- Link button: the Reel's link from the table above
- Action: add tag **meta ad** (so GHL can filter ad leads too)
- Name it `AD | FEELING | <reel short name>`; turn it on the day that Reel's boost starts, back off when the boost stops

**Hub:** live since 2026-11-10. Leads with utm_source=meta show as "Meta ad: commented FEELING on the boosted Reel “feel confident”" etc.

## Open

- Where the Purchase event fires depends on what ollyhenson.com/join checks out on (GHL vs Skool). Check at step 6.
