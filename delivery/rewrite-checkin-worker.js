// ============================================================
// Rewrite — 30-Day Check-In Worker (fully stateless)
// ============================================================
//
// This is a SEPARATE system from attraction-formula-tracker.gs (the
// belief-builder intake tracker) — that file's own comment says
// explicitly not to extend it with check-ins.
//
// Built 2026-09-24 as a copy of regulate-checkin-worker.js for The Rewrite
// Meditation — same stateless design. The final check-in unlocks The
// Rehearse Meditation.
//
// Changed 2026-09-25 (Olly): 60 days / 6 check-ins -> a 30-DAY program with
// check-ins on day 10 and 20 and the completion email on day 30 (a natural
// step up from Regulate's 7 days). Cadence now lives in PROGRAM_DAYS +
// CHECKIN_DAYS below, the same shape as regulate-checkin-worker.js.
//
// SETUP (one time):
//   1. Cloudflare dashboard > Workers & Pages > Create > Worker
//   2. Paste this file, deploy
//   3. Settings > Variables and Secrets > add RESEND_API_KEY (secret,
//      same Resend account/domain used by the other workers here —
//      ollyhenson.com, DNS already verified in Cloudflare)
//   4. Settings > Domains & Routes > Add Custom Domain, e.g.
//      rewrite-checkin.ollyhenson.com
//      (Cloudflare handles the DNS record automatically)
//   5. Paste the deployed URL into rewrite-start.html at the
//      CHECKIN_WORKER_URL constant near the top of its <script>.
//
// HOW IT WORKS:
//   rewrite-start.html POSTs { name, email, startDate } once
//   someone fills in the form and clicks "Start The Rewrite
//   Program". This worker, in one request:
//     1. Sends the client their start-date confirmation email immediately
//     2. Sends Olly a notification
//     3. Schedules all 3 check-in emails (day 10, 20, 30) via
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
const FROM_NAME = 'The Rewrite Meditation';
const COMMUNITY_URL = 'https://www.skool.com/heartcreator';
const SHARE_BASE_URL = 'https://share.ollyhenson.com';
// The shared share page (share-worker.js) defaults type=started to the
// Regulate message, so the Rewrite link overrides it with ?text=.
const STARTED_SHARE_URL = `${SHARE_BASE_URL}/?type=started&text=${encodeURIComponent("I've just started The Rewrite Meditation — excited to get going!")}`;
// Day-30 link: type=checkin too (same as Regulate's completion link), because
// the client writes how it went; the starter already says they're ready for Rehearse.
const COMPLETED_SHARE_URL = `${SHARE_BASE_URL}/?type=checkin&text=${encodeURIComponent("Just completed the Rewrite Meditation and ready to start the Rehearse Meditation!")}`;
// Check-ins on day 10 and 20: type=checkin opens an editable box, pre-filled with a
// starter like "Rewrite Meditation, Day 10 Update: " for the client to finish in their own words.
function checkinShareUrl(day) {
  return `${SHARE_BASE_URL}/?type=checkin&text=${encodeURIComponent(`Rewrite Meditation, Day ${day} Update: `)}`;
}
// The program is PROGRAM_DAYS long. CHECKIN_DAYS are the days (after the
// start date) an email goes out; the LAST one must equal PROGRAM_DAYS — it's
// the completion email.
const PROGRAM_DAYS = 30;
const CHECKIN_DAYS = [10, 20, 30];

// Resend only accepts scheduled_at up to 30 days ahead (their docs: "Emails
// can be scheduled up to 30 days in advance"). The day-30 email at 9am UTC is
// just over that for anyone signing up before 9am UTC, which made the whole
// signup fail (2026-09-25). So any send is capped at 30 days from NOW minus a
// safety margin — a morning signup gets its day-30 email a little earlier that
// same day. The start page no longer lets clients pick a future start date.
const RESEND_MAX_AHEAD_MS = 30 * 24 * 60 * 60 * 1000 - 15 * 60 * 1000;
function capToResendLimit(date) {
  const latest = new Date(Date.now() + RESEND_MAX_AHEAD_MS);
  return date > latest ? latest : date;
}

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

function confirmationEmailHtml(name, startDateText, endDateText) {
  return wrapHtml(`
    <p>Hi ${firstName(name)},</p>
    <p>Congrats! 🥳</p>
    <p>You're officially about to start using The Rewrite Meditation.</p>
    <p>When practiced consistently, this meditation is going to help install new core beliefs that will attract your perfect soulmate.</p>
    <p>By changing your core beliefs, you're changing how you think, feel and act - automatically</p>
    <p>For the next ${PROGRAM_DAYS} days I'm going to be checking in with you to make sure things are going well.</p>
    <p>Here's the official start and end date based on what you chose:</p>
    <p><strong style="font-size:19px;">Your start date:</strong> ${startDateText}<br>
    <strong style="font-size:19px;">Your end date:</strong> ${endDateText}</p>
    <p>You'll begin to really notice the changes in how you automatically think from day 21 and beyond.</p>
    <p>Come and let us know that you've started so we can support you &rarr; ${link(STARTED_SHARE_URL, 'here')}</p>
    <p>Olly</p>
  `);
}

function coachNotificationHtml(name, email, startDateText, firstCheckinText) {
  return wrapHtml(`
    <p>${name} has just started The Rewrite Meditation.</p>
    <p><strong>Email:</strong> ${email}<br>
    <strong>Start date:</strong> ${startDateText}<br>
    <strong>First check-in scheduled:</strong> ${firstCheckinText}</p>
  `);
}

// Check-in 1 (day 10) — short. Check-in 2 (day 20) — adds a "N days in,
// X left" line. Check-in 3 (day 30, isFinal) — completion: they share how it
// went and that they're ready for The Rehearse Meditation.
// checkinNumber is 1-based, an index into CHECKIN_DAYS.
function checkinEmailHtml(name, checkinNumber, isFinal) {
  if (isFinal) {
    return wrapHtml(`
      <p>Hey ${firstName(name)},</p>
      <p>So well done on completing The Rewrite Meditation. 🥳</p>
      <p>Let us know inside the community how it went and that you're ready for <strong>The Rehearse Meditation</strong> ${link(COMPLETED_SHARE_URL, 'here')} and we'll unlock it for you 😎</p>
      <p>Olly</p>
    `);
  }
  const day = CHECKIN_DAYS[checkinNumber - 1];
  const dayLine = checkinNumber > 1
    ? `<p>You're now ${day} days in to The Rewrite Meditation - just ${PROGRAM_DAYS - day} days left 😎</p>`
    : '';
  // Check-in 1 names the program in the question; check-in 2 already
  // names it in the "N days in" line above, so keeps the shorter form.
  const question = checkinNumber > 1
    ? `How's it been going?`
    : `How's the meditating going?`;
  return wrapHtml(`
    <p>Hey ${firstName(name)},</p>
    ${dayLine}
    <p>${question}</p>
    <p>Let us know in the community ${link(checkinShareUrl(day), 'here')}</p>
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
    const endDateText = formatDateLong(dateAtDaysOffset(startDate, PROGRAM_DAYS, SEND_HOUR_UTC));
    const firstCheckin = dateAtDaysOffset(startDate, CHECKIN_DAYS[0], SEND_HOUR_UTC);

    try {
      await sendEmail(env, {
        to: email,
        subject: `You've started The Rewrite Meditation!`,
        html: confirmationEmailHtml(name, startDateText, endDateText),
        text: `Congrats! You're officially about to start using The Rewrite Meditation. When practiced consistently, this meditation is going to help install new core beliefs that will attract your perfect soulmate. By changing your core beliefs, you're changing how you think, feel and act - automatically. For the next ${PROGRAM_DAYS} days I'm going to be checking in with you to make sure things are going well. Start date: ${startDateText}. End date: ${endDateText}. You'll begin to really notice the changes in how you automatically think from day 21 and beyond. Come and let us know that you've started so we can support you: ${STARTED_SHARE_URL}`,
      });

      await sendEmail(env, {
        to: OLLY_EMAIL,
        subject: `${name} has started The Rewrite Meditation`,
        html: coachNotificationHtml(name, email, startDateText, formatDateLong(firstCheckin)),
      });

      // Schedule every check-in up front — Resend holds each one and
      // sends it at scheduled_at, no further action needed from here.
      for (let i = 1; i <= CHECKIN_DAYS.length; i++) {
        const day = CHECKIN_DAYS[i - 1];
        const isFinal = i === CHECKIN_DAYS.length;
        const sendAt = capToResendLimit(dateAtDaysOffset(startDate, day, SEND_HOUR_UTC));
        await sendEmail(env, {
          to: email,
          subject: isFinal
            ? `Well done on completing The Rewrite Meditation! 🎉`
            : `How's it going?`,
          html: checkinEmailHtml(name, i, isFinal),
          text: isFinal
            ? `So well done on completing The Rewrite Meditation. 🥳 Let us know inside the community how it went and that you're ready for The Rehearse Meditation, and we'll unlock it for you: ${COMPLETED_SHARE_URL}`
            : `${i > 1 ? "How's it been going?" : "How's the meditating going?"} Let us know in the community: ${checkinShareUrl(day)}`,
          scheduledAt: sendAt.toISOString(),
        });
      }
    } catch (err) {
      return new Response(JSON.stringify({ error: String(err) }), { status: 502, headers: { ...corsHeaders(), 'Content-Type': 'application/json' } });
    }

    return new Response(JSON.stringify({ ok: true }), { headers: { ...corsHeaders(), 'Content-Type': 'application/json' } });
  },
};
