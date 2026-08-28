// ============================================================
// Attraction Formula — Meditation Summary Email Worker
// ============================================================
//
// SETUP (one time):
//   1. Cloudflare dashboard > Workers & Pages > Create > Worker
//   2. Paste this file, deploy
//   3. Settings > Variables and Secrets > add RESEND_API_KEY (secret,
//      same Resend account/domain used by share-worker.js — ollyhenson.com,
//      DNS already verified in Cloudflare)
//   4. Settings > Domains & Routes > Add Custom Domain, e.g.
//      meditation-summary.ollyhenson.com
//      (Cloudflare handles the DNS record automatically)
//   5. Paste the deployed URL into build-your-meditation.html at the
//      MEDITATION_SUMMARY_WORKER_URL constant near the top of its <script>.
//
// HOW IT WORKS:
//   build-your-meditation.html POSTs JSON to this worker once someone
//   enters their email on the "Email My Meditation Details" step:
//     { email, oldBelief, newBelief, emotion, startDate, endDate }
//   This worker sends the visitor a summary email via Resend containing
//   their belief, feeling, start/end dates, and the 7-step meditation
//   walkthrough — and sends a separate, shorter notification to Olly
//   (as coach) with just the name/email/belief/emotion/dates.
// ============================================================

const OLLY_EMAIL = 'olly@ollyhenson.com';
const FROM_EMAIL = 'olly@ollyhenson.com';
const FROM_NAME = 'The Attraction Formula';

function meditationSteps(data) {
  return [
    { title: 'Close Your Eyes', desc: 'Settle into a comfortable position, sitting up or lying down, and gently close your eyes. Just keep a neutral spine position.' },
    { title: 'Relax', desc: 'Let go of any tension, softening from head to toe.' },
    { title: 'Notice Your Heart', desc: 'Bring your attention into the centre of your chest and place your focus on your heart. Allow any thoughts or distractions to come and go as you keep your attention there.' },
    { title: 'Heart-Focused Breathing', desc: 'Breathe a little slower and deeper into your heart, and on the out breath, release.' },
    { title: 'New Belief', desc: `Recall your new belief: "${data.newBelief}" and sit with it. Let it settle into you.` },
    { title: 'Feel', desc: `Recall the feeling of "${data.emotion}" that this belief makes you feel and breathe with that feeling and feel it in your heart.` },
    { title: 'Step Into That Version Of You', desc: 'Step into the body of the version of you that embodies this feeling. Be with that feeling and settle into it.' },
    { title: 'Return To Your Body', desc: 'Bring your attention back to your body and slowly open your eyes.' },
  ];
}

function corsHeaders() {
  return {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
  };
}

function wrapHtml(body) {
  return `<div style="font-family:Arial,sans-serif;font-size:18px;line-height:1.5;color:#000000;">${body}</div>`;
}

function buildEmailHtml(data) {
  const stepsText = meditationSteps(data).map((s, i) =>
    `<p><strong style="font-size:19px;">${i + 1}. ${s.title}</strong><br>${s.desc}</p>`
  ).join('');

  const greeting = data.name ? `Hi ${data.name},` : 'Hi,';

  return wrapHtml(`
    <p>${greeting}</p>
    <p>Here's everything from your Attraction Formula setup, saved for you.</p>
    <p><strong style="font-size:19px;">Old belief:</strong> ${data.oldBelief}</p>
    <p><strong style="font-size:19px;">New belief:</strong> ${data.newBelief}</p>
    <p><strong style="font-size:19px;">Feeling:</strong> ${data.emotion}</p>
    <p><strong style="font-size:19px;">Start date:</strong> ${data.startDate}<br>
    <strong style="font-size:19px;">End date (Day 30):</strong> ${data.endDate}</p>
    <p><strong style="font-size:19px;">How to do the meditation:</strong></p>
    ${stepsText}
    <p><a href="https://www.skool.com/heartcreator" style="color:#4B1466;">Got a question, ask it here</a></p>
    <p>To your health, happiness and success.<br>Olly</p>
  `);
}

function buildCoachEmailHtml(data) {
  const who = data.name || data.email;
  return wrapHtml(`
    <p>${who} has just set up their Attraction Formula meditation.</p>
    <p><strong>Name:</strong> ${data.name || '(not given)'}<br>
    <strong>Email:</strong> ${data.email}</p>
    <p><strong>Old belief:</strong> ${data.oldBelief}<br>
    <strong>New belief:</strong> ${data.newBelief}<br>
    <strong>Feeling:</strong> ${data.emotion}</p>
    <p><strong>Start date:</strong> ${data.startDate}<br>
    <strong>End date (Day 30):</strong> ${data.endDate}</p>
  `);
}

export default {
  async fetch(request, env) {
    if (request.method === 'OPTIONS') {
      return new Response(null, { headers: corsHeaders() });
    }
    if (request.method !== 'POST') {
      return new Response('Method not allowed', { status: 405, headers: corsHeaders() });
    }

    let data;
    try {
      data = await request.json();
    } catch (e) {
      return new Response(JSON.stringify({ error: 'Invalid JSON' }), { status: 400, headers: { ...corsHeaders(), 'Content-Type': 'application/json' } });
    }

    if (!data.email || !data.newBelief) {
      return new Response(JSON.stringify({ error: 'Missing required fields' }), { status: 400, headers: { ...corsHeaders(), 'Content-Type': 'application/json' } });
    }

    const html = buildEmailHtml(data);

    const resendResp = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${env.RESEND_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: `${FROM_NAME} <${FROM_EMAIL}>`,
        to: [data.email],
        subject: 'Your Attraction Formula Meditation Details',
        html,
      }),
    });

    if (!resendResp.ok) {
      const errText = await resendResp.text();
      return new Response(JSON.stringify({ error: 'Email send failed', detail: errText }), { status: 502, headers: { ...corsHeaders(), 'Content-Type': 'application/json' } });
    }

    // Separate summary notification to the coach — not a copy of the client's email.
    const coachHtml = buildCoachEmailHtml(data);
    await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${env.RESEND_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: `${FROM_NAME} <${FROM_EMAIL}>`,
        to: [OLLY_EMAIL],
        subject: `${data.name || data.email} has set up their Attraction Formula meditation`,
        html: coachHtml,
      }),
    });

    return new Response(JSON.stringify({ ok: true }), { headers: { ...corsHeaders(), 'Content-Type': 'application/json' } });
  },
};
