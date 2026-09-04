// ============================================================
// Attraction Formula — 30-Day Check-In Worker (fully stateless)
// ============================================================
//
// This is a SEPARATE system from attraction-formula-tracker.gs (the
// belief-builder intake tracker) — that file's own comment says
// explicitly not to extend it with check-ins.
//
// SETUP (one time):
//   1. Cloudflare dashboard > Workers & Pages > Create > Worker
//   2. Paste this file, deploy
//   3. Settings > Variables and Secrets > add RESEND_API_KEY (secret,
//      same Resend account/domain used by the other workers here —
//      ollyhenson.com, DNS already verified in Cloudflare)
//   4. Settings > Domains & Routes > Add Custom Domain, e.g.
//      attraction-formula-checkin.ollyhenson.com
//      (Cloudflare handles the DNS record automatically)
//   5. Paste the deployed URL into attraction-formula-start.html at the
//      CHECKIN_WORKER_URL constant near the top of its <script>.
//
// HOW IT WORKS:
//   attraction-formula-start.html POSTs { name, email, startDate } once
//   someone fills in the form and clicks "Start Attraction Formula
//   Program". This worker, in one request:
//     1. Sends the client their start-date confirmation email immediately
//     2. Sends Olly a notification
//     3. Schedules all 3 check-in emails (day 10, day 20, day 30) via
//        Resend's scheduled_at — no ongoing trigger, no Google Sheet,
//        no polling. Resend holds and sends each one at the right time.
//
// This is intentionally NOT tied to a Google Sheet or Apps Script —
// confirmed with Olly 2026-09-03: check-ins are just scheduled emails
// with a link to share in the community, nothing more. If Olly ever
// wants a record of who's started or where someone is in the program,
// that's a real feature to add back, not something to assume.
//
// CAVEAT — verify before relying on this in production: Resend's
// scheduled_at feature needs confirming against Resend's current API
// docs/dashboard before this goes live (accepted formats, any cap on
// how far ahead a send can be scheduled, whether scheduled sends can be
// cancelled/edited after the fact). Send yourself a real test signup
// with a short interval first and confirm all 4 emails actually arrive
// on schedule before pointing this at real clients.
// ============================================================

const OLLY_EMAIL = 'olly@ollyhenson.com';
const FROM_EMAIL = 'olly@ollyhenson.com';
const FROM_NAME = 'The Attraction Formula';
const COMMUNITY_URL = 'https://www.skool.com/heartcreator';
const SHARE_BASE_URL = 'https://share.ollyhenson.com';
const CHECKIN_INTERVAL_DAYS = 10;
const TOTAL_CHECKINS = 3; // 3 × 10 days = the full 30-day program

function corsHeaders() {
  return {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
  };
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

// startDate is "YYYY-MM-DD" from the page's date input. Parsed as a
// plain calendar date (not a timestamp) so timezone shifts can't push
// it to the wrong day, then a fixed send time is applied.
function dateAtDaysOffset(startDate, days, hourUTC) {
  const [y, m, d] = startDate.split('-').map(Number);
  const dt = new Date(Date.UTC(y, m - 1, d, hourUTC, 0, 0));
  dt.setUTCDate(dt.getUTCDate() + days);
  return dt;
}

function formatDateLong(date) {
  return date.toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric', timeZone: 'UTC' });
}

function confirmationEmailHtml(name, startDateText) {
  return wrapHtml(`
    <p>Hi ${firstName(name)},</p>
    <p>You've officially started The Attraction Formula Program.</p>
    <p><strong style="font-size:19px;">Your start date:</strong> ${startDateText}</p>
    <p>The program runs for 30 days. I'll check in with you 3 times along the way — every 10 days — to see how it's going, with the option to share how the last 10 days have gone in the community. No forms, no pressure — just reply to the email whenever suits, or post in the community when you're ready.</p>
    <p>${link(COMMUNITY_URL, 'Say hello in the community →')}</p>
    <p>Olly</p>
  `);
}

function coachNotificationHtml(name, email, startDateText, firstCheckinText) {
  return wrapHtml(`
    <p>${name} has just started The Attraction Formula Program.</p>
    <p><strong>Email:</strong> ${email}<br>
    <strong>Start date:</strong> ${startDateText}<br>
    <strong>First check-in scheduled:</strong> ${firstCheckinText}</p>
  `);
}

function checkinEmailHtml(name, checkinNumber, isFinal) {
  const dayNumber = checkinNumber * CHECKIN_INTERVAL_DAYS;
  const shareUrl = SHARE_BASE_URL + '?type=checkin';
  const closingLine = isFinal
    ? `<p>That's the full 30 days — you've made it through the whole program. However you're feeling about it, I'd love to hear.</p>`
    : `<p>I'll check in again in another ${CHECKIN_INTERVAL_DAYS} days.</p>`;

  return wrapHtml(`
    <p>Hi ${firstName(name)},</p>
    <p>${isFinal ? `It's day ${dayNumber} — the last check-in of The Attraction Formula Program.` : `It's been ${CHECKIN_INTERVAL_DAYS} days since your last check-in on The Attraction Formula Program (day ${dayNumber} of 30).`}</p>
    <p>How have the last ${CHECKIN_INTERVAL_DAYS} days gone? What's shifted, what's felt hard, what have you noticed?</p>
    <p>${link(shareUrl, `Share how your last ${CHECKIN_INTERVAL_DAYS} days went in the community →`)}</p>
    ${closingLine}
    <p>Olly</p>
  `);
}

async function sendEmail(env, { to, subject, html, text, scheduledAt }) {
  const payload = {
    from: `${FROM_NAME} <${FROM_EMAIL}>`,
    to: [to],
    subject,
    html,
    text: text || '',
  };
  if (scheduledAt) payload.scheduled_at = scheduledAt;

  const resp = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${env.RESEND_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });

  if (!resp.ok) {
    const errText = await resp.text();
    throw new Error(`Resend send failed (${resp.status}) to ${to}: ${errText}`);
  }
}

export default {
  async fetch(request, env, ctx) {
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

    const name = (data.name || '').trim();
    const email = (data.email || '').trim();
    const startDate = (data.startDate || '').trim();

    if (!name || !email || !/^\d{4}-\d{2}-\d{2}$/.test(startDate)) {
      return new Response(JSON.stringify({ error: 'Missing or invalid fields' }), { status: 400, headers: { ...corsHeaders(), 'Content-Type': 'application/json' } });
    }

    // 9am UTC — matches the "daily 9am" convention used by every other
    // reminder trigger in this repo, close enough across the timezones
    // this audience is actually in.
    const SEND_HOUR_UTC = 9;
    const startDateObj = dateAtDaysOffset(startDate, 0, SEND_HOUR_UTC);
    const startDateText = formatDateLong(startDateObj);
    const firstCheckin = dateAtDaysOffset(startDate, CHECKIN_INTERVAL_DAYS, SEND_HOUR_UTC);

    try {
      await sendEmail(env, {
        to: email,
        subject: `You've started The Attraction Formula Program`,
        html: confirmationEmailHtml(name, startDateText),
        text: `You've officially started The Attraction Formula Program. Start date: ${startDateText}.`,
      });

      await sendEmail(env, {
        to: OLLY_EMAIL,
        subject: `${name} has started The Attraction Formula Program`,
        html: coachNotificationHtml(name, email, startDateText, formatDateLong(firstCheckin)),
      });

      // Schedule all 3 check-ins up front — Resend holds each one and
      // sends it at scheduled_at, no further action needed from here.
      for (let i = 1; i <= TOTAL_CHECKINS; i++) {
        const isFinal = i === TOTAL_CHECKINS;
        const sendAt = dateAtDaysOffset(startDate, i * CHECKIN_INTERVAL_DAYS, SEND_HOUR_UTC);
        const dayNumber = i * CHECKIN_INTERVAL_DAYS;
        await sendEmail(env, {
          to: email,
          subject: isFinal
            ? `${firstName(name)}, you've completed The Attraction Formula Program`
            : `${firstName(name)}, how have your last ${CHECKIN_INTERVAL_DAYS} days gone?`,
          html: checkinEmailHtml(name, i, isFinal),
          text: `How have your last ${CHECKIN_INTERVAL_DAYS} days gone on The Attraction Formula Program? (Day ${dayNumber})`,
          scheduledAt: sendAt.toISOString(),
        });
      }
    } catch (err) {
      return new Response(JSON.stringify({ error: String(err) }), { status: 502, headers: { ...corsHeaders(), 'Content-Type': 'application/json' } });
    }

    return new Response(JSON.stringify({ ok: true }), { headers: { ...corsHeaders(), 'Content-Type': 'application/json' } });
  },
};
