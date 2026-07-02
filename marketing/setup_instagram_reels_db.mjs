/**
 * setup_instagram_reels_db.mjs
 * Creates the Instagram Reels tracking page and database inside Daily Operations,
 * adds an orange callout block to the main page, and populates 30 reels in the backlog.
 *
 * Run: node "C:\Users\Olly\AI OS\marketing\setup_instagram_reels_db.mjs"
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
const CTA_CAPTION = '➡️ Comment HEART below and I will send you access to my free community where I teach Heart Coherence — a simple daily practice to calm your nervous system and get your life back from chronic symptoms.\n\n👉 Or grab it directly here: https://www.skool.com/the-healing-code-8609';

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

// ── Reel content ──────────────────────────────────────────────────────────────

const reels = [
  // ── WEEK 1: Mon 1 June ────────────────────────────────────────────────────
  {
    title: 'Your Symptoms Are Not Random',
    date: '2026-06-01', type: 'Argument-Based',
    hook: 'Your symptoms are not random. They are not bad luck. And they are not just in your head.',
    script: `Your symptoms are not random. They are not bad luck. And they are not just in your head.

There is a specific reason your body feels the way it does — and it has a name.

When the nervous system gets stuck in fight or flight as a permanent default, it produces every single one of those symptoms. Pain. Exhaustion. Brain fog. Anxiety. All of it.

The body is not broken. It is stuck in a loop.

And something called Heart Coherence is the tool that breaks it.

Comment HEART below and I will show you how.`,
    caption: `Your symptoms are not random. They are not bad luck. And they are not just in your head.

There is a reason your body feels the way it does — and once you understand it, healing stops feeling impossible.

${CTA_CAPTION}`
  },
  {
    title: 'Why Rest Is Not Fixing Your Exhaustion',
    date: '2026-06-01', type: 'Educational',
    hook: 'If you are resting and you are still exhausted — this is why.',
    script: `If you are resting and you are still exhausted — this is why.

When the nervous system is stuck in survival mode, it is running a full-body alarm in the background. Twenty-four hours a day.

Rest does not switch off the alarm. It just pauses what you are doing.

So you rest. You sleep. You wake up — and the exhaustion is still there.

This is not a sleep problem. This is a nervous system problem.

Something called Heart Coherence is what switches the alarm off.

Comment HEART and I will send you more.`,
    caption: `Resting and still exhausted?

That is not a sleep problem. That is a nervous system stuck in survival mode — running a full-body alarm even while you rest.

${CTA_CAPTION}`
  },
  {
    title: 'The Loop Nobody Tells You About',
    date: '2026-06-01', type: 'Argument-Based',
    hook: 'Chronic symptoms create stress. Stress makes chronic symptoms worse. Nobody tells you about this loop.',
    script: `Chronic symptoms create stress. Stress makes chronic symptoms worse. Nobody tells you about this loop.

And once you are in it — it is very hard to get out. Because the loop has its own momentum.

You treat the symptoms. They improve slightly. Then they come back.

Because the loop is still running.

Something called Heart Coherence works on the loop itself — not just the symptoms it produces.

Comment HEART below and I will show you what that looks like.`,
    caption: `Chronic symptoms → stress → more symptoms → more stress.

This loop is why nothing you have tried has lasted.

${CTA_CAPTION}`
  },

  // ── WEEK 1: Tue 2 June ────────────────────────────────────────────────────
  {
    title: 'I Just Want to Enjoy Life Again',
    date: '2026-06-02', type: 'Argument-Based',
    hook: 'I just want to enjoy life again — not endure it.',
    script: `"I just want to enjoy life again — not endure it."

That is what a client said to me. And I have not been able to stop thinking about it.

Because that is exactly what chronic illness does. It does not just take your health. It takes your life.

The parties you leave early. The holidays you cannot take. The version of yourself you used to be.

That person is still in there. The body just needs to feel safe enough to let her back out.

Something called Heart Coherence is how you get there.

Comment HEART below.`,
    caption: `"I just want to enjoy life again — not endure it."

If that lands for you — this is for you.

${CTA_CAPTION}`
  },
  {
    title: 'What Fight or Flight Actually Does to Your Body',
    date: '2026-06-02', type: 'Educational',
    hook: 'Most people have heard of fight or flight. Very few understand what it actually does to the body long term.',
    script: `Most people have heard of fight or flight. Very few understand what it actually does to the body long term.

When fight or flight runs as your permanent default — not just in a moment of stress, but all the time — it creates real physical symptoms.

Pain sensitivity goes up. Energy goes down. Sleep becomes unrefreshing. Brain fog sets in. Emotions become harder to regulate.

None of this shows up on a blood test. But all of it is real.

This is a nervous system problem. And something called Heart Coherence is how you solve it.

Comment HEART below.`,
    caption: `Fight or flight was designed to save your life in a moment of danger.

The problem is when your body forgets to switch it off.

${CTA_CAPTION}`
  },
  {
    title: 'Why I Do This Work',
    date: '2026-06-02', type: 'Mission-Based',
    hook: 'I spent years not feeling like myself. This is why I do what I do.',
    script: `I spent years not feeling like myself.

Exhausted. Reactive. Stuck in survival mode. And nobody could tell me why.

I tried the medical routes. I tried the alternative routes. I read the books and did the practices.

Nothing lasted.

Until I found something called Heart Coherence. And everything changed.

I built Regulate for Relief because I know exactly what it feels like to be stuck in that loop — and I know what it takes to break it.

Comment HEART if you want to find out more.`,
    caption: `I spent years not feeling like myself. Tests came back normal. Nobody had answers.

This is why I do this work.

${CTA_CAPTION}`
  },

  // ── WEEK 1: Wed 3 June ────────────────────────────────────────────────────
  {
    title: 'Tests Normal But You Still Feel Terrible',
    date: '2026-06-03', type: 'Argument-Based',
    hook: 'Your tests come back normal. Your doctor says you are fine. But you do not feel fine.',
    script: `Your tests come back normal. Your doctor says you are fine.

But you do not feel fine.

You feel exhausted. Foggy. In pain. Anxious. Like a shadow of yourself.

Here is the thing — the medical system tests for structural problems. Not functional ones.

A nervous system stuck in fight or flight does not show up on a scan. But it creates every single one of those symptoms.

Something called Heart Coherence is what reaches it.

Comment HEART below and I will show you how.`,
    caption: `"Everything looks normal."

But you still feel terrible every single day.

This is not in your head. And it does show up — just not on the tests they are running.

${CTA_CAPTION}`
  },
  {
    title: 'She Could Not Make It Work for Her',
    date: '2026-06-03', type: 'Client Success',
    hook: '"I know healing is possible. I just cannot make it work for me." Sound familiar?',
    script: `"I know healing is possible. I just cannot make it work for me."

I hear this more than anything else.

Someone who has read the books. Done the meditations. Tried everything.

And still stuck.

This was one of my clients. She understood the mind-body connection completely. She just could not get her body to feel it.

The missing piece was something called Heart Coherence. A specific tool that works at the level the body actually understands.

She is not stuck anymore.

Comment HEART if you want to know more.`,
    caption: `"I know healing is possible. I just cannot make it work for me."

This is the most common thing I hear. And it is not a failure of willpower or belief.

It is a missing piece.

${CTA_CAPTION}`
  },
  {
    title: 'The Doctors Put So Much Fear in Me',
    date: '2026-06-03', type: 'Argument-Based',
    hook: '"The doctors put so much fear in me." This is something I hear again and again — and it matters more than most people realise.',
    script: `"The doctors put so much fear in me."

This is something I hear again and again from people with chronic symptoms.

And here is why it matters so much.

Fear is one of the most powerful activators of fight or flight. And when doctors spend years telling you worst-case scenarios — your nervous system takes that in. It stores it. It runs it as a background programme.

Even when the medical situation resolves. The fear does not always go with it.

Something called Heart Coherence is what helps the body finally get the message: you are safe now.

Comment HEART below.`,
    caption: `The doctors put so much fear in me.

And fear is one of the most powerful activators of fight or flight.

The symptoms may have a medical explanation. But the nervous system still needs to be told it is safe.

${CTA_CAPTION}`
  },

  // ── WEEK 1: Thu 4 June ────────────────────────────────────────────────────
  {
    title: 'Why Knowing Is Not Enough',
    date: '2026-06-04', type: 'Argument-Based',
    hook: 'You can understand exactly why you feel the way you do — and still feel that way. Here is why.',
    script: `You can understand exactly why you feel the way you do — and still feel that way.

I know that sounds frustrating. Because it is.

Knowledge lives in the mind. The fight or flight loop lives in the body.

And the body does not respond to information. It responds to experience.

That is why reading the books and understanding the mind-body connection is not enough on its own.

Something called Heart Coherence creates the physiological experience of safety that the body needs to change.

Comment HEART below.`,
    caption: `You can understand the nervous system completely and still be stuck in it.

Knowledge is not the same as safety. And the body needs to feel safe — not just understand why it isn't.

${CTA_CAPTION}`
  },
  {
    title: 'What Is Heart Coherence',
    date: '2026-06-04', type: 'Educational',
    hook: 'Most people have never heard of Heart Coherence. Here is what it is in 30 seconds.',
    script: `Most people have never heard of Heart Coherence. Here is what it is.

It is a specific rhythmic state between the heart and the brain that signals safety to the nervous system.

Not relaxation. Not positive thinking. A measurable physiological shift.

When you practise it consistently, the body stops defaulting to fight or flight — and starts defaulting to a state where healing is actually possible.

It is not meditation. It is not breathwork. It is something specific.

Comment HEART and I will send you access to the practice.`,
    caption: `Heart Coherence is not meditation. It is not breathwork. It is not positive thinking.

It is a specific signal to your nervous system that tells it: you are safe now.

${CTA_CAPTION}`
  },
  {
    title: 'What Do You Believe Is Stopping You From Healing?',
    date: '2026-06-04', type: 'Engagement-Based',
    hook: 'I want to ask you something honestly. What do you believe is stopping you from healing?',
    script: `I want to ask you something honestly.

What do you believe is stopping you from healing?

Is it that you have tried everything and nothing has worked?
Is it that you do not have the energy to try something new?
Is it that you are not sure if it will work for you?

Comment below. I read every single reply.

Because the answer you give often points directly to what the nervous system is protecting.

And that is exactly where we start.`,
    caption: `What do you believe is stopping you from healing right now?

I genuinely want to know. Comment below — I read every reply.

${CTA_CAPTION}`
  },

  // ── WEEK 1: Fri 5 June ────────────────────────────────────────────────────
  {
    title: 'This Is Robbing Me of My Life',
    date: '2026-06-05', type: 'Argument-Based',
    hook: '"This is robbing me of my life on a day to day basis." If you have ever felt this — keep watching.',
    script: `"This is robbing me of my life on a day to day basis."

A client said that to me. And I think about it every time I sit down to create content.

Because chronic illness does not just affect your health. It affects everything.

Your relationships. Your work. Your ability to show up for the people you love.

And you deserve better than being told your tests are normal and sent home.

The nervous system is the missing piece. And something called Heart Coherence is how you reach it.

Comment HEART below.`,
    caption: `"This is robbing me of my life on a day to day basis."

Chronic illness takes more than your health. It takes your life.

You deserve a real explanation and a real solution.

${CTA_CAPTION}`
  },
  {
    title: 'Three Signs Your Nervous System Is Stuck',
    date: '2026-06-05', type: 'Educational',
    hook: 'Three signs your nervous system is stuck in fight or flight — and you might not even realise it.',
    script: `Three signs your nervous system is stuck in fight or flight — and you might not realise it.

One. You are exhausted but you cannot fully relax. Even rest does not refresh you.

Two. You feel emotionally reactive — small things set you off more than they should.

Three. Your symptoms are unpredictable. Good days and bad days with no obvious pattern.

These are not character flaws. They are nervous system signals.

And something called Heart Coherence is how you start to change them.

Comment HEART below.`,
    caption: `Three signs your nervous system is stuck in fight or flight:

1. Exhausted but cannot fully relax
2. Emotionally reactive to small things
3. Symptoms with no predictable pattern

These are signals — not flaws.

${CTA_CAPTION}`
  },
  {
    title: 'The Version of You That Is Still in There',
    date: '2026-06-05', type: 'Personal',
    hook: 'The old happy version of you is still in there. Chronic illness did not erase her. It just buried her.',
    script: `The old happy version of you is still in there.

Chronic illness did not erase her. It just buried her under a nervous system that has been running on high alert for too long.

I know because I have seen people find their way back.

Not through willpower. Not through trying harder. But through giving the nervous system what it has been missing — a consistent, daily signal that it is safe.

Something called Heart Coherence is that signal.

Comment HEART below. I would love to show you what that looks like.`,
    caption: `The old version of you — the one who felt good, who had energy, who enjoyed life — is still in there.

She is not gone. She is just waiting for the nervous system to feel safe enough to come back.

${CTA_CAPTION}`
  },

  // ── WEEK 2: Mon 8 June ────────────────────────────────────────────────────
  {
    title: 'Why Alternative Medicine Is Not Enough',
    date: '2026-06-08', type: 'Argument-Based',
    hook: 'Acupuncture. Reflexology. Energy healing. You have tried them. They help — and then the symptoms come back. Here is why.',
    script: `Acupuncture. Reflexology. Energy healing.

You have tried them. They help for a little while. And then the symptoms come back.

This is not because those things do not work. It is because they are treating the symptoms — not the state of the nervous system generating them.

The loop keeps running. So the symptoms keep returning.

Something called Heart Coherence works on the loop itself.

Comment HEART below and I will tell you more.`,
    caption: `Alternative medicine can reduce your symptoms. But if the nervous system loop is still running — they always come back.

The problem is not the treatments. It is where they are aimed.

${CTA_CAPTION}`
  },
  {
    title: 'Post-Exertion Malaise — What Is Actually Happening',
    date: '2026-06-08', type: 'Educational',
    hook: 'If doing something — anything — wipes you out for hours or days afterwards, there is a specific reason for that.',
    script: `If doing something — anything — wipes you out for hours or days afterwards, there is a specific reason for that.

It is called post-exertion malaise. And it is one of the clearest signs that the nervous system is running in survival mode.

When fight or flight is your default state, the body has no spare energy. None. Every small demand uses resources the body does not have.

So even a short walk. A phone call. A good day. Can crash you.

This is a nervous system problem. Not a fitness problem. Not a willpower problem.

Something called Heart Coherence is what changes the default state.

Comment HEART below.`,
    caption: `If activity — even small activity — wipes you out for hours or days, this has a name.

Post-exertion malaise. And it is a nervous system signal, not a fitness problem.

${CTA_CAPTION}`
  },
  {
    title: 'Constantly Being Knocked Back',
    date: '2026-06-08', type: 'Argument-Based',
    hook: 'Constantly being knocked back and stuck in the same situation. If that is your experience — this is for you.',
    script: `Constantly being knocked back and stuck in the same situation.

That was how one of my prospects described her life with chronic illness.

And it captures something so important — because it is not just the physical symptoms. It is the exhaustion of trying. And trying again. And still being in the same place.

That exhaustion of repetition is real. And it makes sense. Because without addressing the nervous system loop, you are fighting the tide.

Something called Heart Coherence changes the default. So you stop being knocked back.

Comment HEART below.`,
    caption: `"Constantly being knocked back and stuck in the same situation."

The exhaustion of trying and not making progress is its own kind of suffering.

${CTA_CAPTION}`
  },

  // ── WEEK 2: Tue 9 June ────────────────────────────────────────────────────
  {
    title: 'Dysautonomia and the Nervous System',
    date: '2026-06-09', type: 'Educational',
    hook: 'If you have been diagnosed with dysautonomia — or suspect you might have it — this is worth understanding.',
    script: `If you have been diagnosed with dysautonomia — or suspect you might have it — this is worth understanding.

Dysautonomia is a dysfunction of the autonomic nervous system. The part that controls heart rate, blood pressure, digestion, temperature regulation.

And it sits directly within the fight or flight loop.

When the nervous system is stuck in survival mode, these systems become dysregulated. Which is why dysautonomia often comes with fatigue, brain fog, palpitations and a whole range of unexplained symptoms.

Something called Heart Coherence works directly on the autonomic nervous system.

Comment HEART below.`,
    caption: `Dysautonomia is a dysfunction of the autonomic nervous system — the part of you that runs on autopilot.

And it sits directly within the fight or flight loop.

${CTA_CAPTION}`
  },
  {
    title: 'What Healing Actually Looks Like',
    date: '2026-06-09', type: 'Mission-Based',
    hook: 'Healing does not look like going from 0 to 100 overnight. Here is what it actually looks like.',
    script: `Healing does not look like going from 0 to 100 overnight.

It looks like a Tuesday where you notice you did not feel anxious in the morning.

It looks like a walk you did not have to recover from.

It looks like being at a dinner table and being present — instead of managing symptoms and waiting to leave.

These small moments are the nervous system finding its way back.

And something called Heart Coherence is what creates the conditions for them to happen.

Comment HEART below.`,
    caption: `Healing does not look like a dramatic overnight transformation.

It looks like a Tuesday where something small is easier than it was last week.

${CTA_CAPTION}`
  },
  {
    title: "She Wanted to Be Well for Her Son's Wedding",
    date: '2026-06-09', type: 'Client Success',
    hook: `She had to leave her cousin's birthday party after two hours. Her son's wedding was three months away. This is her story.`,
    script: `She had to leave her cousin's birthday party after two hours. She was in too much pain to stay.

Her son's wedding was three months away.

She was doing everything right. Acupuncture. Reflexology. Rest. Speaking to her body every day.

And she was still stuck in the loop.

When she started working with Heart Coherence — something changed. Slowly. Then noticeably.

She made it to the wedding. She was present. She was well.

Comment HEART below if you want to know how.`,
    caption: `She was doing everything right. And she was still stuck.

Her son's wedding was three months away. She wanted to be well for it.

This is what Heart Coherence made possible.

${CTA_CAPTION}`
  },

  // ── WEEK 2: Wed 10 June ───────────────────────────────────────────────────
  {
    title: 'Brain Fog Is Not in Your Head',
    date: '2026-06-10', type: 'Argument-Based',
    hook: 'Brain fog is not in your head. It is in your nervous system.',
    script: `Brain fog is not in your head. It is in your nervous system.

When the body is stuck in fight or flight, the frontal lobe — the part of the brain responsible for clear thinking, decision-making and focus — gets shut down.

Because in survival mode, those things are not a priority.

So you feel scattered. Forgetful. Unable to concentrate. Like your brain just will not work.

This is not a mental health problem. It is a nervous system problem.

And something called Heart Coherence is what switches the frontal lobe back on.

Comment HEART below.`,
    caption: `Brain fog is not in your head. It is in your nervous system.

Fight or flight shuts down the frontal lobe — the part of you that thinks clearly.

${CTA_CAPTION}`
  },
  {
    title: 'Why Healing Feels Impossible Sometimes',
    date: '2026-06-10', type: 'Argument-Based',
    hook: 'If healing feels impossible right now — I want to tell you something.',
    script: `If healing feels impossible right now — I want to tell you something.

That feeling is not evidence that you cannot heal.

It is evidence of how long your nervous system has been in survival mode.

When fight or flight runs for long enough, the brain starts to believe that danger is permanent. And hope starts to feel dangerous.

So the feeling that healing is impossible? That is the loop protecting itself.

Something called Heart Coherence is what breaks it — not by convincing the mind, but by changing what the body experiences.

Comment HEART below.`,
    caption: `If healing feels impossible right now — that feeling is not evidence that you cannot heal.

It is evidence of how long the nervous system has been in survival mode.

${CTA_CAPTION}`
  },
  {
    title: 'The Frontal Lobe Shutdown Explained Simply',
    date: '2026-06-10', type: 'Educational',
    hook: 'There is a specific part of your brain that shuts down when you are in fight or flight. And it explains a lot.',
    script: `There is a specific part of your brain that shuts down when you are in fight or flight.

It is called the frontal lobe. And it is responsible for clear thinking, decision-making, emotional regulation and sustained focus.

In survival mode — the brain prioritises keeping you alive over helping you function well.

So the frontal lobe goes offline.

Which explains the brain fog. The emotional reactivity. The inability to concentrate or make decisions.

Something called Heart Coherence brings it back online.

Comment HEART below.`,
    caption: `Your brain fog and emotional reactivity have a specific cause.

Fight or flight shuts down the frontal lobe. The part of you that thinks clearly and stays calm.

${CTA_CAPTION}`
  },

  // ── WEEK 2: Thu 11 June ───────────────────────────────────────────────────
  {
    title: 'Unrefreshing Sleep Explained',
    date: '2026-06-11', type: 'Educational',
    hook: 'You sleep eight hours and wake up exhausted. There is a reason for that — and it is not about sleep.',
    script: `You sleep eight hours and wake up exhausted.

You have tried sleep hygiene. Earlier bedtimes. Magnesium. Everything.

And you still wake up feeling like you have not slept.

Here is why.

When the nervous system is stuck in fight or flight, the body stays on alert even during sleep. It cannot fully enter the deep, restorative stages it needs.

So you sleep — but you do not recover.

This is not a sleep problem. This is a nervous system problem.

Something called Heart Coherence is what changes it.

Comment HEART below.`,
    caption: `Eight hours of sleep and still exhausted.

This is not a sleep problem. It is a nervous system stuck in survival mode — staying alert even while you rest.

${CTA_CAPTION}`
  },
  {
    title: 'I Do Not Know How to Get My Life Back',
    date: '2026-06-11', type: 'Argument-Based',
    hook: `"I don't know how to get my life back again." This is one of the most common things I hear. And it deserves a real answer.`,
    script: `"I don't know how to get my life back again."

This is one of the most common things I hear from people with chronic illness.

Not "I want to feel better." But "I don't know how."

And that distinction matters. Because it is not a lack of desire. It is a lack of a clear path.

The path is this: the nervous system needs to feel safe. Not the mind. The body.

And something called Heart Coherence is the most direct route there.

Comment HEART below and I will show you where to start.`,
    caption: `"I don't know how to get my life back again."

Not a lack of desire. A lack of a clear path.

Here is where the path starts.

${CTA_CAPTION}`
  },
  {
    title: 'What Would You Do If You Felt Like Yourself Again?',
    date: '2026-06-11', type: 'Engagement-Based',
    hook: 'If you woke up tomorrow feeling like yourself again — what is the first thing you would do?',
    script: `If you woke up tomorrow feeling like yourself again — what is the first thing you would do?

Not "what would you do with your health." What would you actually do?

Would you go for a walk without planning the recovery?
Would you call a friend without managing your energy first?
Would you just make a coffee and enjoy it?

Comment below. I genuinely want to know.

Because the answer is your Promised Land. And it is worth keeping it in sight.`,
    caption: `If you woke up tomorrow feeling like yourself again — what is the first thing you would do?

Comment below. I want to know.

${CTA_CAPTION}`
  },

  // ── WEEK 2: Fri 12 June ───────────────────────────────────────────────────
  {
    title: 'Fibromyalgia and the Fight or Flight Loop',
    date: '2026-06-12', type: 'Argument-Based',
    hook: 'If you have fibromyalgia — or think you might — this is the explanation most doctors will not give you.',
    script: `If you have fibromyalgia — or think you might — this is the explanation most doctors will not give you.

Fibromyalgia is characterised by widespread pain, fatigue, brain fog and sleep disturbances.

These are also the exact symptoms produced by a nervous system stuck in fight or flight.

When the body runs a chronic survival response, pain sensitivity goes up. Fatigue becomes constant. Sleep stops restoring you.

Fibromyalgia is not a mystery. It is a nervous system stuck in a loop.

Something called Heart Coherence breaks that loop.

Comment HEART below.`,
    caption: `Fibromyalgia: widespread pain, fatigue, brain fog, unrefreshing sleep.

These are also the exact symptoms of a nervous system stuck in fight or flight.

This is not a coincidence.

${CTA_CAPTION}`
  },
  {
    title: 'Three Things That Will Not Break the Loop',
    date: '2026-06-12', type: 'Argument-Based',
    hook: 'Three things that will not break the fight or flight loop — no matter how consistently you do them.',
    script: `Three things that will not break the fight or flight loop — no matter how consistently you do them.

One. Positive thinking. The mind cannot override a body that feels unsafe.

Two. Rest alone. The nervous system stays on alert even when you stop.

Three. Treating the symptoms. The loop restarts and produces them again.

None of these are bad. They just do not reach the root.

Something called Heart Coherence reaches the root.

Comment HEART below.`,
    caption: `Three things that will not break the fight or flight loop:

1. Positive thinking
2. Rest alone
3. Treating the symptoms

They help. But they do not reach the root.

${CTA_CAPTION}`
  },
  {
    title: 'Chaos to Calm — What That Actually Means',
    date: '2026-06-12', type: 'Personal',
    hook: 'Chaos to calm. That is my tagline. Here is what it actually means in practice.',
    script: `Chaos to calm. That is my tagline.

And I want to tell you what it actually means — because it is not just a phrase.

Chaos is what chronic illness creates inside the body. The nervous system running on overdrive. Symptoms that feel unpredictable. A life that has to be managed instead of lived.

Calm is not just feeling relaxed. It is the body returning to a state where it can think clearly, sleep properly, feel things without being overwhelmed — and heal.

Something called Heart Coherence is the path from one to the other.

Comment HEART below.`,
    caption: `Chaos to calm.

Chaos is a nervous system stuck in survival mode. Calm is the body finally feeling safe enough to heal.

${CTA_CAPTION}`
  },
];

async function run() {
  // ── 1. Create the tracking sub-page ────────────────────────────────────────
  console.log('📄 Creating Instagram Reels tracking page...');
  const trackingPage = await notion('POST', '/pages', {
    parent: { type: 'page_id', page_id: DAILY_OPS_PAGE_ID },
    icon: { type: 'emoji', emoji: '📸' },
    properties: {
      title: { title: [{ type: 'text', text: { content: 'Instagram Reels' } }] },
    },
    children: [
      {
        object: 'block', type: 'heading_1',
        heading_1: { rich_text: [{ type: 'text', text: { content: 'Instagram Reels' } }] },
      },
    ],
  });
  console.log(`✅ Tracking page created.`);

  // ── 2. Create the database ─────────────────────────────────────────────────
  console.log('🗄️  Creating Instagram Reels database...');
  const db = await notion('POST', '/databases', {
    parent: { type: 'page_id', page_id: trackingPage.id },
    icon: { type: 'emoji', emoji: '📸' },
    title: [{ type: 'text', text: { content: 'Instagram Reels' } }],
    is_inline: false,
    properties: {
      Title:          { title: {} },
      Date:           { type: 'date', date: {} },
      'Type of Post': {
        type: 'select', select: {
          options: [
            { name: 'Argument-Based',  color: 'red'    },
            { name: 'Educational',     color: 'blue'   },
            { name: 'Mission-Based',   color: 'purple' },
            { name: 'Client Success',  color: 'green'  },
            { name: 'Engagement-Based',color: 'yellow' },
            { name: 'Personal',        color: 'orange' },
          ],
        },
      },
      Hook:    { type: 'rich_text', rich_text: {} },
      Script:  { type: 'rich_text', rich_text: {} },
      Caption: { type: 'rich_text', rich_text: {} },
      Status: {
        type: 'select', select: {
          options: [
            { name: 'Idea',      color: 'gray'   },
            { name: 'Scripted',  color: 'yellow' },
            { name: 'Filmed',    color: 'blue'   },
            { name: 'Edited',    color: 'purple' },
            { name: 'Scheduled', color: 'orange' },
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

  // ── 3. Add orange callout block to Daily Operations page ───────────────────
  console.log('📌 Adding orange callout block to Daily Operations...');
  await notion('PATCH', `/blocks/${DAILY_OPS_PAGE_ID}/children`, {
    children: [{
      object: 'block', type: 'callout',
      callout: {
        icon: { type: 'emoji', emoji: '📸' },
        color: 'orange_background',
        rich_text: [{
          type: 'text',
          text: {
            content: 'Instagram Reels',
            link: { url: `https://www.notion.so/${db.id.replace(/-/g, '')}` },
          },
          annotations: { bold: true },
        }],
      },
    }],
  });
  console.log('✅ Callout block added.');

  // ── 4. Populate 30 reels ───────────────────────────────────────────────────
  console.log('\n📝 Adding 30 reels to the backlog...');
  let added = 0;
  for (const reel of reels) {
    const res = await fetch('https://api.notion.com/v1/pages', {
      method: 'POST',
      headers,
      body: JSON.stringify({
        parent: { database_id: db.id },
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

  console.log(`\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
  console.log(`✅ Instagram Reels setup complete.`);
  console.log(`📸 Tracking page: ${trackingPage.url}`);
  console.log(`🗄️  Database ID:   ${db.id}`);
  console.log(`📝 Reels added:   ${added}/30`);
  console.log(`\n📌 Save for future scripts:`);
  console.log(`   DAILY_OPS_INSTAGRAM_DB_ID=${db.id}`);
  console.log(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
}

run().catch(err => {
  console.error('❌ Setup failed:', err.message);
  process.exit(1);
});
