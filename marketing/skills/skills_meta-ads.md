# Skills File — Meta Ads (paid Instagram for The Heart Attractor Program)
# Trigger phrases: "Meta ads", "run ads", "boost a Reel", "ad budget", "ads model"

Created 2026-11-10 from the session that built the first ads plan. Strategy and build order: `marketing/meta-ads/meta-ads-strategy.md`. Explainer + calculator + 12-month model: `marketing/meta-ads/ads-money-loop.html` → artifact GziPNAwi9Px1PnM6EA6Czb (republish after every edit).

## Status
- **On hold (2026-11-10):** Olly funds ads only after the first organic sale. Everything up to the ad account check is ready.
- Next step when he restarts: business.facebook.com → Settings → Ad accounts (currency must be USD).

## How the ads work (Olly's decisions, don't reopen)
1. **Boost an existing Reel**, not a new upload and not a click-to-website ad. Ads Manager → Engagement → **On your ad** → maximise engagement, **existing post**, Instagram placements, no button.
2. Only boost Reels **7+ days old** that already did well (`node tools/top-reels.mjs 60`) and end on **"comment FEELING"**. Organic reach has died by then, so new comments ≈ ad comments.
3. That Reel gets **its own ManyChat automation** (Post or Reel comments → specific post, keyword FEELING) sending the Feeling Finder link with `utm_source=meta&utm_medium=paid&utm_campaign=feeling_finder&utm_content=comment-<reel short name>`. Switch it on when the boost starts, off when it stops. Note the Reel's comment count the day the boost starts.
4. GHL Feeling Finder workflow: if UTM Source = meta → add tag **`meta ad`** (permanent first-touch marker).
5. **Budget starts at $10/day.** Scaling = double each month ($10 → $20 → $40 → $80/day) while cost per sale holds.
6. **Targets:** Feeling Finder sign-up under **$8**; FEELING comment under about **$2.25**; cost per sale under **$650** (LTV ~$2,000 ÷ 3).

## Rules and Constraints
- **Plain English for every step and label.** Name a step by what people do ("150 people comment FEELING", "42 people see their result page"), never by funnel jargon (leads, CPL, opt-in, LTV:CAC) unless explained in the same line. Why: Olly said "too many complicated pieces, it doesn't make sense to anyone".
- **Say which page a step is.** Feeling Finder = opt-in page (questions + email gate, 40% finish) → result page ("Find Out More", 71% click) → application page (10.5% apply). Why: Olly asked "is this the opt-in or the results page?".
- **Mark every guess as a guess** and use Olly's real numbers wherever they exist (Hub tracker visits + GHL tags). Guesses still open: cost per comment, % who tap the DM link, % of applicants who buy, yearly vs monthly mix.
- **State the payment mix behind any money figure** (e.g. "3 in 10 yearly, 7 in 10 monthly") and show the all-monthly case. Why: Olly asked whether $860 was based on $2,500 or $497.
- **Model what Olly literally asked for by default.** "Double the spend" = $10 → $20 → $40/day; extra rules (e.g. "only spend what came in") go in as an option, off by default.
- **Judge ads in the Hub on first touch**, never on Meta's report alone: Meta credits sales only ~7 days after the click; Olly's buyers can take 4–10 weeks. Spend from Meta ÷ results from GHL/Hub.
- **One decided answer.** When Olly says "this was too complicated", drop it and return to where we were in 2–3 lines.
- Copy: Meta rejects ad text that states or implies the viewer's personal situation ("Are you single?"). Write "most people…".

## Never
- Never suggest re-uploading a Reel as a new ad to track comments: ManyChat's comment trigger can't see Ads Manager dark posts (confirmed on ManyChat's community). Use the existing post + post-specific automation.
- Never default to a Send message button / click-to-DM ad. Olly wants boost-style comment ads; the button version is only a fallback test if comments come but sign-ups don't.
- Never cite Olly's support time or member capacity as a scaling limit (Olly 2026-11-10: "don't worry about support, that'll be fine"). The only brake to model is cost per member rising with spend (wider reach, ad fatigue, fewer ready buyers), offset by fresh Reels, new hooks and more countries.
- Never explain A/B significance maths. If asked about a split test: where to look, the two numbers side by side, "no winner yet / winner" in one line.
- Never quote the Hub's Feeling Finder opt-in rate without checking both A/B variants are counted (it showed ~72% when only variant A visits were counted; real ~40%).

## Process (when Olly comes back to ads)
1. Read `marketing/meta-ads/meta-ads-strategy.md` (build order, section 7) and this file.
2. Refresh the real rates: Feeling Finder visits (KV `ps:feeling:*` + `ps:feelingb:*`), sign-ups (GHL tag `feeling finder`, FF Variant field), applications (`heart attractor applicant`), apply-page visits from `feeling_finder|result`. Exclude `removed - not a fit`.
3. Update the calculator defaults in the artifact if the rates moved, republish.
4. Walk the build order one click per message (ad account → ManyChat automations → `meta ad` tag → Pixel → campaign).
5. Once live: weekly, type spend into the Hub, check cost per FEELING comment and per sign-up against the targets, swap the weakest Reel every 2 weeks.

## Examples
- Good step label: "**42 people see their result page** — You now have their email. That's about $7 per person. Your limit is $8."
- Good money line: "About $860 comes back (3 in 10 yearly, 7 in 10 monthly). If everyone paid monthly: about $390, still more than the $300 spent."
- Good tracking answer: "Spend comes from Meta. Results come from the Hub, credited to the ad they first came from. Spend ÷ sign-ups = cost per sign-up."

## Changelog
- **2026-11-10 — created.** Lessons from Olly's corrections in the first ads session: switched from click ads to boost-style ManyChat comment ads on existing Reels (he had to explain it three times, so the setup is now spelled out above); $10/day start, literal doubling; plain-English steps naming each page; payment-mix stated; support capacity is not a limit; real Feeling Finder rates replace generic guesses; Hub A/B visit bug fixed; ads on hold until the first organic sale.
