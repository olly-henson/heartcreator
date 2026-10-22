// ============================================================
// Attraction Score — email Worker (fully stateless)
// ============================================================
//
// Built 2026-10-01. The Attraction Score tool (attraction-score-snapshot.html,
// a Skool Classroom tool members can use any time) POSTs
// { name, email, calm, belief, clarity } here. In one request this Worker:
//   1. Emails the member their score report
//   2. Emails Olly the same scores, so he can reach out (Reply goes to them)
//
// No Google Sheet, no scheduled sends. Nothing is stored.
//
// ⚠️ The score maths and the area summaries are ALSO in
// attraction-score-snapshot.html. If either changes, change both.
//
// SETUP (one time):
//   1. Cloudflare dashboard > Workers & Pages > Create > Worker,
//      name it attraction-score
//   2. Paste this file, deploy
//   3. Settings > Variables and Secrets > add RESEND_API_KEY (secret, Key
//      exactly RESEND_API_KEY, same Resend account as the other Workers)
//   4. Settings > Domains & Routes > Add Custom Domain:
//      score.ollyhenson.com
//   5. Put that URL into attraction-score-snapshot.html at SCORE_WORKER_URL
// ============================================================

const OLLY_EMAIL = 'olly@ollyhenson.com';
const FROM_EMAIL = 'olly@ollyhenson.com';
const FROM_NAME = 'Olly Henson';
// TODO: swap for each module's Classroom link once Olly sends them.
const STEP_URLS = {
  Regulate: 'https://www.skool.com/heartcreator/classroom',
  Rewrite: 'https://www.skool.com/heartcreator/classroom',
  Rehearse: 'https://www.skool.com/heartcreator/classroom',
};

// summary[0] = score 1–4, summary[1] = 5–7, summary[2] = 8–10
const AREAS = [
  { key: 'calm', name: 'Calm', step: 'Regulate', summary: [
    "Right now meeting your person feels more stressful than exciting. Your body is on alert around love, so dates, texts and silences all feel high stakes. When your body feels unsafe it's hard to stay open to anyone.",
    "You have calm moments but the worry still creeps back in. Your body hasn't fully settled into feeling safe around love yet. Getting this steady makes everything else easier.",
    "You feel settled about meeting your person. That's a strong base. The work now is keeping it steady so it holds when things start to get real.",
  ]},
  { key: 'belief', name: 'Belief', step: 'Rewrite', summary: [
    "Part of you doesn't believe this can happen for you. That belief usually comes from old experiences. It quietly shapes who you're drawn to and what you expect from love.",
    "You can see that it's possible but you can't fully feel it yet. The doubt is still running in the background and it pulls you back to old patterns.",
    "You believe it can happen for you. That's one of the biggest things you have going for you. Now it needs to feel as real as a memory.",
  ]},
  { key: 'clarity', name: 'Clarity', step: 'Rehearse', summary: [
    "You're not clear yet on who you want. Without a clear picture it's easy to settle for whoever shows up or keep repeating the same patterns.",
    "You know some of what you want but the picture is still blurry. The clearer it gets, the easier it is to recognize your person when they show up.",
    "You know who you want and how you want to feel with them. That clarity is powerful. Now it's about feeling it every day as if it's already happening.",
  ]},
];

const PATH = [
  { name: 'Regulate', len: '7 days', area: 'calm', text: 'Calm your nervous system so love stops feeling like a threat and you can stay open.' },
  { name: 'Rewrite', len: '30 days', area: 'belief', text: 'Install a new belief about love so your subconscious stops working against you.' },
  { name: 'Rehearse', len: 'every day until you meet your person', area: 'clarity', text: "Get clear on your person and practice feeling what it's like to be with them." },
];

const BANDS = [
  { min: 10, name: 'Protected heart' },
  { min: 30, name: 'Hopeful but guarded' },
  { min: 50, name: 'Opening up' },
  { min: 70, name: 'Ready and open' },
  { min: 90, name: 'Fully aligned' },
];
const LEVEL_LABEL = ['Starting out', 'Building', 'Strong'];

function score(v) { return Math.round((v.calm + v.belief + v.clarity) / 30 * 100); }
function band(sc) { let b = BANDS[0]; BANDS.forEach((x) => { if (sc >= x.min) b = x; }); return b; }
function level(n) { return n <= 4 ? 0 : n <= 7 ? 1 : 2; }

function corsHeaders() {
  return {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
  };
}
function json(body, status = 200) {
  return new Response(JSON.stringify(body), { status, headers: { ...corsHeaders(), 'Content-Type': 'application/json' } });
}

function esc(s) {
  return String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
}
function wrapHtml(body) {
  return `<div style="font-family:Arial,sans-serif;font-size:17px;line-height:1.7;color:#000000;">${body}</div>`;
}
function link(url, text) {
  return `<a href="${url}" style="color:#0066cc;">${text}</a>`;
}
function firstName(name) {
  return String(name).trim().split(' ')[0];
}

function memberEmailHtml(name, v) {
  const sc = score(v);
  const areas = AREAS.map((a) => {
    const n = v[a.key], lv = level(n);
    return `<p><strong style="font-size:19px;">${a.name}: ${n}/10</strong> (${LEVEL_LABEL[lv]})<br>${esc(a.summary[lv])}</p>`;
  }).join('');
  const steps = PATH.map((p, i) => `<p><strong>${i + 1}. ${p.name}</strong> (${p.len})<br>${esc(p.text)}</p>`).join('');
  return wrapHtml(`
    <p>Hi ${esc(firstName(name))},</p>
    <p>Here's your Attraction Score:</p>
    <p><strong style="font-size:24px;">${sc} out of 100</strong><br>${band(sc).name}</p>
    <p>This is where you're at right now in each area:</p>
    ${areas}
    <p><strong style="font-size:19px;">Your path to your person</strong><br>Three meditations, one after the other. Each one builds on the last.</p>
    ${steps}
    <p>Start ${PATH[0].name} in the Classroom ${link(STEP_URLS[PATH[0].name], 'here')}</p>
    <p>You can retake your Attraction Score any time to see how it's moved.</p>
    <p>Olly</p>
  `);
}
function memberEmailText(name, v) {
  const sc = score(v);
  const areas = AREAS.map((a) => `${a.name}: ${v[a.key]}/10 (${LEVEL_LABEL[level(v[a.key])]}). ${a.summary[level(v[a.key])]}`).join('\n\n');
  const steps = PATH.map((p, i) => `${i + 1}. ${p.name} (${p.len}). ${p.text}`).join('\n');
  return `Hi ${firstName(name)},\n\nHere's your Attraction Score: ${sc} out of 100 (${band(sc).name}).\n\nThis is where you're at right now in each area:\n\n${areas}\n\nYour path to your person:\n${steps}\n\nStart ${PATH[0].name} in the Classroom: ${STEP_URLS[PATH[0].name]}\n\nYou can retake your Attraction Score any time to see how it's moved.\n\nOlly`;
}

function coachEmailHtml(name, email, v) {
  const sc = score(v);
  const rows = AREAS.map((a) => `${a.name}: <strong>${v[a.key]}/10</strong> (${LEVEL_LABEL[level(v[a.key])]})`).join('<br>');
  return wrapHtml(`
    <p>${esc(name)} just checked their Attraction Score. Hit Reply to email them.</p>
    <p><strong>Email:</strong> ${esc(email)}<br>
    <strong>Score:</strong> ${sc}/100 (${band(sc).name})</p>
    <p>${rows}</p>
  `);
}

async function sendEmail(env, { to, subject, html, text, replyTo }) {
  const payload = { from: `${FROM_NAME} <${FROM_EMAIL}>`, to: [to], subject, html, text: text || '' };
  if (replyTo) payload.reply_to = replyTo;
  const resp = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${env.RESEND_API_KEY}`, 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  if (!resp.ok) {
    const errText = await resp.text();
    throw new Error(`Resend send failed (${resp.status}) to ${to}: ${errText}`);
  }
}

function validScore(n) { return Number.isInteger(n) && n >= 1 && n <= 10; }

export default {
  async fetch(request, env, ctx) {
    if (request.method === 'OPTIONS') return new Response(null, { headers: corsHeaders() });
    if (request.method !== 'POST') return new Response('Method not allowed', { status: 405, headers: corsHeaders() });

    let data;
    try { data = await request.json(); } catch (e) { return json({ error: 'Invalid JSON' }, 400); }

    const name = String(data.name || '').trim().slice(0, 100);
    const email = String(data.email || '').trim().slice(0, 200);
    const v = { calm: Number(data.calm), belief: Number(data.belief), clarity: Number(data.clarity) };

    if (!name || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || !validScore(v.calm) || !validScore(v.belief) || !validScore(v.clarity)) {
      return json({ error: 'Missing or invalid fields' }, 400);
    }

    const sc = score(v);
    try {
      await sendEmail(env, {
        to: email,
        subject: `Your Attraction Score: ${sc}`,
        html: memberEmailHtml(name, v),
        text: memberEmailText(name, v),
      });
      // reply_to = the member, so Olly can hit Reply to reach out
      await sendEmail(env, {
        to: OLLY_EMAIL,
        subject: `${name} scored ${sc} on the Attraction Score`,
        html: coachEmailHtml(name, email, v),
        replyTo: email,
      });
    } catch (err) {
      return json({ error: String(err) }, 502);
    }
    return json({ ok: true, score: sc });
  },
};
