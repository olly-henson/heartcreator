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

const DB_ID = '36e30e58-6a0d-81d4-98d3-e68d37478fc1';

const updates = {
  'Why Doctors Cannot Help Your Chronic Symptoms (And What Actually Can)': {
    hook: 'Your tests come back normal. Your doctor says you are fine. But you still wake up every day exhausted, in pain and not like yourself. Here is what is actually going on.',
    framework: `0:00-0:15 | HOOK
Your tests come back normal. Your doctor says you are fine. But you still wake up every day exhausted, in pain and not like yourself.

0:15-1:00 | VALIDATE
Name specific symptoms: fibromyalgia, chronic fatigue, dysautonomia, brain fog, unrefreshing sleep, unexplained pain, anxiety. "You have probably been told your results are normal more times than you can count."

1:00-1:45 | REASSURE
There is nothing insidious going on. The medical system is simply not looking in the right place. This is not a failure of your body — it is a gap in what conventional medicine tests for.

1:45-3:30 | NAME THE CAUSE
The nervous system stuck in fight or flight. The loop doctors do not test for. When the body is running on high alert in the background, it creates and amplifies every one of those symptoms.

3:30-6:00 | DEEPEN THE LOOP
Both medical AND alternative routes are failing — not because they are bad, but because external treatments cannot fix an internal loop. Symptoms create stress, stress creates more symptoms.

6:00-7:30 | PERSONAL CREDIBILITY
"I have been where you are. Failed by the same system. Spent years not understanding why nothing was lasting."

7:30-9:00 | TEASE THE SOLUTION
Something called Heart Coherence. Not meditation for hours. A specific tool that works directly on the nervous system loop — and the one thing most people have never tried properly.

9:00-10:00 | CTA
Comment HEART below. Link in description. Next video tease: The specific loop that is keeping your symptoms going.`
  },
  'What the Frontal Lobe Shutdown Is Doing to Your Energy and Focus': {
    hook: 'There is a specific reason your brain fog and exhaustion keep coming back — even after a full night of sleep. And it has nothing to do with how much you are resting.',
    framework: `0:00-0:15 | HOOK
There is a specific reason your brain fog and exhaustion keep coming back — even after a full night of sleep. And it has nothing to do with how much you are resting.

0:15-1:00 | VALIDATE
Name the experience precisely: declining energy over months or years, brain that will not switch on, exhaustion that rest does not fix. "Even when you are resting, you still feel terrible."

1:00-1:45 | REASSURE
There is nothing insidious going on. Your brain has not broken. There is a clear, logical explanation — and once you understand it, it stops being frightening.

1:45-3:30 | NAME THE CAUSE
Survival mode shuts down the frontal lobe. When the nervous system is stuck in fight or flight, the brain redirects resources away from strategic thinking, clear decisions, sustained attention and impulse control — and into survival functions.

3:30-6:00 | DEEPEN THE LOOP
This is not laziness. It is a physiological response. The frontal lobe shutdown creates brain fog and exhaustion, which create more stress, which deepens the shutdown. Add a client story or scenario here to hold retention.

6:00-7:30 | PERSONAL CREDIBILITY
"I struggled with this for years. Could not understand why my thinking was so clouded even on days when I had slept and rested well."

7:30-9:00 | TEASE THE SOLUTION
Something called Heart Coherence. It is not about thinking your way out — it works at the level of the nervous system, which is where the shutdown actually lives.

9:00-10:00 | CTA
Comment HEART below. Link in description. Next video tease: The loop that keeps the whole cycle going.`
  },
  'The Chicken and Egg Loop That Keeps Chronic Symptoms Going': {
    hook: 'The reason nothing you have tried has lasted is not because those things do not work. It is because you are stuck in a loop that none of them can break.',
    framework: `0:00-0:15 | HOOK
The reason nothing you have tried has lasted is not because those things do not work. It is because you are stuck in a loop that none of them can break.

0:15-1:00 | VALIDATE
Name the loop experience: constantly being knocked back, trying things that work briefly then stop, spending time and money with nothing sticking. "A chicken and egg relentless loop."

1:00-1:45 | REASSURE
This is not because healing is impossible for you. The loop itself needs to be addressed — not just the symptoms it produces. Nothing is wrong with you for not cracking it yet.

1:45-3:30 | NAME THE CAUSE
Body stuck in fight or flight as a permanent default. Symptoms create stress. Stress amplifies symptoms. The loop gets harder to break the longer it runs — triggered by illness, injury, stress, infection or trauma.

3:30-6:00 | DEEPEN THE LOOP
Why external treatments cannot break an internal loop. Acupuncture, reflexology, meditation — these reduce symptoms temporarily but do not change the nervous system's default state. Add Elizabeth's story here as the real-world example.

6:00-7:30 | PERSONAL CREDIBILITY
"I know this loop well. I lived in it for years."

7:30-9:00 | TEASE THE SOLUTION
Something called Heart Coherence does not treat the symptoms — it works on the loop itself. That is why it produces results that other approaches do not.

9:00-10:00 | CTA
Comment HEART below. Link in description. Next video tease: What Heart Coherence actually is.`
  },
  'I Just Want to Enjoy Life Again — Not Endure It': {
    hook: 'A client said something to me recently that I have not been able to stop thinking about. She said: I just want to enjoy life again — not endure it. If that lands for you, this video is for you.',
    framework: `0:00-0:15 | HOOK
A client said something to me recently that I have not been able to stop thinking about. She said: "I just want to enjoy life again — not endure it." If that lands for you, this video is for you.

0:15-1:00 | VALIDATE
The specific texture of enduring rather than living: planning your day around managing symptoms, leaving events early, watching your life shrink. This is what chronic illness actually takes from people — not just health but life itself.

1:00-1:45 | REASSURE
The old version of you is not gone. She is still in there. The body wants to return to its natural state — it just needs the right conditions to do so.

1:45-3:30 | NAME THE CAUSE
The fight or flight loop is what is robbing you of your life — not your diagnosis, not your age, not bad luck. When the nervous system is stuck in survival mode, the brain and body cannot access the version of you that enjoys things.

3:30-6:00 | DEEPEN WITH CLIENT STORY
Share Elizabeth's story in full here: doing everything right — reflexology, acupuncture, rest, speaking to her body. Still stuck. Still leaving parties early. This is not a willpower failure. The loop has its own momentum.

6:00-7:30 | PERSONAL CREDIBILITY
"I know what it feels like to endure your days rather than live them. That was my experience for years."

7:30-9:00 | TEASE THE SOLUTION
Something called Heart Coherence is what broke it — not trying harder, but giving the nervous system what it had been missing.

9:00-10:00 | CTA
Comment HEART below. Link in description. Next video tease: Why everything else you have tried has not lasted.`
  },
  'Why Joe Dispenza Meditations Are Not Enough on Their Own': {
    hook: 'If you have read the books, done the Joe Dispenza meditations and you still feel stuck — you are not doing it wrong. You are just missing one thing.',
    framework: `0:00-0:15 | HOOK
If you have read the books, done the Joe Dispenza meditations, and you still feel stuck in chronic symptoms — you are not doing it wrong. You are just missing one thing.

0:15-1:00 | VALIDATE
Name the experience: understanding the mind-body connection intellectually, doing the practices, still not breaking through. "I know healing is possible — I just cannot make it work for me." This is one of the most common things I hear.

1:00-1:45 | REASSURE
The concepts in those books are real. The science is sound. The issue is not what you believe — it is the gap between understanding something in the mind and the body actually feeling safe enough to shift.

1:45-3:30 | NAME THE CAUSE
Knowledge without the right mechanism does not break the loop. You can understand fight or flight completely and still be stuck in it. The body needs a direct input — not just an intellectual reframe.

3:30-6:00 | DEEPEN WITH CLIENT STORY
Walk through why advanced mind-body approaches stall. Add Isabell's experience here: Joe Dispenza, You Are The Placebo, access consciousness — all working at the level of thought and belief. The nervous system loop lives below thought.

6:00-7:30 | PERSONAL CREDIBILITY
"I read the same books. I did the meditations. I understood everything — and I was still stuck. Until I found something that worked at a different level."

7:30-9:00 | TEASE THE SOLUTION
Something called Heart Coherence works directly on the nervous system — not through thought or belief, but through a specific physiological input. That is the missing piece.

9:00-10:00 | CTA
Comment HEART below. Link in description. Next video tease: What Heart Coherence actually is and why it is different.`
  },
  'What Is Heart Coherence and Why Is It Different From Meditation': {
    hook: 'Most people have never heard of Heart Coherence. And the people who have usually confuse it with meditation. They are not the same thing — and the difference is why one works where the other does not.',
    framework: `0:00-0:15 | HOOK
Most people have never heard of Heart Coherence. And the people who have usually confuse it with meditation. They are not the same thing — and the difference is why one works where the other does not.

0:15-1:00 | VALIDATE
Name the meditation experience that is not working: doing it for months or years, feeling calmer in the moment, symptoms returning as soon as life kicks back in. "I have been meditating for years and I still feel stuck."

1:00-1:45 | REASSURE
Meditation is not wrong. It is simply working at a different level to Heart Coherence. If you are dealing with a nervous system stuck in fight or flight, you need the specific tool that targets that loop directly.

1:45-3:30 | NAME THE MECHANISM
Heart Coherence works by creating a specific rhythm between the heart and the brain that signals safety to the nervous system. Not about relaxing the mind — about changing the physiological state the body defaults to.

3:30-6:00 | DEEPEN THE EXPLANATION
How Heart Coherence differs: it is measurable, it works at the level of the autonomic nervous system, and it produces lasting change rather than temporary relief. Simple explanation of what it involves: the breath pacer, the heart focus, the feeling state.

6:00-7:30 | PERSONAL CREDIBILITY
"This is the thing I wish I had known years earlier. Not because meditation is bad — but because Heart Coherence was the specific key my nervous system needed."

7:30-9:00 | TEASE THE PRACTICE
Inside Regulate for Relief, this is the daily practice. Done consistently, done simply — it builds the safety signal that breaks the loop over time.

9:00-10:00 | CTA
Comment HEART below. Link in description. Next video tease: Why I built this programme after years of struggling myself.`
  },
  'Why I Built Regulate for Relief After Years of Chronic Symptoms': {
    hook: 'For years I did not feel like myself. Exhausted, reactive, stuck in survival mode — and nobody could tell me why. This is what changed everything.',
    framework: `0:00-0:15 | HOOK
For years I did not feel like myself. Exhausted, reactive, stuck in survival mode — and nobody could tell me why. This is what changed everything.

0:15-1:00 | VALIDATE
Name the experience from the inside: the symptoms, the failed routes, the quiet fear that this is just how life is now. Mirror the audience's experience through your own story — make them feel seen before the video has barely started.

1:00-1:45 | REASSURE
You are not broken. You have not failed. You have just been trying the right things in the wrong order — treating the symptoms without addressing the nervous system generating them.

1:45-3:30 | THE TURNING POINT
What changed for you. When you discovered Heart Coherence. What it did that nothing else had done. Be specific — not vague inspiration, but a real moment of shift.

3:30-6:00 | WHY YOU BUILT THIS
The gap you saw: thousands of people with chronic symptoms, doing everything right, not getting lasting results — because nobody was teaching them how to regulate their nervous system properly. This is why Regulate for Relief exists.

6:00-7:30 | WHAT REGULATE FOR RELIEF IS
Simple, direct explanation: a daily Heart Coherence practice, progressive over six weeks, inside a private Skool community with weekly coaching. Built for people who are exhausted and need something simple that actually works.

7:30-9:00 | WHO IT IS FOR
Name the audience directly: the person who has tried everything, the one who understands the mind-body connection but cannot make it land, the one who just wants their life back.

9:00-10:00 | CTA
Comment HEART below. Link in description. Next video tease: A real client story.`
  },
  "She Left Her Cousin's Birthday Party Early Because of Pain — Here's What Changed": {
    hook: "She was doing everything right. Reflexology, acupuncture, rest. And she still had to leave her cousin's 70th birthday party two hours in because the pain was too much. Her son's wedding was three months away.",
    framework: `0:00-0:15 | HOOK
She was doing everything right. Reflexology, acupuncture, rest — everything. And she still had to leave her cousin's 70th birthday party two hours in because the pain was too much. Her son's wedding was three months away.

0:15-1:00 | VALIDATE
Paint the picture of her life: the specific things chronic illness had taken from her, the determination to keep trying, the heartbreak of doing everything right and still being stuck. "This is robbing me of my life on a day to day basis."

1:00-1:45 | REASSURE
She was not failing. She was not weak. She had the belief, the willingness and the knowledge — she was simply missing the right mechanism.

1:45-3:30 | NAME THE CAUSE
Her nervous system was stuck in fight or flight — and every external treatment she was trying could not reach it. The loop had its own momentum, independent of what she was doing on the outside.

3:30-6:00 | THE SHIFT
What changed when she started working with Heart Coherence. Be specific about what shifted and when. Do not rush this section — it is the emotional core of the video. "The old happy me is still inside me somewhere."

6:00-7:30 | THE RESULT
Where she is now. The life events she can show up for. What it means to her to be well for her son's wedding.

7:30-9:00 | TEASE THE MECHANISM
Something called Heart Coherence. A daily practice. Simple to do. The one thing that broke a loop that years of other treatments could not.

9:00-10:00 | CTA
Comment HEART below. Link in description. Next video tease: What Heart Coherence is and how it works.`
  },
  "I Finished Cancer Treatment and I Still Did Not Feel Like Myself — Here's Why": {
    hook: "She expected to feel relief when treatment ended. Instead she felt more stuck, more lost and more unlike herself than ever. The doctors had put so much fear in her that her nervous system never got the message it was safe.",
    framework: `0:00-0:15 | HOOK
She expected to feel relief when treatment ended. Instead she felt more stuck, more lost and more unlike herself than ever. The doctors had put so much fear in her that her nervous system never got the message it was safe.

0:15-1:00 | VALIDATE
Name the specific experience of post-treatment chronic symptoms: depression, feeling stuck in a loop, not knowing how to get life back. "I don't know how to get my life back again." This is more common than anyone talks about.

1:00-1:45 | REASSURE
This is not a sign that something is still wrong medically. The body is clear — but the nervous system has been running a fear response for so long that it does not know how to switch off. This is a nervous system problem, not a medical one.

1:45-3:30 | NAME THE CAUSE
The fear instilled during the medical process — the scans, the diagnoses, the worst-case conversations — created a nervous system response that outlasted the treatment. Fight or flight became the default. The body never got the signal: you are safe now.

3:30-6:00 | DEEPEN THE LOOP
Knowledge alone is not enough. She had a lot of knowledge about mind-body healing — and it was not enough, because the body was still running the old programme. The gap between understanding and embodying.

6:00-7:30 | PERSONAL CREDIBILITY
"I have spoken to many people in this situation. The treatment ends. The fear does not. And nobody prepares you for that."

7:30-9:00 | TEASE THE SOLUTION
Something called Heart Coherence gives the nervous system the direct signal it needs: you are safe. Not through thought or willpower — through a specific physiological practice that changes the body's default state.

9:00-10:00 | CTA
Comment HEART below. Link in description. Next video tease: What is actually stopping you from healing right now.`
  },
  'What Is the One Thing Stopping You From Healing Right Now?': {
    hook: 'I want to ask you something directly. Not a rhetorical question — an actual question I want you to sit with honestly. What is the one thing you believe is stopping you from healing right now?',
    framework: `0:00-0:15 | HOOK
I want to ask you something directly. Not a rhetorical question — an actual question I want you to sit with honestly. What is the one thing you believe is stopping you from healing right now?

0:15-1:00 | VALIDATE THE COMMON ANSWERS
Name the most common beliefs: it will not work for me, I have tried everything, I do not have the energy, I cannot afford it, maybe this is just my life now. Every single one of these is real — and every single one deserves a real answer.

1:00-1:45 | REASSURE
None of these beliefs mean healing is not possible for you. They are the product of a nervous system that has been in survival mode for so long that hope feels dangerous. That is a physiological response — not a character flaw.

1:45-3:30 | NAME THE REAL BARRIER
The real barrier is not willpower, money, time or belief. It is the fight or flight loop running in the background — creating the very thoughts and feelings that make healing feel impossible. The loop protects itself by convincing you it cannot be broken.

3:30-6:00 | ENGAGE THE AUDIENCE
Ask the audience to comment their answer. Read out and respond to common answers — use this section to create genuine conversation. Ask follow-up questions mid-video to drive the comment-to-view ratio.

6:00-7:30 | PERSONAL CREDIBILITY
"I believed all of these things about myself at different points. The thought that it would not work for me was the loudest one. And it was wrong."

7:30-9:00 | TEASE THE SOLUTION
Something called Heart Coherence was the thing that changed it — not because I suddenly believed harder, but because it gave my nervous system a different experience. The body has to feel safe before the mind can believe it.

9:00-10:00 | CTA
Comment your answer below — I read every one. Link in description. Next video tease: The loop that is keeping your symptoms going.`
  },
};

// Fetch all pages
const res = await fetch(`https://api.notion.com/v1/databases/${DB_ID}/query`, {
  method: 'POST',
  headers,
  body: JSON.stringify({ page_size: 100 })
});
const json = await res.json();

let updated = 0;
for (const page of json.results) {
  const title = page.properties.Title.title[0]?.plain_text;
  const data = updates[title];
  if (!data) { console.log('No update data for:', title); continue; }

  const upRes = await fetch(`https://api.notion.com/v1/pages/${page.id}`, {
    method: 'PATCH',
    headers,
    body: JSON.stringify({
      properties: {
        Hook: { rich_text: [{ type: 'text', text: { content: data.hook } }] },
        Framework: { rich_text: [{ type: 'text', text: { content: data.framework } }] },
      }
    })
  });
  if (!upRes.ok) { const e = await upRes.json(); console.error('Failed:', title, JSON.stringify(e)); }
  else { console.log(`✅ ${title}`); updated++; }
}

console.log(`\nDone. ${updated}/10 videos updated.`);
