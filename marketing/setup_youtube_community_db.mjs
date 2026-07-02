/**
 * setup_youtube_community_db.mjs
 * Creates the YouTube Community Posts tracking page and database inside Daily Operations,
 * adds a yellow callout block to the main page, and populates 14 posts in the backlog.
 *
 * Run: node "C:\Users\Olly\AI OS\marketing\setup_youtube_community_db.mjs"
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

const DAILY_OPS_PAGE_ID = '36e30e58-6a0d-81c0-b131-de443f0890ef';
const CTA = `If you'd like to learn how to regulate your nervous system with Heart Coherence so that you can get your life back, check out the link to my free community in the comments below.`;

const posts = [
  // ── Week 1 ────────────────────────────────────────────────────────────────
  {
    title: 'At My Lowest Point',
    date: '2026-06-01', type: 'Personal Story',
    image: 'Personal photo from a difficult period — candid, raw, unposed. The more real the better.',
    post: `At this point I was completely done with my life if I am honest.

Not because I wanted it to end.

But because I could not recognise the person I had become.

The exhaustion was constant.

The pain never fully went away.

I was sleeping through the day and wide awake at night.

And somewhere along the way I had stopped laughing.

Stopped feeling connected to anything or anyone.

I was just surviving.

What I did not understand then was that my nervous system had been stuck in survival mode for so long that it had forgotten what safety felt like.

Everything changed when I stopped trying to treat the symptoms and started working directly on the nervous system itself.

Something called Heart Coherence was the practice that finally made the difference.

Not overnight. But consistently, over time, I started to feel like myself again.

If you are in that place right now — I want you to know it is not permanent.

${CTA}

Olly`
  },
  {
    title: 'The Question Nobody Asked Me',
    date: '2026-06-02', type: 'Engagement',
    image: 'Selfie — warm, approachable, direct eye contact. Feels like Olly is genuinely asking the question.',
    post: `What is the one symptom that has affected your quality of life the most?

Not the diagnosis. The symptom.

The thing that stops you doing what you love. That changed your plans. That you wish people understood.

Comment below. I read every reply.

Olly`
  },
  {
    title: 'Why I Became a HeartMath Practitioner',
    date: '2026-06-03', type: 'Personal Mission',
    image: 'Milestone photo — certification, training, or a meaningful professional moment.',
    post: `Back in 2022 I made a decision that changed everything.

I decided to become a certified HeartMath Practitioner.

Not because I had it all figured out.

Because I did not.

I had been struggling with chronic symptoms for years. I had tried the medical routes and the alternative ones. I had read the books and done the practices.

And I was still stuck.

When I discovered Heart Coherence and what it does to the nervous system, something finally made sense.

I did not just want to use it for myself.

I wanted to understand it deeply enough to teach it to others who were where I had been.

There are too many people suffering with symptoms that nobody can explain, trying everything and getting nowhere.

Heart Coherence is not a magic fix. But it is the most direct route to the root cause I have ever found.

That is why I do this work.

${CTA}

Olly`
  },
  {
    title: 'What My Wedding Day Taught Me About Healing',
    date: '2026-06-04', type: 'Personal Story',
    image: 'Wedding photo — a moment of joy or connection from the day.',
    post: `I did not think I would be able to enjoy my own wedding day.

That sounds dramatic. But that was where I was.

The chronic symptoms had been bad enough that I had spent months worried I would be exhausted, in pain, or just not present for one of the most important days of my life.

⏩ The brain fog that made conversations feel like wading through mud
⏩ The exhaustion that no amount of rest seemed to fix
⏩ The physical aching that was always there in the background
⏩ The emotional flatness that had replaced what used to be joy

What I realised was that none of these were separate problems.

They were all coming from the same place — a nervous system that had been stuck in fight or flight for so long it had forgotten how to feel safe.

Working with Heart Coherence changed that.

Not all at once. But gradually, the baseline shifted.

And on my wedding day — I was there. Fully present. Feeling everything I was supposed to feel.

That is what healing actually looks like.

${CTA}

Olly`
  },
  {
    title: 'The Worst Part of Chronic Illness Nobody Talks About',
    date: '2026-06-05', type: 'Personal Story',
    image: 'Quiet, introspective selfie or a candid moment alone. Conveys the invisible nature of chronic illness.',
    post: `People talk about the physical symptoms of chronic illness.

The pain. The fatigue. The brain fog.

But the part nobody talks about is what it does to your sense of self.

The version of you that used to laugh easily. That had plans and energy and presence.

You can feel that person slipping away. And the grief of that is real.

I went through it.

For a long time I told myself I just needed to push through. That if I managed the symptoms well enough, the rest would come back.

It did not work like that.

What actually brought me back to myself was not managing the symptoms.

It was changing the state my nervous system was running from.

When the body finally felt safe, everything else followed.

The laughter. The connection. The sense that life was worth showing up for.

If you have lost that — it is still in there.

${CTA}

Olly`
  },
  {
    title: 'Poll — What Have You Tried?',
    date: '2026-06-06', type: 'Engagement',
    image: 'Selfie — casual and curious. Feels like a genuine question from a real person.',
    post: `Quick question for you.

What route have you relied on most in trying to manage your chronic symptoms?

⏩ Conventional medicine (doctors, specialists, medication)
⏩ Alternative medicine (acupuncture, reflexology, energy healing)
⏩ Mind-body approaches (meditation, breathwork, Joe Dispenza)
⏩ All of the above — and still looking

Vote below. And if none of these fit, tell me in the comments.

Olly`
  },
  {
    title: 'What Survival Mode Actually Feels Like',
    date: '2026-06-07', type: 'Personal Story',
    image: 'Quiet everyday moment — sitting at home, looking out a window, or a still morning scene. Conveys the ordinary texture of just getting through the day.',
    post: `Survival mode does not always look like a crisis.

Sometimes it looks like a Tuesday.

⏩ Getting through the day but not really living it
⏩ Resting but not recovering
⏩ Functioning on the outside while something feels very wrong on the inside
⏩ Cancelling things you used to look forward to
⏩ Feeling like a version of yourself you do not recognise

That was my experience for a long time.

I did not know then that what I was describing had a physiological explanation.

A nervous system stuck in fight or flight does not always look like panic.

Often it looks exactly like what I just described.

The good news is that this is changeable.

The nervous system can learn a new default. It just needs the right input — consistently, over time.

Something called Heart Coherence is that input.

${CTA}

Olly`
  },

  // ── Week 2 ────────────────────────────────────────────────────────────────
  {
    title: 'I Gave Up Everything to Get Better',
    date: '2026-06-08', type: 'Personal Story',
    image: 'Personal photo from a difficult period — raw and honest. Or a before/after style pairing if available.',
    post: `At one point I had lost almost everything chronic illness can take from you.

My business.

My social circle.

My ability to plan anything further than a day ahead.

I am not sharing that for sympathy.

I am sharing it because if you are in that place right now, I want you to know that I have been there too.

And I want you to know what actually changed things.

It was not willpower. I had tried that.

It was not positive thinking. I had tried that too.

What changed was understanding that my body was stuck in a survival response — and that no amount of trying harder was going to override a nervous system running on high alert.

Once I stopped fighting the symptoms and started working with the nervous system directly, things began to shift.

Slowly at first. Then more noticeably.

That is the work I now do with others.

${CTA}

Olly`
  },
  {
    title: 'What Do You Wish People Understood?',
    date: '2026-06-09', type: 'Engagement',
    image: 'Selfie — warm and open. Feels like a genuine invitation to share.',
    post: `If you could make one person in your life truly understand what it is like to live with chronic illness — what would you want them to know?

Comment below.

I ask because the answers to this question always remind me why this work matters.

Olly`
  },
  {
    title: 'The Turning Point',
    date: '2026-06-10', type: 'Personal Story',
    image: 'Aspirational photo — outdoors, in nature, or doing something active. Represents the shift from survival to living.',
    post: `There was a moment where I stopped trying to fight my way back to health.

Not because I gave up.

Because I finally understood that fighting was making it worse.

When the body is stuck in survival mode, effort and resistance are more of the same signal.

More fight or flight on top of existing fight or flight.

What the body actually needed was something different.

Safety.

Not the concept of safety. Not positive thinking about safety.

A physiological experience of it — one the nervous system could actually register.

Something called Heart Coherence gave me that.

It is a specific practice. It is learnable. And it is the thing that changed my baseline in a way that nothing else had.

If you are at the point of wondering whether anything will ever actually work for you — I understand that.

And I want you to know that this is different.

${CTA}

Olly`
  },
  {
    title: 'Chronic Illness Took My Spark',
    date: '2026-06-11', type: 'Personal Story',
    image: 'Photo showing genuine joy or laughter — a concert, a social moment, something that represents being fully alive.',
    post: `One of the things chronic illness took from me that I did not expect was my spark.

Not just my energy.

My actual enthusiasm for life.

The ability to feel genuinely excited about something. To laugh from the stomach. To be present with the people I loved without part of me being somewhere else.

I did not realise how much I had lost until I started to get it back.

That is what nervous system regulation gave me — not just symptom relief, but the return of something I thought might be gone for good.

⏩ The ability to be in a room and actually enjoy it
⏩ Waking up without the first thought being about how I felt
⏩ Feeling something other than tired, flat or on edge

If that resonates — I want you to know it is possible.

The spark is still in there.

The nervous system just needs to feel safe enough to let it out.

${CTA}

Olly`
  },
  {
    title: 'What Is Heart Coherence?',
    date: '2026-06-12', type: 'Personal Mission',
    image: 'HeartMath certification or a clean, calm selfie. Could also use a simple graphic of the heart-brain connection if available.',
    post: `I talk about something called Heart Coherence a lot.

And I want to explain what it actually is — because it is not what most people assume.

It is not meditation.

It is not breathwork.

It is not positive thinking or visualisation.

Heart Coherence is a specific physiological state — a measurable rhythm between the heart and the brain that signals safety to the nervous system.

When you practise it consistently, the body stops defaulting to fight or flight. It starts to learn a new normal.

One where healing is actually possible.

I became a certified HeartMath Practitioner because I experienced this firsthand — and because I wanted to be able to teach it properly to others who were where I had been.

If you have been stuck in chronic symptoms and nothing has lasted — this is the thing I wish someone had shown me earlier.

${CTA}

Olly`
  },
  {
    title: 'The Day I Realised I Was Just Enduring Life',
    date: '2026-06-13', type: 'Personal Story',
    image: 'Beautiful scenery or an aspirational outdoor photo. The contrast between the beauty of life and the numbness of survival mode.',
    post: `There was a day I realised I had stopped enjoying my life and started just enduring it.

I could not tell you exactly when the shift happened.

But I remember looking around at things that used to bring me joy and feeling nothing.

Not sadness. Just nothing.

That numbness was one of the hardest parts of the whole experience.

Because it was invisible. Nobody around me could see it. And I did not know how to explain it.

What I understand now is that when the nervous system is stuck in survival mode for long enough, it starts to shut down non-essential functions.

Joy. Curiosity. Connection. Creativity.

None of these are a priority when the body thinks it is in danger.

Getting out of survival mode was not just about the physical symptoms.

It was about getting my life back in every sense of that phrase.

${CTA}

Olly`
  },
  {
    title: 'How Long Have You Been Stuck?',
    date: '2026-06-14', type: 'Engagement',
    image: 'Thoughtful selfie — reflective, not sad. Olly looking directly at camera as if genuinely asking.',
    post: `How long have you been living in survival mode?

Not since the diagnosis. Since you first felt like something was wrong.

For me it was years before I understood what was actually happening.

Comment below — I am genuinely curious.

And if you are not sure, that is worth sitting with too.

Olly`
  },
];

async function notion(method, path, body) {
  const res = await fetch(`https://api.notion.com/v1${path}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });
  const json = await res.json();
  if (!res.ok) {
    console.error('Notion API error:', JSON.stringify(json, null, 2));
    throw new Error(`Notion ${method} ${path} failed: ${res.status}`);
  }
  return json;
}

async function run() {
  // ── 1. Create tracking sub-page ────────────────────────────────────────────
  console.log('📄 Creating YouTube Community Posts tracking page...');
  const trackingPage = await notion('POST', '/pages', {
    parent: { type: 'page_id', page_id: DAILY_OPS_PAGE_ID },
    icon: { type: 'emoji', emoji: '💬' },
    properties: {
      title: { title: [{ type: 'text', text: { content: 'YouTube Community Posts' } }] },
    },
    children: [
      {
        object: 'block', type: 'heading_1',
        heading_1: { rich_text: [{ type: 'text', text: { content: 'YouTube Community Posts' } }] },
      },
    ],
  });
  console.log('✅ Tracking page created.');

  // ── 2. Create the database ─────────────────────────────────────────────────
  console.log('🗄️  Creating database...');
  const db = await notion('POST', '/databases', {
    parent: { type: 'page_id', page_id: trackingPage.id },
    icon: { type: 'emoji', emoji: '💬' },
    title: [{ type: 'text', text: { content: 'YouTube Community Posts' } }],
    is_inline: false,
    properties: {
      Title: { title: {} },
      Date: { type: 'date', date: {} },
      'Type of Post': {
        type: 'select', select: {
          options: [
            { name: 'Personal Story',  color: 'blue'   },
            { name: 'Personal Update', color: 'orange' },
            { name: 'Engagement',      color: 'yellow' },
            { name: 'Personal Mission',color: 'purple' },
            { name: 'Case Study',      color: 'green'  },
          ],
        },
      },
      Post: { type: 'rich_text', rich_text: {} },
      'Image Idea': { type: 'rich_text', rich_text: {} },
      Status: {
        type: 'select', select: {
          options: [
            { name: 'Idea',      color: 'gray'   },
            { name: 'Written',   color: 'yellow' },
            { name: 'Scheduled', color: 'blue'   },
            { name: 'Published', color: 'green'  },
          ],
        },
      },
      Rating: {
        type: 'select', select: {
          options: [
            { name: 'Good',       color: 'green' },
            { name: "Don't Like", color: 'red'   },
          ],
        },
      },
    },
  });
  console.log(`✅ Database created. ID: ${db.id}`);

  // ── 3. Add yellow callout block to Daily Operations ────────────────────────
  console.log('📌 Adding yellow callout block...');
  await notion('PATCH', `/blocks/${DAILY_OPS_PAGE_ID}/children`, {
    children: [{
      object: 'block', type: 'callout',
      callout: {
        icon: { type: 'emoji', emoji: '💬' },
        color: 'yellow_background',
        rich_text: [{
          type: 'text',
          text: {
            content: 'YouTube Community Posts',
            link: { url: `https://www.notion.so/${db.id.replace(/-/g, '')}` },
          },
          annotations: { bold: true },
        }],
      },
    }],
  });
  console.log('✅ Callout block added.');

  // ── 4. Populate 14 posts ───────────────────────────────────────────────────
  console.log('\n📝 Adding 14 posts to the backlog...');
  let added = 0;
  for (const p of posts) {
    const res = await fetch('https://api.notion.com/v1/pages', {
      method: 'POST',
      headers,
      body: JSON.stringify({
        parent: { database_id: db.id },
        properties: {
          Title:          { title: [{ type: 'text', text: { content: p.title } }] },
          Date:           { date: { start: p.date } },
          'Type of Post': { select: { name: p.type } },
          Post:           { rich_text: [{ type: 'text', text: { content: p.post } }] },
          'Image Idea':   { rich_text: [{ type: 'text', text: { content: p.image || '' } }] },
          Status:         { select: { name: 'Idea' } },
        },
      }),
    });
    const json = await res.json();
    if (!res.ok) console.error('Failed:', p.title, JSON.stringify(json));
    else { console.log(`✅ ${p.date} — ${p.title}`); added++; }
  }

  console.log(`\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
  console.log(`✅ YouTube Community Posts setup complete.`);
  console.log(`💬 Tracking page: ${trackingPage.url}`);
  console.log(`🗄️  Database ID:   ${db.id}`);
  console.log(`📝 Posts added:   ${added}/14`);
  console.log(`\n📌 Save for future scripts:`);
  console.log(`   DAILY_OPS_YT_COMMUNITY_DB_ID=${db.id}`);
  console.log(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
}

run().catch(err => {
  console.error('❌ Setup failed:', err.message);
  process.exit(1);
});
