# Skills File — Meta Ads (paid Instagram for The Heart Attractor Program)
# Trigger phrases: "Meta ads", "run ads", "boost a Reel", "ad budget", "ads model"

Created 2026-11-10 from the session that built the first ads plan. Strategy and build order: `marketing/meta-ads/meta-ads-strategy.md`. Explainer + calculator + 12-month model: `marketing/meta-ads/ads-money-loop.html` → artifact GziPNAwi9Px1PnM6EA6Czb (republish after every edit).

## Status
- **Unlocked by income, not by a first sale (Olly, 2026-11-28).** The Hub Targets tab "Ad budget levels" box shows the levels; Olly gets a phone + email notification when one unlocks or when churn drops him below one. Level 1 = **$5/day** at about £1,235 a month coming in (+4 members on 28 Nov), then $10 / $20 / $40 a day.
- **Pixel is already set up (Olly, 2026-11-28).** Don't send him to Events Manager to create one; only check the Lead event fires on the Feeling Finder if results look off.
- Next step when Level 1 unlocks: pick the Reel (`node tools/top-reels.mjs 60`), check the ad account is USD and Page + @attractwitholly are connected, build.

## How the ads work (Olly's decisions, 2026-11-28, don't reopen)
1. **Objective Leads → conversion location Website → Lead event** (Feeling Finder opt-in). Meta has no separate "Conversions" objective any more; if Olly says "conversion objective" he means this.
2. **Creative = an existing Reel that performed really well and has since died down**, run as the **existing post** (comments + likes land on the real Reel), with a **Sign up** button (or Learn more) to `ollyhenson.com/feeling?utm_source=meta&utm_medium=paid&utm_campaign=feeling_finder&utm_content=button-<reel short name>`.
3. **The Reel keeps its own "comment FEELING" ending.** Olly: "I'm still going to ask people to comment because it drives engagement… we don't really miss out either way." He replies to FEELING comments by hand and sends that Reel's `comment-<reel short name>` paid link, so comment leads count as ad leads too.
4. GHL Feeling Finder workflow: if UTM Source = meta → add tag **`meta ad`** (permanent first-touch marker).
5. **Budget = the Hub's income levels:** costs + ad spend must fit inside today's **19% Expenses** share, so Tax 25 / Cash flow 10 / Profit 5 stay fixed and Salary's share never shrinks for ads. Level 1 organic, after that ad members count too.
6. **Audience:** US, Canada, UK, Ireland, Australia, New Zealand + Netherlands, Sweden, Denmark, Norway, Finland. Ages 28–55, all genders, no interests, Advantage+ audience on, Instagram placements only.
7. **Targets:** Feeling Finder sign-up under **$8**; cost per sale under **$650** (LTV ~$2,000 ÷ 3).

## Rules and Constraints
- **Plain English for every step and label.** Name a step by what people do ("150 people comment FEELING", "42 people see their result page"), never by funnel jargon (leads, CPL, opt-in, LTV:CAC) unless explained in the same line. Why: Olly said "too many complicated pieces, it doesn't make sense to anyone".
- **Say which page a step is.** Feeling Finder = opt-in page (questions + email gate, 40% finish) → result page ("Find Out More", 71% click) → application page (10.5% apply). Why: Olly asked "is this the opt-in or the results page?".
- **Mark every guess as a guess** and use Olly's real numbers wherever they exist (Hub tracker visits + GHL tags). Guesses still open: cost per comment, % who tap the DM link, % of applicants who buy, yearly vs monthly mix.
- **State the payment mix behind any money figure** (e.g. "3 in 10 yearly, 7 in 10 monthly") and show the all-monthly case. Why: Olly asked whether $860 was based on $2,500 or $497.
- **Model what Olly literally asked for by default.** "Double the spend" = $10 → $20 → $40/day; extra rules (e.g. "only spend what came in") go in as an option, off by default.
- **Judge ads in the Hub on first touch**, never on Meta's report alone: Meta credits sales only ~7 days after the click; Olly's buyers can take 4–10 weeks. Spend from Meta ÷ results from GHL/Hub.
- **One decided answer.** When Olly says "this was too complicated", drop it and return to where we were in 2–3 lines.
- **Any ad budget answer starts from the Hub Finance numbers** (`fnAuto()`: income after fees, this month's costs). Say where the money comes from: inside Expenses there is almost no room, so ads come out of Salary until an income level unlocks them. Why: Olly asked "how much spare room is there per month to spend on ads" and the honest answer was ~£2.
- **Only English-speaking, high-income countries** while the ads and the Feeling Finder are English only (that's why Germany/France are out). Why: Olly said "parts of Europe"; paying for people who can't follow the Reel wastes a $5/day budget.
- Copy: Meta rejects ad text that states or implies the viewer's personal situation ("Are you single?"). Write "most people…".

## Never
- Never re-upload a Reel as a new ad (dark post). Use the existing post so comments, likes and follows build on the real Reel. (ManyChat, the old reason, was cancelled 2026-11-17.)
- Never build anything that depends on ManyChat (cancelled 2026-11-17) or on auto-DMs to comment ads: GHL can't see Instagram DMs yet (NEXT.md 2026-11-17 entry). FEELING comments on ads are answered by hand.
- Never propose an ad budget that eats Olly's Salary share or pushes Expenses above the agreed 19%. The level has to be unlocked by income first.
- Never flag the main GoHighLevel subscription as missing from the Finance expenses (Olly 2026-11-28: "that's all sorted").
- Never default to a Send message button / click-to-DM ad or a boost-style Engagement ad. Plan since 2026-11-28 (Olly): Leads objective → Website, existing well-performing Reel with a Sign up button to the Feeling Finder, the Reel's own "comment FEELING" ending kept for engagement (see top of meta-ads-strategy.md).
- Never cite Olly's support time or member capacity as a scaling limit (Olly 2026-11-10: "don't worry about support, that'll be fine"). The only brake to model is cost per member rising with spend (wider reach, ad fatigue, fewer ready buyers), offset by fresh Reels, new hooks and more countries.
- Never explain A/B significance maths. If asked about a split test: where to look, the two numbers side by side, "no winner yet / winner" in one line.
- Never quote the Hub's Feeling Finder opt-in rate without checking both A/B variants are counted (it showed ~72% when only variant A visits were counted; real ~40%).

## Process (when Olly comes back to ads)
1. Read `marketing/meta-ads/meta-ads-strategy.md` (build order, section 7) and this file.
2. Refresh the real rates: Feeling Finder visits (KV `ps:feeling:*` + `ps:feelingb:*`), sign-ups (GHL tag `feeling finder`, FF Variant field), applications (`heart attractor applicant`), apply-page visits from `feeling_finder|result`. Exclude `removed - not a fit`.
3. Update the calculator defaults in the artifact if the rates moved, republish.
4. Check the Hub Targets "Ad budget levels" box: which level is unlocked decides the daily budget. Locked = no ads.
5. Walk the build order one click per message (ad account → Page + Instagram connected → `meta ad` tag → pick the Reel → Leads campaign with the button link). Pixel is already done.
6. Once live: weekly, type spend into the Hub, check cost per sign-up against the target, swap the weakest Reel every 2 weeks.

## Examples
- Good step label: "**42 people see their result page** — You now have their email. That's about $7 per person. Your limit is $8."
- Good money line: "About $860 comes back (3 in 10 yearly, 7 in 10 monthly). If everyone paid monthly: about $390, still more than the $300 spent."
- Good tracking answer: "Spend comes from Meta. Results come from the Hub, credited to the ad they first came from. Spend ÷ sign-ups = cost per sign-up."

- Good budget answer (2026-11-28): "There's almost no spare room inside your current expenses: about £2 a month. $10 a day would take your Salary from £254 to about £17. Start at $5 a day once you reach about £1,235 a month coming in (4 more members)."
- Good objective line: "Objective Leads, conversion location Website, optimised for the Lead event your Pixel sends when someone finishes the Feeling Finder."

## Changelog
- **2026-11-10 — created.** Lessons from Olly's corrections in the first ads session: switched from click ads to boost-style ManyChat comment ads on existing Reels (he had to explain it three times, so the setup is now spelled out above); $10/day start, literal doubling; plain-English steps naming each page; payment-mix stated; support capacity is not a limit; real Feeling Finder rates replace generic guesses; Hub A/B visit bug fixed; ads on hold until the first organic sale.
- **2026-11-28 — rewritten for the Leads plan.** Olly replaced the boost/ManyChat comment ads with a Leads ad (Website, Lead event) on an existing Reel that did well and died down, Sign up button to the Feeling Finder, the Reel's comment FEELING ending kept for engagement. Removed: "on hold until first organic sale" (replaced by income-unlocked levels in the Hub, first $5/day), the $10/day start + monthly doubling, the per-Reel ManyChat automations, the comment-cost target and the "Pixel = first job" step (Olly already has it). Added: budget answers start from Hub Finance numbers and never eat Salary; English-speaking high-income countries only (5 European ones added); don't flag the GHL subscription; examples of a good budget answer and objective line.
