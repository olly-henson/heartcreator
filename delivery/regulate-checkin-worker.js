// ============================================================
// Regulate — 7-Day Check-In Worker (fully stateless)
// ============================================================
//
// This is a SEPARATE system from attraction-formula-tracker.gs (the
// belief-builder intake tracker) — that file's own comment says
// explicitly not to extend it with check-ins.
//
// Rebranded 2026-09-10 from "The Attraction Formula" to "The Regulate
// Program" — same stateless design.
//
// Changed 2026-09-24 (Olly): 30 days / 3 check-ins every 10 days -> a
// 7-DAY program with a check-in on day 3 and the completion email on day 7
// (too long for people who've just joined). Cadence now lives in
// PROGRAM_DAYS + CHECKIN_DAYS below — the days are not evenly spaced, so
// there is no interval constant any more.
//
// SETUP (one time):
//   1. Cloudflare dashboard > Workers & Pages > Create > Worker
//   2. Paste this file, deploy
//   3. Settings > Variables and Secrets > add RESEND_API_KEY (secret,
//      same Resend account/domain used by the other workers here —
//      ollyhenson.com, DNS already verified in Cloudflare)
//   4. Settings > Domains & Routes > Add Custom Domain, e.g.
//      regulate-checkin.ollyhenson.com
//      (Cloudflare handles the DNS record automatically)
//   5. Paste the deployed URL into regulate-start.html at the
//      CHECKIN_WORKER_URL constant near the top of its <script>.
//
// HOW IT WORKS:
//   regulate-start.html POSTs { name, email, startDate } once
//   someone fills in the form and clicks "Start The Regulate
//   Program". This worker, in one request:
//     1. Sends the client their start-date confirmation email immediately
//     2. Sends Olly a notification
//     3. Schedules both check-in emails (day 3 and day 7) via
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
const FROM_NAME = 'The Regulate Meditation';
const COMMUNITY_URL = 'https://www.skool.com/heartcreator';
const SHARE_BASE_URL = 'https://share.ollyhenson.com';
// The program is PROGRAM_DAYS long. CHECKIN_DAYS are the days (after the
// start date) an email goes out; the LAST one must equal PROGRAM_DAYS — it's
// the completion email.
const PROGRAM_DAYS = 7;
const CHECKIN_DAYS = [3, 7];

// "here" links open the shared share page (share-worker.js) with a message
// carried in ?text=. Started is a read-only message that auto-copies;
// type=checkin opens an editable box pre-filled with a starter like
// "Regulate Meditation, Day 3 Update: " for the client to finish in their
// own words. The completion link (day 7) uses type=checkin too, because the
// client writes how it went; the starter already says they're ready for Rewrite.
const STARTED_SHARE_URL = `${SHARE_BASE_URL}/?type=started&text=${encodeURIComponent("I've just started The Regulate Meditation — excited to get going!")}`;
function checkinShareUrl(day) {
  return `${SHARE_BASE_URL}/?type=checkin&text=${encodeURIComponent(`Regulate Meditation, Day ${day} Update: `)}`;
}
const COMPLETED_SHARE_URL = `${SHARE_BASE_URL}/?type=checkin&text=${encodeURIComponent(`Just completed the Regulate Meditation and ready to start the Rewrite Meditation!`)}`;

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
    <p>You're officially about to start using The Regulate Meditation.</p>
    <p>It's time to get you feeling cool, calm and confident about attracting your person.</p>
    <p>So for the next ${PROGRAM_DAYS} days I'm going to be checking in with you to make sure things are going well.</p>
    <p>Here's the official start and end date based on what you chose:</p>
    <p><strong style="font-size:19px;">Your start date:</strong> ${startDateText}<br>
    <strong style="font-size:19px;">Your end date:</strong> ${endDateText}</p>
    <p>I'll check in with you on day ${CHECKIN_DAYS[0]}, to see how you're doing.</p>
    <p>Come and let us know that you've started so we can support you &rarr; ${link(STARTED_SHARE_URL, 'here')}</p>
    <p>Olly</p>
  `);
}

function coachNotificationHtml(name, email, startDateText, firstCheckinText) {
  return wrapHtml(`
    <p>${name} has just started The Regulate Meditation.</p>
    <p><strong>Email:</strong> ${email}<br>
    <strong>Start date:</strong> ${startDateText}<br>
    <strong>First check-in scheduled:</strong> ${firstCheckinText}</p>
  `);
}

// Check-in 1 (day 3) — short. Check-in 2 (day 7, isFinal) — completion:
// they share how it went and that they're ready for The Rewrite Meditation.
// checkinNumber is 1-based, an index into CHECKIN_DAYS.
function checkinEmailHtml(name, checkinNumber, isFinal) {
  if (isFinal) {
    return wrapHtml(`
      <p>Hey ${firstName(name)},</p>
      <p>So well done on completing The Regulate Meditation. 🥳</p>
      <p>Let us know inside the community how it went and that you're ready for <strong>The Rewrite Meditation</strong> ${link(COMPLETED_SHARE_URL, 'here')} and we'll unlock it for you 😎</p>
      <p>Olly</p>
    `);
  }
  return wrapHtml(`
    <p>Hey ${firstName(name)},</p>
    <p>How's the meditating going?</p>
    <p>Let us know in the community ${link(checkinShareUrl(CHECKIN_DAYS[checkinNumber - 1]), 'here')}</p>
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
        subject: `You've started The Regulate Meditation`,
        html: confirmationEmailHtml(name, startDateText, endDateText),
        text: `Congrats! You're officially about to start using The Regulate Meditation. It's time to get you feeling cool, calm and confident about attracting your person. So for the next ${PROGRAM_DAYS} days I'm going to be checking in with you to make sure things are going well. Start date: ${startDateText}. End date: ${endDateText}. I'll check in with you on day ${CHECKIN_DAYS[0]}, to see how you're doing. Come and let us know that you've started so we can support you: ${STARTED_SHARE_URL}`,
      });

      await sendEmail(env, {
        to: OLLY_EMAIL,
        subject: `${name} has started The Regulate Meditation`,
        html: coachNotificationHtml(name, email, startDateText, formatDateLong(firstCheckin)),
      });

      // Schedule every check-in up front — Resend holds each one and
      // sends it at scheduled_at, no further action needed from here.
      for (let i = 1; i <= CHECKIN_DAYS.length; i++) {
        const day = CHECKIN_DAYS[i - 1];
        const isFinal = i === CHECKIN_DAYS.length;
        const sendAt = dateAtDaysOffset(startDate, day, SEND_HOUR_UTC);
        await sendEmail(env, {
          to: email,
          subject: isFinal
            ? `Well done on completing The Regulate Meditation! 🎉`
            : `How's it going?`,
          html: checkinEmailHtml(name, i, isFinal),
          text: isFinal
            ? `So well done on completing The Regulate Meditation. 🥳 Let us know inside the community how it went and that you're ready for The Rewrite Meditation, and we'll unlock it for you: ${COMPLETED_SHARE_URL}`
            : `How's the meditating going? Let us know in the community: ${checkinShareUrl(day)}`,
          scheduledAt: sendAt.toISOString(),
        });
      }
    } catch (err) {
      return new Response(JSON.stringify({ error: String(err) }), { status: 502, headers: { ...corsHeaders(), 'Content-Type': 'application/json' } });
    }

    return new Response(JSON.stringify({ ok: true }), { headers: { ...corsHeaders(), 'Content-Type': 'application/json' } });
  },
};
