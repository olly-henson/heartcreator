/**
 * add_community_posts_this_week.mjs
 * Adds 5 posts for Wed 28 May through Sun 1 June.
 */

import { readFileSync } from 'fs';
import { resolve } from 'path';

const envPath = resolve('C:/Users/Olly/AI OS/marketing/.env');
const env = Object.fromEntries(
  readFileSync(envPath, 'utf8')
    .split('\n')
    .filter(l => l.includes('=') && !l.startsWith('#'))
    .map(l => l.split('=').map(p => p.trim()))
);

const headers = {
  Authorization: `Bearer ${env['NOTION_API_TOKEN']}`,
  'Content-Type': 'application/json',
  'Notion-Version': '2022-06-28',
};

const DB_ID = '36e30e58-6a0d-81d1-8d13-e38b0136d61e';
const CTA = `If you'd like to learn how to regulate your nervous system with Heart Coherence so that you can get your life back, check out the link to my free community in the comments below.`;

const posts = [
  {
    title: 'How Heart Coherence Gave Me My Life Back',
    date: '2026-05-28', type: 'Personal Story',
    image: 'Personal photo from around 2018 or a candid moment from the difficult period. Raw and real.',
    post: `How Heart Coherence Gave Me My Life Back 💚

Back in 2018...

My life got considerably worse.

After a series of pretty serious head injuries, I lost everything:

⏩ Business
⏩ Long-term relationship
⏩ Social life
⏩ Ability to drive

It was bad.

I spent a small fortune and a lot of my time trying to get help...

But nothing moved the needle.

When I went down the traditional routes of healthcare...

It was a dead end.

Despite having tests and scans...

There didn't seem to be anything really 'wrong' with me.

But I knew that there was.

I was exhausted, anxious, in pain, dizzy and battling with severe migraines.

It was eventually determined that I had, what they call:

"Post-Concussion Syndrome"

A chronic condition that no one really knows how to heal.

But that didn't stop me because I KNEW I could heal and I wasn't going to give up on the life I wanted to live.

Things changed considerably when I decided to go ALL IN on Heart Coherence.

Heart Coherence gives you the power to regulate your autonomic nervous system.

To rebalance yourself mentally, physically and emotionally.

You essentially can keep giving your body the love, energy and care it needs to rebalance itself at the deepest level.

What I love about it most is that it puts you in control.

I didn't need to keep going to see different healthcare professionals anymore.

I could simply, whenever and wherever I wanted...

Take some time for myself and provide my body with the recharge that it needed.

I didn't half arse it either.

I went all in because I knew that my body and mind really needed this time.

${CTA}

Olly`
  },
  {
    title: 'The Symptoms Nobody Could Explain',
    date: '2026-05-29', type: 'Personal Story',
    image: 'Quiet, still photo — at home or outdoors alone. Conveys the isolation of unexplained symptoms.',
    post: `For a long time I had symptoms that nobody could explain.

Exhaustion that rest didn't fix.

Pain that had no clear cause.

Brain fog that made simple things feel impossible.

And every test coming back normal.

I remember sitting in yet another appointment being told there was nothing wrong with me.

Knowing full well that there was.

The problem wasn't that nothing was wrong.

The problem was that what was wrong wasn't showing up on the tests they were running.

A nervous system stuck in survival mode doesn't appear on a scan.

But it creates every one of those symptoms.

That was the missing explanation I had been looking for.

And once I understood it, everything else started to make sense.

${CTA}

Olly`
  },
  {
    title: 'What Does Healing Mean to You?',
    date: '2026-05-30', type: 'Engagement',
    image: 'Selfie — warm and open. Genuinely curious.',
    post: `What does healing actually mean to you?

Not the medical definition.

What does your life look like on the other side of this?

What are you doing? Who are you with? How do you feel?

Comment below. I genuinely want to know.

Because the clearer that picture is, the more real it becomes.

Olly`
  },
  {
    title: 'The Day I Stopped Fighting My Body',
    date: '2026-05-31', type: 'Personal Story',
    image: 'Aspirational outdoor photo — walking, nature, or a calm moment. Represents peace with the body.',
    post: `For years I was at war with my body.

Frustrated with it. Pushing against it. Trying to force it back to normal.

It didn't work.

Every time I pushed, the symptoms pushed back.

The turning point came when I stopped fighting and started listening.

Not in a passive, give-up kind of way.

In a very active, deliberate way.

I started working with my nervous system instead of against it.

Giving it what it actually needed to feel safe.

Something called Heart Coherence was the practice that made that possible.

Not overnight.

But consistently, day by day, the baseline started to shift.

And the body I had been fighting...

Started working with me.

${CTA}

Olly`
  },
];

let added = 0;
for (const p of posts) {
  const res = await fetch('https://api.notion.com/v1/pages', {
    method: 'POST',
    headers,
    body: JSON.stringify({
      parent: { database_id: DB_ID },
      properties: {
        Title:          { title: [{ type: 'text', text: { content: p.title } }] },
        Date:           { date: { start: p.date } },
        'Type of Post': { select: { name: p.type } },
        Post:           { rich_text: [{ type: 'text', text: { content: p.post } }] },
        'Image Idea':   { rich_text: [{ type: 'text', text: { content: p.image } }] },
        Status:         { select: { name: 'Idea' } },
      },
    }),
  });
  const json = await res.json();
  if (!res.ok) console.error('Failed:', p.title, JSON.stringify(json));
  else { console.log(`✅ ${p.date} — ${p.title}`); added++; }
}

console.log(`\nDone. ${added}/4 posts added.`);
