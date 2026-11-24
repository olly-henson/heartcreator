# ⚠️ CURRENT APPLICANT PROCESS (2026-11-21, flow v5). Overrides every message order, plan step and follow-up below.

## Process (Hub > Sales card)
1. Open the card, rate them Good / Okay / Not good.
2. Pick the route tab: **📱 WhatsApp / iMessage** (they gave a phone; default) or **✉️ Email only**.
3. No video link yet → tap **🎬 Make their video link (woman / man)** (it's their template plan code; the video page is /p/<code>/video).
4. **Step 1, send the video.** 1a is ONE message, written by the card from their application, which Olly checks then sends:
   "Hey <Name>," → "Really like your application." → "From what you’ve shared, it sounds like you’ve really been struggling with intellectualization." → "I say that because you’ve been looking for <how long>." → "You’ve tried <tried list>." → "But even after all of this - love is still bringing up a lot of <current emotion as a noun>." → "As you put it: “<their words about love>”" → "Where you want to be: <Relationship Wanted>, with a real sense of <FF Resonance>." → what the video covers → link → "Just let me know if you have any questions." → "Speak soon," → blank line → "Olly Henson". ONE blank line between every paragraph (Olly 2026-11-24). Lines skip when the answer is blank; with no 'how long', the tried line starts "I say that because…".
   WhatsApp shows the video's "Let's Help You Find Your Person" preview. iMessage twin sits next to WhatsApp.
   WhatsApp route also sends **1b follow-up email**, subject **"Your application status: pending"** (Olly 2026-11-24), no link: "Hey <Name>, / I’ve just sent you a message on <WhatsApp or iMessage>. / It will take you through exactly how we can help you <Olly writes this line from their application: what they want + how they want it to feel, e.g. find someone to start a marriage and have kids with - whilst feeling secure and sharing lots of laughter (which I love by the way 😎)> / Check it out and let me know if you have any questions. / Olly Henson". The email-only route keeps the subject "Your application for The Heart Attractor Program".
   Email-only route = the same personalised message as one email.
5. **Step 2, after the video:** the card shows watched % and Clicked Join. Answer questions, send the checkout link.
6. **Joined:** tap Monthly $250 or Annual $2,500 → the person moves to the Delivery tab (Current members). Reminders (🔔) on the card for anything time-bound (e.g. a 6-month deal ending).
7. **Gone cold follow-up** (bottom of the card): "I know you really wanted to meet someone you could marry, have children with and build a life with. Here are the steps…" + template plan link.
8. **Hesitant after the offer:** write the informal 30-day "do the work" guarantee into the follow-up (memory project_hesitant_applicant_guarantee.md). Monthly is now cancel anytime, so a refund is just the first month.
9. **Daily follow-up (2026-11-24):** Sales tab > **📅 Follow-up**. Work down **Follow up today** from #1 (ranked by fit + engagement; only people who've had their first video message and haven't heard from Olly for 3+ days, counted from their application date when no message is dated). On each card send the **🎬 Helpful Reel**: the card picks the published Reel that fits their answers and writes the message; the card then shows "🎬 Reel follow-up N". **Send their first message** = new applicants who still need step 1. **Contacted or applied in the last 3 days** = leave alone.
10. **Adding a client by hand without the welcome email:** GHL > Automation > Workflows > put the workflow triggered by `joined heart attractor program` in **Draft** → add that tag to the contact and remove `daily email list` (Claude can do both via the API) → **Publish + Save** the workflow again straight away (anyone joining while it's in Draft misses their welcome email) → set their plan on their Sales card so they show on the Delivery board.

## Rules
- One message does the whole job: personal + the video. Why: Olly (2026-11-21) "I want to get more people watching this video as quickly as possible… this video is spot on". The old confirm → plan → video steps slowed it down.
- Pull the personal part from their application, don't leave Olly a blank to fill. Why: he asked for "something like… I can see you're struggling with intellectualization… and this is where you want to be… so I can just send one message and it's personalized".
- Skip any part whose answer is blank, and turn their words into second person (my → your, I → you). Check the result reads as English before shipping a wording change: noun-phrase answers ("Warm and stable") broke "Where you want to be is …", so it's "Where you want to be: …".
- Every step has a WhatsApp/iMessage version AND an email-only version. Why: some applicants only give an email.
- Show only the route that applies on each card. Why: "it's just getting very crowded" on his phone.
- Hesitant/sceptical buyers: answer the real worry with a written conditional guarantee, not a discount. Health conditions: coaching alongside therapy, not instead of it.
- Follow-ups after the video are helpful content, not a pitch: a Reel that fits what they wrote, as a reminder that this is what they need. Why: Olly (2026-11-24) "I don't want to mention the pitch or what I've sent them. I just want to send them helpful stuff".
- Every follow-up message must be specific to their application: name what they told you (how long, what they've tried, how love feels), then what the Reel helps with and the outcome they want. Why: Olly rejected "This one made me think of you" as "a bit vague… it needs to be very specific, so it can't be skipped".
- Give people room: no follow-up within 3 days of the last message or of their application, and nobody gets a follow-up before their first video message. Why: Olly (2026-11-24) "I don't want to harass applicants that have literally applied within the last day".
- Olly replies from his phone: every card change must read clearly at phone width (label, then buttons, then notes). Why: his screenshots showed rows squashed into one-word columns.

## Never
- Never use the 🙏 emoji in applicant messages (2026-11-20).
- Never send a plan before the video, and never ask "would that be fair to say?" first (overridden 2026-11-21: the video goes in the first message).
- Never list deliverables Olly hasn't stated (no weekly live calls, no onboarding call, no price lock).
- Never mention The Love Scale (retired).
- Never say monthly is 12 payments: since 2026-11-21 it's $250 a month, cancel anytime (the old "12 payments of $497" rule is overridden).
- Never delete the old flow's code when the flow changes: it sits behind LM_OLD_FLOW = false in the Hub.
- Never send a vague follow-up ("thought of you", "this made me think of you") with nothing from their application in it.
- Never mention the program, the price or the video they were sent in a Helpful Reel follow-up.
- Never chase someone who applied or was messaged in the last 3 days.
- Never write applicants' names into skill files or other committed files: the heartattractor repo is public (use "a test applicant" / Jane).

## Examples (good, current wording 2026-11-24, test applicant)
**1a video message:** "Hey Jane, / Really like your application. / From what you’ve shared, it sounds like you’ve really been struggling with intellectualization. / I say that because you’ve been looking for more than 5 years. / You’ve tried therapy, healing work, attachment styles and dating apps. / But even after all of this - love is still bringing up a lot of frustration. / As you put it: “Frustrated, I put myself out there, I am trying but I get nothing in return.” / Where you want to be: someone to spend the rest of your life with and have children, with a real sense of peace. / This video takes you through The Heart Attractor Program and how it will help you get there: what we’ll do, what’s included, the investment and how to get started. / [link] / Just let me know if you have any questions. / Speak soon, / Olly Henson"

**Helpful Reel follow-up:** "Hey Jane, / You mentioned you’ve been looking for 1 to 3 years, you’ve tried therapy and healing work and love is bringing up a lot of anxiety. / This Reel I posted recently takes you through how to stop worrying that it’s too late, so you can meet someone to marry and have children with. / [Reel link]"
Weak (rejected): "Hey Jane, / This one made me think of you. Hope it helps 👇 / [link]" (nothing from their application, easy to skip).
---

# Applicant Looms: the framework

> **⚠️ THE PLAN ITSELF (2026-11-12): Plan v4, the personal diagnosis plan: `funnel/skills/skills_plan-v4.md` (builder tools/build_plan_v4.py).**
> **⚠️ CURRENT FLOW (2026-11-10): "Flow v3" near the end of this file.** Earlier step-by-step sections are kept for history; where they disagree, Flow v3 wins.

How Olly turns an application for The Heart Attractor Program into a sale with one short Loom video, with no sales call.
Built 2026-11-01 from Frankie's "close in 5-minute videos" method, adapted to our offer and argument.

**Related files**
- Offer (price, guarantee, what's inside): `marketing\memory\offer_heart_attractor_program.md`
- Application page: `funnel\sections\heart-attractor-application.html`
- Hub > Looms tab (applicant answers + mind map, the screen you record over): hub.ollyhenson.com
- Core argument: Messaging Center https://claude.ai/artifact/QPbzwHtvFExE8qqZKbB8ea

> **⚠️ UPDATED 2026-11-06 (latest): no price check before the video.** Flow = application → rate → 👋 Intro text on WhatsApp + 🎙️ voice note reading their plan (beats on the Looms card, filled from HA Relationship Wanted / HA How Long Looking) + ✉️ "check WhatsApp" email (or the email-only version with the plan written out) → they ask for the details → 🎥 Sales video (price is in the video) → 💡 one follow-up idea only if they watched → 🔗 Checkout. Built from Frankie Fihn's full workshop transcript; page: funnel/applicant-sales-process.html (https://claude.ai/artifact/KwpZsKFecKog5AEyzbn3GS). Looms column "Price check sent" renamed "Messaged".

> **⚠️ UPDATED 2026-11-05: personal Looms are replaced by ONE master sales video.** Flow now: application → rate in Hub > Looms → 💲 Price check message → they say it's within reach → **🎥 Sales video** button (https://youtu.be/PhcbPYPfUU0, unlisted YouTube; marks them Loom sent) → they reply "ready" → 🔗 Checkout link. No chasing. Script + map: `funnel/sales-video-script.md`, `funnel/sales-video-map.html`. Recorded in Google Vids (Loom free plan caps at 5 minutes). The personal-Loom steps below are kept for unusual applicants only.

---

## The 6 rules (from Frankie, applied to us)

1. **No calls.** The Loom does the whole job, price included. They watch it in their own time, with no calendar to book and no pressure. People who can't afford it simply never reply, and you save an hour.
2. **Show the outcome, don't describe the service.** Frankie plays a 10-second example of the phone call a client will get. Our version: paint their own ordinary Sunday with their person, show a real moment from inside the community, and say what they'll notice first. Pictures and their own words, not features.
3. **Sell the promise, not the method.** "Attract a genuine, committed relationship where you feel safe being yourself", not "a meditation and some trainings".
4. **Never say the price on its own.** Always say it next to what they get: "$497 a month, and for that you get me in your corner every single day."
5. **Tell them exactly how to buy.** Click by click. Don't assume they know.
6. **Expect one objection: "this sounds like something I've tried."** Answer it in the video before they think it, using the boxes they ticked.

---

## Step 1: Decide who gets a Loom (2 minutes per applicant)

When someone applies, the Hub sends a notification to Olly's iPhone ("New application: Name"); tapping it opens their map in the Looms tab. They also get an automatic confirmation email ("Got your application", review within 48 hours, watch for a WhatsApp), so the WhatsApp from Olly is expected.

Open Hub > Looms, read their answers and rate them.

| Rating | What it looks like | What they get |
|---|---|---|
| **Good** | Single, looking 1+ years, has tried several things, priority "top priority" or "main focus", budget $500+ | Full personal Loom (Step 3) |
| **Okay** | Most of the above, but budget under $500 or priority "it matters, but other things come first" | Full personal Loom. The price section filters them for you |
| **Not good** | In a relationship and trying to fix it, wants an ex back, wants texting scripts, or "not really a priority" | The kind "not right now" message (Step 5). No Loom |

Send within 24 hours of the application. Speed reads as care.

---

## Step 2: Prep the map (3 minutes)

Fill the Hub mind map from their answers, in their own words. You'll talk over it on screen, so each box is one section of the video.

| Map box | Pull from their application |
|---|---|
| **Where you are** | "Where are things at right now?", how long they've been looking, how they feel about love and dating right now, Love Scale result if they took it |
| **What's in the way** | Their "I'll meet the right person once I…" sentence + what they've tried (ticked boxes) + what still isn't happening |
| **Where you want to be** | "What kind of relationship do you want?" (copy their exact words) |
| **Fit** | Priority + budget + "anything else" |
| **Plan of action** | The Attraction Formula for *them*: their likely emotions to embody + what the first 14 days look like |

Write one note before recording: **the one line of theirs you'll quote back.** Usually the "once I…" sentence. That line is the whole video's hook.

---

## Step 3: Record the Loom (6 to 8 minutes, freestyled)

Screen = the Hub mind map, your face in the bubble. Talk to them like a friend who's read their answers properly. Don't read a script. The lines below are beats with example wording.

### 0:00 Open with their name and their words (30 sec) · *Where you are*

The first 30 seconds prove you read their application. Say their name, then read back what *they* wrote, word for word (how long they've been looking, where things are at, how they feel about love right now). Don't put it in your own words. Hearing their own words said back makes them feel understood, so they keep watching.

> "Hey [Name], it's Olly. Thanks so much for applying. I've read through everything you wrote and I want to go through it properly with you, so this video is just for you."
>
> "You said you've been looking for [3 to 5 years], you're [single and dating] and when you think about love right now you feel [their words: 'tired', 'like it's never going to happen']."

Then say it back so they feel seen: "That makes complete sense after everything you've put in."

### 0:30 Name what's really in the way (90 sec) · *What's in the way*

Quote their "once I…" line. This is the old belief.

> "You finished the sentence with 'I'll meet the right person once I [heal my attachment style / love myself more / stop attracting the wrong men].' Most of the people I work with write something like that. And I want to gently challenge it."

**The crack:**
> "Think about your friends who are in happy relationships. Did they do years of therapy and attachment work first? Most didn't. They aren't flawless. They just felt an emotional connection with the person they met."

**The real cause (one line, then the why):**
> "Who you attract isn't about what you know. It's how you feel. And specifically how you feel around love. You can be calm at work and happy with friends, but the moment you think about dating, it's [their feeling]. That feeling is fear, and fear decides who you notice, who you're drawn to and how you show up."

**The belief point (core message 2026-10-28):**
> "You might be thinking 'I just don't believe it will happen for me.' That's normal. Belief isn't something you have to find first. You feel it first, and the belief follows."

### 2:00 Answer "I've tried something like this" (60 sec) · *What's in the way*

Go through the boxes they ticked. One sentence each, then one sentence on the difference.

> "You ticked [therapy, attachment styles, books, manifestation]. All of those are about *learning* about love. Understanding why. And you clearly understand a lot, probably more than your married friends. But understanding doesn't change how you feel when a date texts you back late."
>
> If they ticked manifestation: "Manifestation asks you to think positive. This isn't positive thinking. It's practising the actual feeling in your body every day until it becomes your normal."
>
> If they ticked meditation: "Most meditation calms you down. This one has one job: putting you in the specific emotional state you'll feel in your relationship."

### 3:00 Show where this goes (90 sec) · *Where you want to be* (this is the demonstration)

Read their relationship answer back word for word, then paint the picture.

> "You said you want [their exact words]. So picture an ordinary Sunday. Breakfast together, a walk, cooking, seeing friends. Someone who's committed *and* fun, where you feel safe being completely yourself and you're not questioning it all the time."

**What they'll notice, in order** (this is what Catrin said no one else tells her):
> "Here's what usually happens. First you feel different. Lighter around dating. Then you notice different people, and the time wasters stop pulling you in. Then the right people start showing up, and things unfold in a natural, exciting way."

**Proof:**
> "That's exactly how I met my wife. I stopped trying to learn more and focused on how I was feeling every day."

**Show it (10 to 20 sec):** switch tabs to the Skool community. Show a real member post, a daily meditation check-in or one of your video replies. Frankie's lesson: a picture lands a thousand times faster than words. (Only show member posts you have permission to show. Once there are wins, show a win here.)

### 4:30 The plan for them (60 sec) · *Plan of action*

> "Inside The Heart Attractor Program we use The Attraction Formula. It's two steps. One: find your specific emotional resonance, the exact emotions you'll feel in that relationship. For you I'd guess it's something like [safe, playful, chosen]. Two: embody it every single day with a 10-minute meditation: Drop In, Open Up, Feel It."
>
> "And you don't do it alone. I check in on your meditation every day, I reply to your posts within 24 hours, you can message me privately whenever you need, and we jump on a call whenever it's useful."

### 5:30 The price, in context (60 sec) · *Fit*

Never say the number alone. Say what they get, then the number, then the guarantee.

> "So here's how it works. It's $497 a month, cancel anytime. For that you get me in your corner every single day: daily check-ins, private messages and calls when you need them. Or if you know you're in, it's $2,500 for the whole year paid upfront, which is 58% off."
>
> "Put that next to what you've already spent on [therapy / courses / years of dating apps] that taught you more *about* love without changing how it feels."
>
> "And there's a 14-day guarantee. Do the meditation and trainings every day, message me every day, and if you don't feel anything different after 14 days, you get every penny back."

If they're an **Okay** (budget under $500), add one honest line: "I know you said under $500, so if now isn't the time, that's completely fine. Keep watching the emails and we'll talk when it is."

### 6:30 How to start (45 sec)

No link in the Loom or its message (Olly, 2026-11-03). Tell them to reply when they're 100% ready, then walk them through what happens next.

> "If you're 100% ready to start, just reply to my WhatsApp and say so. I'll send you the link. You pick monthly or annual, pop your card details in, and you'll get an email straight away with your invite to the community. The first thing you'll see is the welcome training."

Worked example (sample applicant, mind map + full script + message): https://claude.ai/artifact/WLNgkGrpXjohuvzznqMJos

### 7:15 Questions + close (30 sec)

> "If you've got any questions, just reply to my WhatsApp. Most people ask 'will this work for me, given [my situation]?' Ask me anything. Speak soon, [Name]."

**Recording checklist**
- [ ] Their name in the first 5 seconds
- [ ] Quoted their "once I…" line
- [ ] Used their exact relationship words
- [ ] Price said next to what they get, plus the guarantee
- [ ] Told them to reply when they're 100% ready (no link)
- [ ] Under 8 minutes

---

## Step 4: Send it (WhatsApp first, email as backup)

Loom title: **"[Name], your plan for The Heart Attractor Program"**

**WhatsApp message** (personal line on top, as Frankie does):
> Hey [Name], it's Olly 👋
>
> Thanks for applying. I read through everything you wrote, especially the part about [one specific thing, e.g. "always meeting men who disappear after a few weeks"].
>
> I recorded you a short video going through where you are, what I think is really in the way and how the program would work for you. Price and everything's in there, so you can watch it in your own time.
>
> [Loom link]
>
> Any questions, just reply here.

**Email** (same words, subject: **"[Name], I recorded this for you"**).

Once it's recorded but not sent yet, tap **Recorded** on their card (stage **Loom recorded**), so you can see who's waiting to be sent. Then move them to **Loom sent** in the Hub Looms pipeline.

---

## Step 5: After the Loom: no chasing

**Update 2026-11-06:** Frankie's follow-up is not a chase, it "goes deeper": one extra idea about their situation, written as if you already work together. It's on the cards as "💡 Follow-up idea (only if they watched)"; whether to use it is still Olly's pick. Never "did you see my message/video?".

**No chasing (Olly, 2026-11-03, narrowed 2026-11-06):** the only follow-up is the one 💡 "go deeper" idea, sent once, 1 to 2 days after they watched. If they haven't watched or haven't replied, send nothing and let them come back. Reply to them when they get in touch.

**When Olly asks what Frankie said about something:** quote only the saved lines (this file + `funnel/applicant-sales-process.html`), then say the full workshop transcript isn't on disk and ask him to paste it if he needs more. Frankie's saved follow-up lines: "All follow-up done correctly is going deeper… I'm actually already talking like we're working together." / "Ideas are never unwelcome." / Loom is for the watch notification, "so I know how to handle the sale based on they saw it or didn't see it." / "Will this work for me?" is the usual question after the video; answer it by text from their own situation.

> **Superseded 2026-11-10:** built differently: our own video page at `/p/<plan code>/video` playing an MP4 from the Hub (no YouTube, no Loom). See "Sales video (VSL) v2" below.

**(Old plan) Planned (to-do in the Hub, for the week of 9 Nov): our own Loom with view tracking.** Preview: https://claude.ai/artifact/M8JLSLFLdfYGV2aBDsWP7c. Each applicant gets `hub.ollyhenson.com/v/<code>` (code → contactId in KV); the page plays the unlisted VSL through the YouTube IFrame Player API with the "Watch on YouTube" link off, and pings a Pages Function every 10 s plus on open/leave with the seconds actually watched (skips don't count). The Sales card shows opened / % watched / when (Cape Town time) / visits; the 💡 idea unlocks at 50%; one email to Olly the first time someone finishes. Olly's own views (Hub login) don't count. Copy/send buttons use the tracked link automatically.

They stay on the daily email list, which keeps the conversation going without chasing.

**"Not good" applicants (no Loom):**
> Hey [Name], thanks so much for applying and for being so open. From what you shared, I don't think the program is the right fit for you right now [one honest reason, e.g. "it's built for people looking to meet someone new, not to fix a current relationship"]. You'll keep getting my emails, which share a lot of what I teach for free. Wishing you the best ❤️

Mark them **Not a fit**.

---

## Step 6: Personal now, one master video later

> **Superseded 2026-11-05:** the master video was recorded early (see Step 7). Personal Looms only for unusual applicants. Keep logging the main doubt in the Hub notes.

- **Now (no one has said yes yet):** record a fresh personal Loom for every Good and Okay applicant. Frankie does the same with a new offer.
- **After every Loom, log 3 things** in the Hub notes box: main doubt they raised, what they replied to or asked, did they join.
- **After 3 to 5 joins:** look at the notes. Whatever objection keeps coming up goes into the script. Then record **one master Loom** for everyone, and personalise only the WhatsApp message on top (the part above the link). Re-record personal Looms only for unusual situations.

---

## Step 7: The master VSL flow (2026-11-05, replaces personal Looms for normal applicants)

> **ORDER CHANGED 2026-11-08 (Olly, after Frankie's "sell anything with video"):** the plan of action comes BEFORE the sales video. Intro text + voice note → they ask for the details → **send their plan of action link and ask what they think of it** → handle any doubts by text, before the price (Frankie: if they object to the plan they'll object to everything later) → **once they agree with the plan, send the sales video** (it does the closing: price, what they get, how to buy) → "ready" → checkout link. Hub card and the "sales process, step by step" box follow this order.

1. Application -> Hub **Sales** tab (Trello-style board: New applications / Messaged / Replied / VSL sent / Joined / Gone quiet / Not a fit; money tiles on top).
2. **Superseded 2026-11-06:** no price check. Send the 👋 Intro text + 🎙️ voice note (their plan, no price) + ✉️ email from the card; people who ask for "the details" get the video. The price lives in the video (Frankie: price inside the video, with the "works well if" qualifier).
3. **Superseded 2026-11-10** (the link is now 🎬 Copy their video link, `/p/<plan code>/video`; see "Sales video (VSL) v2"). Old: **🎥 Sales video** button sends the unlisted YouTube VSL (https://youtu.be/PhcbPYPfUU0) on WhatsApp or email and moves them to **VSL sent**. Message (Olly's final wording): "Hey [Name], great, thanks for getting back to me. / Here's a video going through how the program works, what to expect and how to start. / [link] / If you're ready to start after watching, just reply here and I'll send you the link. / And if you have any questions, just let me know." No "watch it in your own time".
4. They reply "ready" -> 🔗 Checkout link. No chasing (Step 5).
5. Stopped replying but could be a fit -> **Gone quiet** (card shows where they went quiet). Rude / really bad fit -> **Not a fit -> Remove from GHL** (DND all channels, list tags off, tag `removed - not a fit`, left out of every stat and data pull).

**The VSL map (superseded 2026-11-10 by the 11-slide VSL v2; the 14-day guarantee is OUT of the video)** (`funnel/sales-video-map.html`, script `funnel/sales-video-script.md`): Outcome (top, with the couple-cooking photo) -> centre "Helping, guiding and supporting you every step of the way to meet your person" -> The steps (left) -> What to expect (right, ending on the 14-day guarantee) -> "Steps to get started" heading only (bottom: he switches screen and shows sign-up live). Camera box top left (captions sit at the bottom). Desktop only.

**Recording + hosting (superseded 2026-11-10: the MP4 goes into the Hub, not YouTube; see "Sales video (VSL) v2"):** Google Vids (Loom free caps at 5 min), uploaded as an UNLISTED YouTube video (never Private: applicants can't open it). Send the link, not a file: WhatsApp shows a playable preview and the view count survives. For the sign-up demo use a fresh `olly+<word>@ollyhenson.com` address, stop before card details, and pause the recording while fetching a Skool code.

---

## Words to use / avoid (quick check)

- Say "the right people start showing up", never "you'll meet someone by…"
- Say "committed and fun", never imply the right person feels boring
- Say "how you feel" / "emotional state around love", never "frequency" or "vibration"
- Say "program", "visualize"; no comma before "and" / "or"
- Promise a change in how they feel, never a partner by a date

---

## Still needed before the first Loom

- [x] **Checkout link** (2026-11-03): https://www.skool.com/heartcreator (Skool group, monthly $497 / annual $2,500 chosen there). It's the OLD group URL: Olly is holding off the $99 Skool fee for a new URL until sales come in. **ollyhenson.com/join redirects to it (live 2026-11-03): always use https://ollyhenson.com/join** (Loom, WhatsApp, emails), so the target can change later without re-recording Looms. **Only send it when they reply that they're 100% ready** (never in the Loom message itself). Wording: "Hey [Name], great - here's the link to join: https://ollyhenson.com/join". Hub > Looms: every card has '🔗 Checkout link' (copy), 'Send on WhatsApp' and 'Send by email', both prefilled with that wording. Put it in the WhatsApp template and under the Loom.
- [ ] **What happens after payment**: confirm the welcome email + Skool invite fire automatically, so the "how to join" section is true.

- **2026-11-02: Skill review.** Added the Loom recorded stage (tap Recorded before sending), the new-application notification that opens their map, and the automatic confirmation email applicants now get.

- **2026-11-05: Skill review.** Added Step 7 (master VSL flow) because Olly stopped personal Looms: price check first, one master VSL, Sales board stages (VSL sent, Gone quiet, Not a fit + Remove from GHL), his exact send-message wording (he cut "Watch it in your own time" and added the questions line), and the VSL map structure he approved after several rounds (outcome on top with a photo, centre linked to the outcome, steps, what to expect + guarantee, a bare "Steps to get started" heading because he demos sign-up live, camera box top left away from captions, desktop only). "Loom recorded" stage removed.

## Rules from the 2026-11-06 session

- **Frankie's words come from his material, never from memory.** His slide doc (`marketing/loom info/Watch Me Make A Loom Video.md`) has no follow-up wording; Olly pasted the full workshop transcript in chat (not saved on disk). If a source doesn't say it, say so and ask for the transcript; don't write a message and call it his.
- **Frankie's process = Hand Raiser → Pre-Sell the Plan → Loom Video → Follow-Up → Cash In.** The step after the hand raiser is pre-selling the plan, not price qualifying. Our pre-sell for applicants is the voice note (Olly's idea): people apply from the training, the Feeling Finder or emails, so don't assume they've seen the plan.
- **The pre-sell carries no price.** Intro text ("Just got your application, thanks for filling it in. Give me a few minutes. I'm recording you a quick voice note with a plan of how I'd help you with this.") → voice note with their plan (what they want, how long, the 3 steps) ending "If you want me to send you the details of the program…" → email saying "I've sent you a message on WhatsApp". Email-only people get the plan written out.
- **Show every message's full text.** Olly: "I need to see the text of each one though without having to open it." No collapsed boxes for message wording on planning pages.
- **The sales video never offers private messaging or calls.** Removed "you can message me privately and we jump on a call when you need one"; keep "I reply within 24 hours".
- **Record over slides, not a mind map** (`funnel/sales-video-mind-map.html`, artifact 7s6q3K9hwqGouNrKnqiG6H). Every piece of text editable (titles too), rows can be added, moved (↑↓) and deleted, full screen hides every control, text shrinks to fit. Tapping the slide edge changes slide only on empty background (deleting a row near the edge used to jump slides).
- **Pictures where Frankie uses them:** the outcome (couple photo), one real result (member screenshots, names and photos blurred), one picture per "how it works" step, what they get, and the buying process (join page, welcome email, the DM they get). A wide screenshot gets its own slide so it's readable on camera.
- **Full screen doesn't work inside the claude.ai viewer.** Record from the local copy `marketing/assets/sales-video/Sales Video Slides.html` (images embedded; rebuild with `python -I tools/build_sales_slides.py`). Full screen ends when you switch tabs: start the Google Vids recording first, then click Full screen on the slides tab. That folder is git-ignored (member screenshots).

- **The VSL is unlisted YouTube: https://youtu.be/PhcbPYPfUU0** (recorded over the slides, 2026-11-06). Olly went with YouTube, not Loom, so there's no "they watched" notification: only send the 💡 follow-up idea when you know they watched (they said so, or replied about it).

## Rules from the 2026-11-07 session

- **Every message must make sense the moment it lands.** The intro text goes out before the voice note is recorded, so it says the voice note is coming (Olly: "if they get it and then I'm still recording the voice note, it doesn't really make sense"). Overrides "Here's how I think I could help you with this 👇".
- **No WhatsApp = iMessage.** Most applicants with an iCloud email have an iPhone. iMessage works over Wi-Fi (Olly is often on Wi-Fi only) and takes voice notes. If the number turns blue in Messages, run the same flow there; green = SMS (needs signal, international cost, no voice notes), so email only. The card switches to iMessage by itself when their application says they don't have WhatsApp.
- **A personal email, when Olly asks for one, is built from their own answers:** acknowledge what they shared in one or two kind lines, say what they want in their words, then the 3 steps each tied to their answers (the person: their listed qualities; the feeling: what they feel now vs what they want; daily practice: why their current state shapes who they notice, who they're drawn to and how they show up), name what they've already tried and say this isn't more learning, end by asking if they'd like the video on how the program works. No price. It goes on their card for Olly to check before he sends it.
- **Leave out sensitive details about other people** (an ex's diagnosis, private history) even when the applicant wrote them. Use the feeling, not the story.
- **Flag a budget mismatch before the video:** if their "willing to invest" answer is under the annual price (e.g. "Under $500"), tell Olly the monthly fits and the annual probably won't.
- **Stuck typing dots ("..." for an hour) are an app glitch** (iMessage keeps them when someone leaves text in the box; WhatsApp needs a restart). Do nothing and don't message about it: same as no chasing.

### Never
- Never rewrite Olly's message wording when he pastes it: build it as written, fix only typos ("Hey NAME, Hey NAME" -> once), and keep his order (WhatsApp / iMessage ALWAYS before the email).
- Never leave an old link or step in a send button after the flow changes (2026-11-10: the Sales video button still sent the retired YouTube video). When the flow changes, grep the card for every message and the process steps box.
- Never answer "what did Frankie say" from memory: the video-message close comes from his saved line "Price and everything's in there... Any questions, just reply here."
- Never put an applicant's name or answers in a file in this repo (it's public). Drafts live on their Hub card (KV).
- Never send an intro that promises something ("here's how 👇") before that thing exists.
- Never ask applicants about price before the video (overrides the 2026-11-04/05 price check).
- Never send a follow-up to someone who hasn't watched, and never one that asks if they've seen it.
- Never put words in Frankie's mouth: if the saved material doesn't say it, say so.

- **2026-11-06: Skill review.** Price check replaced by intro text + voice note + email (Olly: people come from different entry points, so the voice note pre-sells the plan; price moves into the video). Follow-up reframed as Frankie's "go deeper" message, pending Olly's pick. Added the slides/recording rules (editable titles, row controls, full screen via the local copy, pictures per Frankie, blur members) and the "quote Frankie only from his material" rule. Overridden: Step 7's price check, the "Price check sent" column name.
- **2026-11-06: Skill review (2).** New VSL link (PhcbPYPfUU0) replaces wghvWJJ6YVk everywhere; hosting decision = unlisted YouTube, so the follow-up rule now says how to know they watched without Loom.

- **2026-11-07: Skill review.** Intro text now says a voice note plan is coming (the old "Here's how I think I could help 👇" made no sense while he was still recording). Added the iMessage route for people without WhatsApp (blue = voice notes over Wi-Fi, green = email only), how to write a personal email from their answers (example structure, no names: the repo is public), leave out sensitive third-party details, flag budget vs the annual price, and stuck typing dots = do nothing. Overridden: the 👇 intro wording.

- **2026-11-07: Skill review (2).** Merged the 2026-11-03 "no follow-ups" rule into the 2026-11-06 one (one 💡 idea, only after they watched) so the two no longer contradict. Added Frankie's saved follow-up quotes and the rule to say when the transcript isn't on disk (Olly asked "did Frank say how to follow up"). Added the planned view-tracking video page (Olly: "build our own Loom to track individual views", parked for next week).

## Plan of action (2026-11-08): the per-applicant document

Olly: "I want to send them a summary plan of action of exactly what we're going to do for each person, so I can show that I know what I'm doing" (Frankie: demonstrate the plan). This REPLACES the science guide (the 5-page `funnel/science-guide.html` is retired).

### Process
0. **When:** after the voice note, when they ask for the details. Before the sales video, never after (see Step 7).
1. **Hub > Sales > applicant card > 📄 Plan of action** opens `/plan.html?id=<contactId>`, auto-filled from GHL: name, "where you are now" (first sentences of HA Feelings About Love), outcome (HA Relationship Wanted), tried (HA Tried), must-haves (FF Intentions, me/my → you/your), emotions (FF Resonance), anchor moments (default line). Orange box = empty.
2. **Olly checks three things:** the "where you are now" line (swap in the line that shows them stuck in their head, like a line about scanning every room for someone available), the anchor moments (make it one real moment of theirs), and any orange box (no Feeling Finder = fill from the application).
3. **Make their link** (saves + creates `hub.ollyhenson.com/p/<code>`; does NOT count as sent) → the send message appears in an editable box → **Send on WhatsApp** / **Send by email** / Copy message / Copy link only / Preview. Only a send or copy marks it sent.
4. The Sales card shows "📄 Plan sent, not opened" (amber) → "📄 Plan opened N×" (green), plus last open (Cape Town time) and PDF downloads.
5. **Changing the plan for everyone:** edit `funnel/plan-of-action.html` (the template, example data only), run `python -I tools/build_hub_plan.py`, deploy the Hub. Every link, including ones already sent, shows the new layout (only each person's words are stored, in KV `plan:<id>`).
6. Local PDF/PNGs for one person (rarely needed now): `funnel/applicant-guides/<first-last>/plan.html` with `var PRESET = {...}` (git-ignored), then `node tools/export_guide.js <file>` (also checks every page fits).

### The plan (4 pages, as Olly signed it off on 2026-11-08)
1. **Cover:** "Plan of action for [Name]" / "Your plan to meet your person" / Where you are now (their words) ↓ Where we're going (their outcome).
2. **What's in the way:** "There's nothing to fix. You're stuck in your head." What they've tried + friends who settled down didn't fix everything. "What's going on is something called intellectualization." Two boxes: **The problem: Intellectualization** / **The solution: Emotional resonance** (pink). "The plan below builds your emotional resonance, every day." **What it does for you:** builds the belief in yourself that you can meet your person · attracts high-quality partners · lets you confidently be yourself and fall into a true and authentic relationship.
3. **"The solution: emotional resonance" label, "How we build it, step by step":** Day 1 get you inside the program (starter trainings are short and show exactly how we'll build your emotional resonance) · Week 1 clarity on what you want and how you'll feel (their must-haves + emotions) · Week 1 embody it with the meditation (flagged "This is the step that makes the difference").
4. **Same label, "Then, beyond the first week":** Week 2 anchor it through your day (their moments) · Day 14+ notice the shifts ("positive shifts in your world and new people coming into it. I guide you through how to handle each one") · closing **Where this leads** box with their outcome.

### The send message (Olly's words, verbatim, rewritten by him 2026-11-08; only name, outcome and link change)
> Hey [Name], so I've just reviewed your application and it all looks good.
>
> So I've put together a plan of action of how we can get you to [their outcome, first letter lowercase, no full stop].
>
> [link]
>
> Have a look and let me know if you think this is possible for you.

(Claude only fixed typos: "of we can" -> "of how we can", and put the link before the question. The last line is Frankie's "What do you think of that?" after pre-selling the plan: it invites the doubt so it's handled before the price.)

Email: subject "Your plan of action", same text + "Olly" (both Claude's wording, not yet confirmed by Olly).

### Rules
- **Everything points at emotional resonance as what he's selling.** The problem is intellectualization, the solution is emotional resonance, and every step says how it builds it. Why: Olly asked twice that the solution "blend into the steps as this is what I'm selling".
- **Introduce terms the way the Reels do:** "something called intellectualization", "This is called emotional resonance". Why: Olly corrected "I call this…" and "There's a name for this".
- **Keep the science simple.** Intellectualization and emotional resonance are the only named terms. Plain words: busy mind vs calm mind, inner voice louder and more critical, stuck in your head. Why: "make it sound less technical, it's a bit overwhelming".
- **Readable for anyone, including people with poor eyesight.** On screen (link + Hub) it's one flowing column, body ~21px on a phone, labels ≥15px, follows the iPhone text-size setting. Only the PDF uses the fixed designed pages. No italics anywhere (highlighted heading words stay upright; quotes in the plain font). Why: "MUCH bigger … anyone with visual issues", then "the italic is too hard to read".
- **Use Olly's own words for anything he dictates** (support lines, the Day 14+ step, the send message); only fix typos. Why: he replaced Claude's support lines with his own after "less robotic".
- **Promise only what he delivers.** No calls. Private messages in the program's DMs are fine in the plan (Olly's words, 2026-11-08; this overrides the older "never private messaging" rule for the plan only). No price in the plan. No Day 14 money-back step in the plan (Olly removed it 2026-11-09).
- **A per-applicant document shows how it'll be done, step by step,** in Olly's order (he set Day 1 → Week 1 → Week 2 → Day 14 → Day 14+). Don't invent timings: when Claude proposes one, say so.
- **Leave out sensitive details about other people,** and use their feeling rather than their story.
- **Making a link is not sending it, and Olly's own opens never count** (his Hub login cookie or a device marked from the Hub). Why: an applicant showed "sent" after Olly only looked, and another showed Olly's own open. Reset a wrong count in KV `planview:<id>`.
- **Testing with a fake applicant:** create it in GHL with an `olly+` email and a UK drama number (+44 7700 900xxx, can't reach a real person), then delete it from GHL (DELETE /contacts/<id> with marketing/.env GHL_PIT_TOKEN) and its KV keys (`plan:`, `planview:`, `share:`) as soon as Olly's done: it counts as an application until then.
- **Explaining to Olly: one path, not every button.** He was "very confused" by a two-option explanation; give the one way to do it in 4 steps, offer to remove the extras.

- **The plan pre-sells, the video closes.** Send the plan when they ask for the details, ask whether they think it's possible for them, handle any doubt by text, and only send the sales video once they agree. Why: Frankie's 4 buckets (hand-raiser → pre-sell the plan, 80% of the sale → video close → follow-up); objections to the plan become objections to everything later, so they're handled before the price.
- **Message wording is Olly's; when he rewrites a template, replace it whole** rather than merging his version with Claude's earlier one. Fix only typos and missing words, and say which.

### Never (plan of action)
- Never name the person mid-copy ("[Name], getting clear…"); the name is on the cover only.
- Never add their job/profession ("your analytical mind is a strength in [their job]"): removed.
- Never add fear lines ("If you don't do this part, nothing changes. You'll keep…"): removed by Olly.
- Never brainwaves (high beta, alpha), default mode network, nervous system or fight or flight in client documents.
- Never italics, never text shrunk to fit a phone.
- Never commas inside one must-have (the list is joined with " · ").
- Never hand-edit `hub-site/public/plan.html` or `plan-view.html`: they're generated from the template (per-person wording edits are made on the page in the Hub, see Plan v3.1).
- Never send the sales video before they've had the plan and said it sounds possible for them.

---

- **2026-11-08: Skill review.** Consolidated the day's plan work into one "Plan of action" section (process, the 4 signed-off pages, Olly's send message, rules with the reason for each, Never list). Lessons: the plan replaces the science guide (Olly wants to show he knows what to do); emotional resonance is the product and must run through the problem, solution and every step; introduce terms the Reels' way; keep science to two terms; readable for people with poor eyesight (large text, no italics, no shrinking); Olly's dictated words verbatim; making a link isn't sending it and his own opens don't count; test contacts get deleted; explain one path. Removed/overridden: the science guide section (retired), the 5-page and 3-page layouts, the "what to expect / how I'll support you / reply for the link" page, the "You'll keep [pattern]" box and `pattern` field, the work/profession line, brainwave/DMN/nervous-system wording, "Send as a link" (now "Make their link"), and the "week numbers are Claude's proposal" note (Olly set the order).
- **2026-11-08: Order change.** Plan of action moved before the sales video (Frankie's bucket 2: pre-sell the plan, get agreement, then the video closes). Overrides the Step 7 order where the video went straight after "send me the details".
- **2026-11-08: Skill review (2).** Added: plan before video as a rule with the reason (Frankie's buckets), Olly's rewritten send message (replaces both earlier versions: "I had a look through your application again today… Here's your plan for you" and the "what you think" ending), rule to replace a rewritten template whole. Still open from the Frankie comparison: (1) the sales video should say who the program works well for (check the recording); (2) no watch tracking on the YouTube video yet (planned own-Loom page); (3) Olly to decide whether follow-ups stay at one or go to 3 "go deeper" messages. Email subject "Your plan of action" + "Olly" sign-off are still Claude's wording, unconfirmed.
- **2026-11-09:** Day 14 "Feel-the-difference check" removed from the plan (Olly). No feeling yet (Feeling Finder "I'm not sure") → "Your emotions: I'm not sure (this is what we'll go through)" and the meditation step says "the feeling we find together" (Olly's wording for the brackets).

### Plan v2 (2026-11-09, Olly's outline + Frankie's "Agency Advantage" podcast)
- **Structure (Olly's, keep it):** where they are → where they want to be; problem (intellectualization) and solution (emotional resonance) boxes; "So we need to get you out of the worry, the overthinking and the belief that you need to fix yourself…"; How we're going to do this, each step WITH a screenshot: 1 sign up (join page), 2 trainings: clarity on the relationship + emotions (their answers), 3 personal meditation (flagged; confidence line), 4 steps within their comfort zone (DM), 5 self-esteem + guiding interactions (partner text), 6 supported until they're in the exact relationship (couple POV photo by gender: field `gender`, files pov-female/pov-male) + Where this leads; support page (final DM + Catrin's video support). Why: Frankie, "explain what you do with pictures, not words" (dramatic demonstrations); the plan sells the idea, the video closes, and the same screenshots go in the video.
- **Images are POV:** every screenshot sits on a phone in a hand or a laptop seen from the user's seat (Olly: "It needs to be POV"). Method: Gemini base photos with a plain #00FF00 screen (`marketing/assets/sales-video/pov phone.jpg`, `pov laptop.jpg`), then `python -I tools/pov_composite.py` (phone = 4 corners, laptop = screen box) → `hub-site/public/plan-img/` (git-ignored, served to applicants via /p/<code>/img/) + copies in `sales-video/pov/` for the video. A missing image hides its slot.
- **White, clear, subtle brand (Olly: "the purple is way too much"):** WHITE THEME block in the template. Preview artifact V5MKRLjJVWgp8NZL8t4qJi; NOT deployed until Olly approves. Next he wants **fewer words** on the pages.
- **Blurring screenshots:** show a member's profile photo + first name only; blur surname and the whole conversation; keep the chat icon with its red badge (Olly's spec). Saved as "<name> blurred.png" beside the original, folder git-ignored.
- "I'm not sure" feeling → "I'm not sure (this is what we'll go through)", meditation step says "the feeling we find together". Day 14 money-back step removed (Olly).
- **Restoring a removed applicant:** GHL: DND off on every channel, remove `removed - not a fit` + `unsubscribed`; Hub: GHL's tag now decides "removed"; move the card by clearing `archived` (KV record, only if the rev hasn't changed).

### Plan v3 (2026-11-09 evening, SENT to the first applicant): the approved design. Use it as the style for the sales-video slides too
- **13 pages, 540x675, white:** cover ("<Name>'s Plan To Meet Her/His Person", Olly circle photo top right from `marketing/assets/YT thumb - Make It Happen.jpg`, where you are now -> where we're going, both rewritten into "you" by `toYou()` / `wantYou()`) -> **The Problem** (red pill, title Intellectualization, photo by gender, box "The Real Problem: Intellectualization" + "Linked to a fight or flight brainwave pattern: high beta") -> **The Solution** (green pill, Emotional Resonance, cafe photo, box + "alpha") -> **junction page** (title only, centred, big down arrow) -> **8 step pages** (one big POV photo + 1-2 lines each) -> closing page ("<Name>, This Is Your Plan To Meet Your Person", their want, "Let me know your thoughts and if you've got any questions, just reply to my message.", Olly sign-off).
- **Steps (titles Title Case, every word):** 1 You'll Get Access To The Program (classroom, arrow on The Attraction Formula) / 2 You'll Start With The Attraction Formula Trainings (first 2 trainings outlined) / 3 You'll Learn How To Do The Attraction Formula Meditation (3rd training) / 4 You'll Practice The Attraction Formula Meditation (sofa phone, clean player screen) / 5 You'll Learn How To 'Anchor' Your Emotional Resonance (final training) / 6 As Your Confidence Builds (dream partner text, by gender) / 7 Helping You With The Early Steps (dinner POV, by gender) / 8 With You All Of The Way (Skool DM chat on phone, holding partner's hand, wedding rings, by gender).
- **Copy rules from this session:** Title Case on every page title; "practice" with a C (also the verb); bold "The Attraction Formula" in body text only when it stands alone (not inside "The Attraction Formula Meditation"); "Emotional Resonance" capitalised; no comma before and/or.
- **Image rules:** every screenshot is POV (hands on the laptop or phone in the shot, not zoomed to the screen only); purple outline + curved arrow on whatever the step talks about; text on any screen must be readable on a phone (render the screen at 2-3x, then composite); one image per step. Tools: `tools/laptop_pov_hq.py SHOT OUT "x0,y0,x1,y1" [top]` (laptop POV, sharp, outline + arrow); phone screens = render HTML at 3x with puppeteer, then fit the screen corners from the green screen's STRAIGHT edges (not its rounded corners, which squash the screen ~10%: see the sofa meditation fix). Gemini base photos have a plain #00FF00 screen.
- **Gender:** the application has no gender question. `guessGender()` in `tools/build_hub_plan.py` uses words in their answers (wife/girlfriend -> man; husband/boyfriend -> woman), then a list of common male first names, else woman. Olly checks "They are a" in the editor (the note says which it picked). A plan saved before 2026-11-09 evening keeps "female" until changed + saved (the first applicant had to be fixed by hand).
- **Long answers:** `planFit()` shrinks a page's image, then its text, until it fits (tested with 8 tried items + long paragraphs).
- **Applicant page (/p/<code>, plan-view.html):** photos use aspect-ratio (never fixed px heights, they squash on wide screens); body/box text 1.05-1.12rem; footer wraps on narrow phones. Images are cache-busted with ?v=<build time> in both the editor and the applicant page; desktop needs Ctrl+Shift+R once after a deploy.
- **Not built yet (Olly's idea):** photo sets by age band (auto from application age; older = no rings, life partner) + ethnicity chosen by Olly in an editor dropdown (never guessed from names), ~4 images per set.

### Never (added 2026-11-09)
- Never put purple-heavy or dark pages in client documents again; white, dark text, purple accents only.
- Never show a member's surname or conversation in a screenshot.
- Never long replies when Olly says tokens are low: short answers, one step.
- Never fake a member testimonial or result in an image; mock chats show support and progress (Olly approved the step 8 celebration chat for the plan).
- Never fixed pixel heights for photos on the applicant page; never zoom a POV screenshot so far that the hands disappear.

### Sales video page (built 2026-11-10, LIVE)
- **Link = their plan code:** `https://hub.ollyhenson.com/p/<plan code>/video` (Sales card > 🎬 Copy their video link; needs the plan link made first). Plays `public/vsl/vsl-women.mp4` or `vsl-men.mp4` by the plan's "They are a" (gender). Files are git-ignored; each must stay under 25 MB (Pages limit; 4.5 min 1080p was 21 MB). If a file is missing the page says "Your video is nearly ready".
- **Tracking** (functions/p/[[path]].js `vseen`, KV `vslview:<id>`, Hub reads /api/vslviews): opens + device, % actually played in 100 slices (skips don't count), furthest point, finished, Join clicks + when. Sales card shows the line + a watch map bar (light = once, dark = again, grey = skipped). Phone notifications: first open, finished, Join click. Olly's views never count (Access cookie + hubOwner mark).
- **Page:** white, title "Let's Help You Find Your Person", "Hey <first name>", native player + Full screen button (top-LEFT, so it never covers Olly's webcam, which is top-right in the video), Join button under the video + over it at the end → https://ollyhenson.com/join.
- **Video seeking:** Pages ignores Range for assets, so the function slices bytes itself (iPhones need 206). Tested 2026-11-10.
- **Replacing a video:** copy the new mp4 over `hub-site/public/vsl/vsl-men.mp4` / `vsl-women.mp4`, bump the number in `v.src = base + "/vsl-2.mp4"` (public/vsl-view.html) so Cloudflare's cache can't serve the old file, deploy. A deploy takes ~50 s to reach hub.ollyhenson.com: test after that, not straight away (2026-11-10 I chased a "bug" that was just the old version still live).
- Both videos LIVE 2026-11-10: women 4:34 (21 MB), men 3:36 (17 MB). Originals in marketing/assets/sales-video/recordings/.
- Slides: men J8ScpxcRzJsdGcg1kJzft1, women UEZE3B1m5Pp6MRcxGnGLC5 (marketing/assets/sales-video/vsl/).

## Sales video (VSL) v2 (2026-11-10, recorded + LIVE)

One video per gender, sent only once they've bought into the plan and ask "how do I start / what's the price". It answers Frankie's 5 questions in order (what is it, will it work for me, how does it work, how much, how do I start) and nothing else.

### Process
1. **Show every slide up front in the agreed order, then fix slide by slide** (Olly: "give me all the slides up front… it's easy to do it that way"). Don't drip one slide at a time.
2. **The 11 slides** (`marketing/assets/sales-video/vsl/vsl-men.html` / `vsl-women.html`): 1 Let's Help You Find Your Person · 2 Problem → Solution (each photo with its own words) · 3 The End Result · 4 This Works For You If… · 5 The Exact Steps (numbered list only) · 6 The Investment · 7 The Timeline · 8 Click The Join Button · 9 Make Your Account · 10 Choose Monthly Or Annual And Add Your Card · 11 Look Out For My Email And My Message.
3. **Preview, then final:** click-through slideshow artifact while editing (`tools/slides_artifact.py`, Olly 2026-11-21: no phone preview), then the plain full-screen slides when Olly says he's recording ("final full screen slides with no mobile view"). Keys: F = full screen, arrows/click = next.
4. **Women's version = copy of the men's with the female photos + chat** (`vsl-women.html`). Any change goes into BOTH files.
5. **After recording:** MP4 into `marketing/assets/sales-video/recordings/`, copy to `hub-site/public/vsl/vsl-<men|women>.mp4`, deploy, wait ~50 s, test (see "Sales video page" above).
6. **When Olly asks to "see" the page, give a playable preview** (a small copy of the video in the artifact, tracking off). A still he can't press play on isn't a preview.

### Rules
- **Titles name what they want, not the program** ("Let's Help You Find Your Person", not "How To Get Started With The Heart Attractor Program"). Why: Frankie, the name of the program doesn't matter to them.
- **The steps live in the plan, not the video.** The video keeps only the numbered list; Olly says "you've seen these in your plan". Why: they've already bought into the plan.
- **Proof = the outcome, not a member quote.** Slide 3 is the end-result picture + "someone you can marry, have children with and settle down with". Why (Olly): "I don't want to bullshit my proof."
- **Price wording (Olly):** "$2,500 for the year, or $497 a month if you'd like to split it", then "And for that you get" ticks (first tick ends "(access to all bonus materials)"). The outcome photo sits next to the price.
- **"This works for you if" (Olly's words):** It's the biggest priority in your life · You can spare 10 minutes a day to meditate · You're willing to ask for help when you need it.
- **Timeline (Olly's words):** First 2 Weeks / First 12 Weeks / Nine-Month Mentorship, after the price.
- **One fixed layout on every slide:** picture box left (640×640), webcam square top-right (Google Vids, set once, never moved), words under the webcam. Why: "it looks all over the place" when every slide has its own layout.
- **Wide photos stay wide; words sit next to the photo they describe.**
- **Every "how to start" step shows the real screen on a laptop AND a phone** with the button outlined (join page, sign-up, Monthly/Annual, the email, the DM).
- **Screens must be readable at full size.** Small phones in a frame look poor even in the real video: use tall close-up crops (`tools/phone_pov_hq.py`, `CROP=` and `NOARROW=1`).
- **A rebuilt screen must look exactly like the real screenshot** (same colours, layout, words), just sharp (`vsl/mock/email.html`, `dm.html`, `payment.html`). Why: Olly rejected a "cleaner" restyle.
- **Chats: make one up rather than blur everything** (blurred chats "aren't helpful"): a member asks for help, Olly answers, then a video reply. Support only, never a result (`vsl/mock/chat.html` + `chat-female.html`).

### Examples
- Good slide 4 chat: "Hey Olly, I've got a second date on Saturday and I'm already overthinking it. How do I deal with that?" → Olly's short practical reply → Sunday: "The old worry came back when she didn't reply straight away. Is that normal?" → "Totally normal. Recorded you a quick video 👇" + video card.

### Never (VSL v2)
- Never Loom: our own player only (Olly: "I don't want to use Loom at all").
- Never the 14-day guarantee in the video (Olly mentions it only if asked) and never "(minimum 3 months)".
- Never show a real card number, surname or member conversation: rebuild the screen with an empty card box / blur.
- Never put anything in the webcam corner, and never move the webcam between slides.
- Never crop a horizontal photo into a tall strip.
- Never claim a deploy is broken in the first minute: it takes ~50 s to reach hub.ollyhenson.com.

<!-- Changelog
- 2026-11-10: Skill review. Added "Sales video (VSL) v2" (process, rules with reasons, example chat, Never list) from Olly's edits this session: no Loom, own tracked page; outcome titles; steps stay in the plan; end-result picture instead of member proof; his works-if, price and timeline wording; no guarantee, no 3-month minimum; one fixed layout with the webcam top-right; wide photos stay wide; words next to their photo; real screens on laptop + phone, readable, exact copies; made-up support chat instead of blur; all slides up front; playable previews. Marked the YouTube/Loom hosting plan, the 🎥 YouTube VSL button, the old VSL map and its 14-day guarantee as superseded.
-->


## Flow v3 (Olly's wording, 2026-11-10) - CURRENT, replaces every earlier message order
1. WhatsApp / iMessage ALWAYS first: "Hey [Name], it's Olly Henson. / Just got your application for The Heart Attractor Program, thanks for filling it in. / Give me a few minutes, I'm recording you a quick voice note with a plan of how I'd help you with this."
2. Voice note 1: confirms the application looks good, asks if they'd like their plan of action sent through.
3. Email just after: "...All looks really good. / I've sent you a message on WhatsApp (or iMessage) with the next steps. / Chat soon, / Olly". No phone number = one email that asks the plan question itself.
4. Once they reply: make + send their plan link (plan.html message unchanged), then voice note 2: "here's the plan of action I've put together for you, that we'll use to help you meet this special person. Let me know your thoughts once you've checked it out."
5. Wait for them to check it (the card shows opens, page reached and time per page). Answer questions one by one.
6. When they ask how to start / the price: send their own video link (/p/<code>/video) + voice note 3: "it goes through the program, the steps, the investment and how to get started... any questions, just reply here" (Frankie's saved line: "Price and everything's in there, so you can watch it in your own time... Any questions, just reply here").
7. One follow-up idea, only if they watched. Then the join link.
Removed from the card: "application successful" texts, the old voice note plan, email-only plan, the YouTube sales video (youtu.be/PhcbPYPfUU0).

Stages (2026-11-10): New → Contacted → Replied → Plan sent → Plan read → Asked questions / next steps (Olly: after plan read) → Video sent → Video watched → Clicked Join → Joined (+ Gone quiet, Not a fit). Plan sent/read, Video watched and Clicked Join move by themselves from the tracking; Asked questions is ticked by hand.

<!-- 2026-11-10 skill review: Flow v3 is current (see "Flow v3" near the end): first message -> voice note -> email; plan
+ voice note once they reply; their own video page + voice note; one follow-up idea; join link. Stages v3 add Plan sent,
Plan read, Asked questions / next steps (Olly's), Video sent, Video watched, Clicked Join. Superseded: the voice-note-only
plan, "application successful" texts, the master YouTube VSL message. -->

### Plan v3.1 (2026-11-11): personal note + edit on the page (CURRENT editor)
**Process (Hub > Sales > applicant card > 📄 Plan of action):**
1. Check the auto-filled answers (sidebar or on the pages, they stay in sync).
2. Click the dimmed **personal note** page (before the closing page: "A personal note from me / What We're Going To Do For You") and write Olly's own summary of what he'll do for this person, tied to their application. Enter = new line.
3. Click any other text on any page and type over it to personalise it (shaded pink once changed). "Where you are now" / "Where we're going" on the pages write back into their sidebar boxes.
4. Save changes, then Make their link / send as before. Every edit shows on the same link.

**Rules:**
- **Edits happen in the document, always on, no mode button.** Why: Olly asked to "make edits within the document itself, rather than having to do it in the sidebar"; a toggle was one step too many.
- **Edits are per person, never the template.** Why: Olly edits "not very often, just to make it personal". Stored as JSON in the hidden `edits` field, keyed by a hash of the template wording, so a later template change to that line drops the old edit instead of landing on the wrong line. Undo all wording edits restores the standard plan.
- **The note page only reaches the applicant when written.** Empty = hidden on their link, left out of the page count, images and PDF; in the editor it shows dimmed with a prompt so Olly can click into it. Page numbers ("Page X of Y") are counted live (13 without a note, 14 with).
- **Keep the sidebar working.** Why: Olly said "keep everything as it is, but also..."; new editing is added beside the old, never replacing it.
- Pasted text comes in plain; only bold/italic/line breaks survive (no outside formatting or code on their link).
- If Olly types "You want ..." on the page, it's stripped from the send message's goal (no "get you to you want a ...").
- Editing a heading that contains their name freezes the name in that heading (later name-box changes won't update it). Tell Olly if he renames someone after editing a heading.
- /api/plan limits: `edits` 30,000 chars, `note` 6,000, other fields 2,000.
- **The builder owns plan-view.html completely.** The read-tracking + heat-map JS now lives in `tools/build_hub_plan.py`. Why: running the builder this session wiped the live tracker (it had been hand-added to the output); it was restored from git and ported. After any builder change, `git diff` plan-view.html should show only the intended change.

### Never (plan v3.1)
- Never make Olly switch on an edit mode or go to the sidebar to change wording on a page.
- Never apply one applicant's wording edits to the template or another applicant.
- Never show an empty note page (or "…") to the applicant.
- Never add JS by hand to `plan-view.html` / `plan.html`: put it in the builder, then rebuild.

<!-- 2026-11-11 skill review: added Plan v3.1 (personal note page + per-person wording edits, then always-on editing on the
page per Olly's follow-up). Removed the same-day "✏️ Edit the wording" button rule (overridden: no mode button). Added the
builder-owns-plan-view rule after a rebuild wiped the read tracker. New Never list for v3.1. -->

### Step-by-step guide follow-up (2026-11-12; REMOVED from the cards 2026-11-20, replaced by the Gone cold follow-up)
File: `marketing/carousels/meet-your-person/Step-By-Step Guide - Olly Henson.pdf` (15 pages: the approved "Meet your person" explainer + closing page "Emotional Resonance Is What We Build With You Personally / Inside The Heart Attractor Program, so you build the belief you need to meet your person"). Rebuild: `python tools/build_ig_carousel.py`, `node tools/export_pdf.js marketing/carousels/meet-your-person/guide-pdf.html "<out>.pdf"`, copy to hub-site/public/guide/step-by-step-guide.pdf, deploy. Pages as images: `JPG=1 node tools/export_carousel.js marketing/carousels/meet-your-person/guide-pdf.html "business management/business hub/hub-site/public/guide"` (delete the contact sheet it writes there). TRACKED (2026-11-12): card '📘 Step-by-step guide follow-up (make their link)' -> POST /api/guideviews?id= makes their code (reuses the plan code if they have one) -> their page https://hub.ollyhenson.com/p/<code>/guide (public/guide-view.html: 15 page images stacked, Download as a PDF) logs opens, furthest page, seconds per page -> KV guideview:<id>; card line + heat bar (lmGuideLine), push 'Guide opened' on first open; tapping WhatsApp/Email/Copy marks sent. Olly's own views skipped. Plain PDF (untracked) stays at https://hub.ollyhenson.com/p/guide.
- Olly's rules: any stage, for anyone who's gone quiet (plan sent and no reply, or plan offered and no reply), roughly 2 to 3 days. Not a stage on the board.
- NO message text, ever: the card's WhatsApp/iMessage/Email buttons open with only their guide link in; Olly writes his own words around it for where they are in the funnel.
- Closing page = one line only. Never list what's inside the program (trainings, meditation, calls, community) and never add a call to action like "get back to me".

**Process (how it was built, with why)**
1. Talk it through and check with Olly before building ("just check with me before that you can build it"), then show a preview of the PDF before it goes live.
2. Portrait 4:5 pages so it reads on a phone. Olly asked if it was landscape: check the page sizes before answering (a desktop viewer made it look wide).
3. Tracked per-person link, not the bare PDF. Why: a PDF can't report opens and Olly asked for "if they've clicked it, how much they read", like the plan.
4. It lives on their card as its own thing with its own status: "📘 Guide sent, not opened" (amber) → "📘 Guide opened N× · page X/15" (green). Not a board stage.
5. Olly's own phone and laptop never count as an open (Access cookie or his saved IP).
6. When he can't see a new card row, show him exactly where it is (pop-up → Details → Send column) with a screenshot of a test applicant, don't just say it's deployed.

### Syncing the plan of action to the guide (2026-11-12, preview sent, waiting for approval)
The plan's wording should follow the guide's argument (pages 2, 3, 7, 9 change; photos and design stay). Rules:
- Before/after preview of only the changed pages first, side by side (`planshot.js` pattern). Nothing changes on the template or Hub until Olly approves.
- Tell him the side effects up front: already-sent plan links show the new wording; per-person edits on those exact lines drop back to the standard text; anything removed (brainwave lines) is said out loud with an offer to keep it.
- After approval: patch `funnel/plan-of-action.html`, `python -I tools/build_hub_plan.py` (never hand-edit plan-view.html), diff, jscheck, `tools/deploy-hub.sh`, open one live plan.

<!-- 2026-11-12 skill review: Step-by-step guide follow-up: added the build process and why (check before building, portrait,
tracked link because a PDF can't be tracked, own status on the card, owner opens skipped, show where a new row is). Added
the plan-sync rules (preview changed pages only, state side effects, approval before patch + rebuild). -->

<!-- 2026-11-12 skill review: the plan pages are now Plan v4 (funnel/skills/skills_plan-v4.md): a personal 20-page
diagnosis plan built per applicant. Plan v3.1's template pages are overridden for applicants; the flow (Flow v3) stays. -->

<!-- 2026-11-15 skill review: first message to every good applicant is now the short plan link (note at the top); the 1b
"would you like a plan?" voice note is retired; full plan = section 2 follow-up. Full process: funnel/skills/skills_plan-v4.md v5 section. -->

## Sales video v3 (2026-11-16, ONE generic video, recorded + LIVE) - overrides the per-gender rules above
- **One video for men and women:** `vsl-women.html` = `vsl-men.html` (identical; edit one, copy over the other). `hub-site/public/vsl/vsl-men.mp4` = `vsl-women.mp4`. Why (Olly): "just use the women's one… let's just do one generic one". Chats and images say "them/they"; the outcome picture is the hands with rings (`plan-img/hands-rings.jpg`), the intellectualization box opens with the woman image.
- **Messaging = the plan's:** problem "You operate from survival-based emotions: worrying, doubting and stressing about meeting someone. You think something might be wrong with you, so you try to fix yourself and control the outcome. It's what keeps people single." → solution The Emotional Resonance Method → 5 steps ending "Watch the magic happen as you meet your person".
- **Order:** the Timeline comes BEFORE the Investment (overrides "after the price"). Price: "$2,500 for the year, or $497 a month for 12 months if you'd like to split it. It's a one-year program."
- **Slide 8:** "Click Start The Heart Attractor Program Under This Video"; the page button says "Start The Heart Attractor Program" (not Join). **Slide 12:** "I'll Give You Access To The Materials".
- **"What you'll get" (for the next recording, Olly 2026-11-16):** **The confidence, energy and belief** you need to meet someone · **Constant support and guidance** to make sure it turns into a long-term, high-quality relationship · The Emotional Resonance Method trainings, the daily meditation, private DM support from me and access to all bonus materials.
- **Deploy:** recordings come out ~34 MB; Pages refuses files over 25 MiB → 2-pass x264 at ~380k video bitrate (23 MB). Poster + link preview from the FIRST slide (poster-<n>.jpg, video-og-<n>.jpg); bump <n> in vsl-view.html and [[path]].js together so caches can't serve the old one.

### Never (VSL v3)
- Never make men's and women's versions again unless Olly asks.
- Never put a comment inside a statement in functions/p/[[path]].js (it broke `url` → error 1101 on every /p/ link). Test a /p/ link after every functions deploy.
<!-- 2026-11-17 skill review: v3 generic video from Olly's edits (one version, hands-with-ring, survival-based emotions + "you think something might be wrong with you", timeline before price, $497 x 12 + one-year line, button wording, slide 12, What you'll get); 25 MiB re-encode; 1101 comment bug. Per-gender and "timeline after the price" rules overridden. -->

## Sales video v4 (2026-11-20, re-recorded + LIVE) - overrides v3 slide/price rules

### Process
- Slides: marketing/assets/sales-video/vsl/vsl-women.html (= vsl-men.html, copy one over the other). Show Olly the slides as a click-through slideshow: `python -I tools/slides_artifact.py <slides.html> <out.html>` then publish (artifact VuogCg1sq2smJqj3qq9FDj). Not tools/vsl_preview.py (desktop + phone rows) any more.
- Replace the video: put the raw file in marketing/assets/sales-video/recordings/ (e.g. "Sales Video v2.mp4") → ffmpeg 2-pass to under 25 MB (video kbps ≈ 25 MB × 8 ÷ seconds − 96 audio: 7:09 → 300k = 21.7 MB, 9:32 → 235k = 24.3 MB, both sharp) → copy over hub-site/public/vsl/vsl-women.mp4 AND vsl-men.mp4 → bump vsl-N.mp4 in public/vsl-view.html → deploy-hub → transcribe (tools/transcribe.py on a scratch folder) into funnel/sales-video-women-transcript.md.

### Rules
- Keep the recorded slides exactly as they are; change only what Olly names. Why: "I want the exact same slides that I recorded", after I had rewritten the timeline, payment step and added slides.
- Price slide (2026-11-21, overrides the annual-first $497 version): **Monthly $250 a month, cancel anytime** is the main card on top; **Annual $2,500 for the year** under it with a "Save $500" tag, "That's $208 a month. 2 months free."; a line under both: "The price goes up over time as more people join, so today's price is the lowest it will be." Right side unchanged: "For This You'll Get" (3 points) + green 30-Day Guarantee. Why: Olly, "497… it's putting people off. It's too much"; the high monthly meant to push people to annual backfired.
- Timeline slide = **stages, not weeks** (2026-11-21): eyebrow "The Stages", "Here's how it unfolds, stage by stage." Stage 1: Get Clear (get into the materials, confirm your Emotional Resonance, start the daily meditation) / Stage 2: Embody It (feel the shift inside) / Stage 3: Watch It Unfold (make the right decisions, I guide you to build a long-term relationship). Why: Olly asked for stages; no "First 2 Weeks / 12 Weeks / Nine-Month Mentorship".
- Slideshow for recording: one slide at a time, arrows / space / click; ONLY the Full screen button on screen (no Back/Next bar, no slide number). Why: Olly while recording, "remove that completely", then "I still need the full screen button, I just wanted to get rid of the middle thing".
- A price change touches: Hub (MRR_PRICE_MONTHLY / SALES_PRICE_MONTHLY + every "$X" label), the price slide, the Skool screenshot images in the slides (vsl/img join-desktop, join-phone-tall, pay-desktop, pay-phone-tall: repaint with vsl/img/_497-originals/reprice.py, set the boxes per image), the transcript, and Olly's real Skool join page / checkout (he does that). List the ones I didn't do.
- The 30-day "do the work" guarantee is part of the offer for every buyer (meditation daily, all trainings, message Olly weekly → full refund).
- Step 2 of "How it works" = "Learn to embody your Emotional Resonance"; step 5 = "Have meeting someone unfold naturally".
- Pricing advice: base it on researched comparables with sources and say which parts are guesses. Why: Olly asked what my numbers were based on.

### Never
- Never split "what you get" onto its own slide away from the price.
- Never add deliverables (weekly live calls, onboarding call, price lock) that Olly hasn't confirmed.

<!-- 2026-11-20 skill review: new CURRENT APPLICANT PROCESS at the top (Olly's editor wording: confirm intellectualization -> "I completely get it" + template plan -> video; one route per card; gone cold follow-up + tag; ranking; hesitant-buyer guarantee). Removed the overridden 2026-11-15 FIRST MESSAGE block and the 2026-11-20 interim notes (plan in first message, "Does that sound like where you are right now?", 1d offer message). Nevers: no 🙏, no invented deliverables, no Love Scale, monthly is 12 payments, ask before removing card features. -->


<!-- 2026-11-21 skill review: CURRENT PROCESS replaced with flow v5 (one personalised video message + follow-up email, email-only version; card writes it from the application; old cards in "Spoken to, video not sent yet"). Overridden and removed: confirm-intellectualization-first step, plan before video, "never cancel anytime / 12 payments of $497". New: $250 cancel-anytime price slide, stages slide, slideshow-only previews (only the Full screen button), price-change checklist incl. repainting the Skool images, bitrate formula for longer videos. Example replaced with the personalised first message. Video v3 = 9:32. -->

<!-- 2026-11-24 skill review: step 4 rewritten with Olly's new 1a wording (paragraph per point, "I say that because", "But even after all of this -", sign-off Olly Henson) and the 1b email (subject "Your application status: pending", no link, Olly writes the 'how we can help' line). Step 9 now the daily 📅 Follow-up + Helpful Reel routine (replaces 🏆 Rank applicants); new step 10 for adding a client by hand without the welcome email. Rules added: follow-ups are helpful content not a pitch, must name their answers (vague 'made me think of you' rejected), 3-day gap from last message or application, phone-first card layout. Never list: vague follow-ups, pitching in Reel follow-ups, chasing within 3 days, applicant names in committed files. Example replaced with the current 1a wording + a good and a weak Reel follow-up. Removed a stray note that named an applicant. -->
