/**
 * add_reels_this_week.mjs
 * Adds 6 reels for Thu 29 May and Fri 30 May to the Instagram Reels database.
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

const DB_ID = '36e30e58-6a0d-81e7-8c2a-e6c4f729915a';
const CTA_CAPTION = `➡️ Comment HEART below and I will send you access to my free community where I teach Heart Coherence — a simple daily practice to calm your nervous system and get your life back from chronic symptoms.\n\n👉 Or grab it directly here: https://www.skool.com/the-healing-code-8609`;

const reels = [
  // ── Thu 29 May ────────────────────────────────────────────────────────────
  {
    title: 'Why Chronic Fatigue Syndrome Is a Nervous System Problem',
    date: '2026-05-29', type: 'Argument-Based',
    hook: 'If you have been diagnosed with chronic fatigue syndrome — or suspect you might have it — this is the explanation that finally made sense to me.',
    script: `If you have been diagnosed with chronic fatigue syndrome — or suspect you might have it — this is the explanation that finally made sense to me.

Chronic fatigue is not laziness. It is not depression. It is not something you can push through.

It is a nervous system stuck in survival mode — using every available resource just to keep you upright.

There is nothing left over for energy. For focus. For life.

And something called Heart Coherence is what changes the default state the body is running from.

Comment HEART below.`,
    caption: `Chronic fatigue syndrome is not laziness. It is not something you push through.

It is a nervous system using every resource it has just to keep you upright.

${CTA_CAPTION}`
  },
  {
    title: 'The Difference Between Surviving and Living',
    date: '2026-05-29', type: 'Argument-Based',
    hook: 'There is a difference between surviving your days and actually living them. And chronic illness puts you firmly in the first category.',
    script: `There is a difference between surviving your days and actually living them.

Chronic illness puts you firmly in the first category.

You manage your energy. You plan around your symptoms. You cancel things. You stay home. You get through the day.

That is not living. That is survival mode — literally.

And the reason you are stuck in it is because your nervous system is running a survival response as its permanent default.

Something called Heart Coherence is what shifts it.

Comment HEART below.`,
    caption: `Managing symptoms. Cancelling plans. Getting through the day.

That is not living. That is survival mode — literally.

${CTA_CAPTION}`
  },
  {
    title: 'Why Your Good Days and Bad Days Feel Random',
    date: '2026-05-29', type: 'Educational',
    hook: 'Good days and bad days with no obvious pattern. If that sounds familiar — here is what is actually going on.',
    script: `Good days and bad days with no obvious pattern.

One day you feel almost normal. The next you can barely get out of bed. And you cannot figure out why.

Here is what is happening.

When the nervous system is stuck in fight or flight, tiny fluctuations in stress — a bad night's sleep, a difficult conversation, a busy day — push it over the threshold into a flare.

It is not random. It is a sensitised system reacting to inputs you cannot always control.

Something called Heart Coherence lowers the baseline — so the system is not sitting right on the edge.

Comment HEART below.`,
    caption: `Good days and bad days with no obvious pattern.

It is not random. It is a sensitised nervous system sitting right on the edge of a flare.

${CTA_CAPTION}`
  },

  // ── Fri 30 May ────────────────────────────────────────────────────────────
  {
    title: 'You Have Tried Everything — Except This',
    date: '2026-05-30', type: 'Argument-Based',
    hook: 'You have tried the doctors. The alternative medicine. The diets. The supplements. And you are still stuck. Here is what is missing.',
    script: `You have tried the doctors. The alternative medicine. The diets. The supplements.

And you are still stuck.

Not because you have not tried hard enough. Not because healing is not possible for you.

But because everything you have tried has been aimed at the symptoms — not the state of the nervous system producing them.

The fight or flight loop is still running. And until you address that directly, the symptoms keep coming back.

Something called Heart Coherence addresses it directly.

Comment HEART below.`,
    caption: `You have tried everything. And you are still stuck.

Not because healing is not possible for you. Because everything has been aimed at the symptoms — not the loop producing them.

${CTA_CAPTION}`
  },
  {
    title: 'What Anxiety and Chronic Illness Have in Common',
    date: '2026-05-30', type: 'Educational',
    hook: 'Anxiety and chronic illness look very different on the surface. But they share the same root cause.',
    script: `Anxiety and chronic illness look very different on the surface.

But they share the same root cause.

Both are driven by a nervous system stuck in fight or flight.

With anxiety, the alarm shows up as racing thoughts, worry, and fear. With chronic illness, it shows up as physical symptoms — pain, fatigue, brain fog, inflammation.

Same loop. Different expression.

Which is why something called Heart Coherence works for both.

It is not treating the symptom. It is changing the state the body defaults to.

Comment HEART below.`,
    caption: `Anxiety and chronic illness look different. But they share the same root.

A nervous system stuck in fight or flight — expressing itself differently in different people.

${CTA_CAPTION}`
  },
  {
    title: 'Back to Life — What That Actually Means to Me',
    date: '2026-05-30', type: 'Mission-Based',
    hook: 'Back to Life. That is the name of my community. And I want to tell you what it means.',
    script: `Back to Life. That is the name of my community.

And I want to tell you what it actually means.

It does not mean going from sick to fine overnight.

It means the Tuesday where you notice you did not feel anxious in the morning. The walk you did not have to recover from. The dinner where you were actually present.

These small moments are the nervous system finding its way back to safety.

And something called Heart Coherence is the daily practice that creates them.

Comment HEART if you want your life back.`,
    caption: `Back to Life is not a dramatic overnight transformation.

It is a Tuesday where something small is easier than it was last week.

${CTA_CAPTION}`
  },
];

let added = 0;
for (const reel of reels) {
  const res = await fetch('https://api.notion.com/v1/pages', {
    method: 'POST',
    headers,
    body: JSON.stringify({
      parent: { database_id: DB_ID },
      properties: {
        Title:          { title: [{ type: 'text', text: { content: reel.title } }] },
        Date:           { date: { start: reel.date } },
        'Type of Post': { select: { name: reel.type } },
        Hook:           { rich_text: [{ type: 'text', text: { content: reel.hook } }] },
        Script:         { rich_text: [{ type: 'text', text: { content: reel.script } }] },
        Caption:        { rich_text: [{ type: 'text', text: { content: reel.caption } }] },
        Status:         { select: { name: 'Idea' } },
      },
    }),
  });
  const json = await res.json();
  if (!res.ok) console.error('Failed:', reel.title, JSON.stringify(json));
  else { console.log(`✅ ${reel.date} — ${reel.title}`); added++; }
}

console.log(`\nDone. ${added}/6 reels added.`);
