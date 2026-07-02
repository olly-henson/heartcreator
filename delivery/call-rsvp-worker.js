// Cloudflare Worker — rsvp.ollyhenson.com/call
// Set APPS_SCRIPT_URL in Worker environment variables

const SKOOL_URL = 'https://www.skool.com/live/hKJmFBDh2Zk';

function getNextWednesday() {
  const now = new Date(new Date().toLocaleString('en-GB', { timeZone: 'Europe/London' }));
  const day = now.getDay(); // 0=Sun, 3=Wed
  const daysUntilWed = (3 - day + 7) % 7 || 7; // if today is Wed, get next Wed
  const next = new Date(now);
  next.setDate(now.getDate() + daysUntilWed);
  return next;
}

function buildCalendarLinks(firstName, lastName) {
  const next = getNextWednesday();
  const y = next.getFullYear();
  const m = String(next.getMonth() + 1).padStart(2, '0');
  const d = String(next.getDate()).padStart(2, '0');
  const dateStr = `${y}${m}${d}`;
  const isoDate = `${y}-${m}-${d}`;

  const title = 'Coaching Q&A Call';
  const details = `Join here: ${SKOOL_URL}`;

  const google = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(title)}&dates=${dateStr}T190000/${dateStr}T200000&ctz=Europe/London&details=${encodeURIComponent(details)}&location=${encodeURIComponent(SKOOL_URL)}`;
  const outlookPersonal = `https://outlook.live.com/calendar/0/action/compose?subject=${encodeURIComponent(title)}&startdt=${isoDate}T19:00:00&enddt=${isoDate}T20:00:00&body=${encodeURIComponent(details)}&location=${encodeURIComponent(SKOOL_URL)}`;
  const office365 = `https://outlook.office.com/calendar/action/compose?subject=${encodeURIComponent(title)}&startdt=${isoDate}T19:00:00&enddt=${isoDate}T20:00:00&body=${encodeURIComponent(details)}&location=${encodeURIComponent(SKOOL_URL)}`;
  const yahoo = `https://calendar.yahoo.com/?v=60&title=${encodeURIComponent(title)}&st=${dateStr}T190000&et=${dateStr}T200000&desc=${encodeURIComponent(details)}&in_loc=${encodeURIComponent(SKOOL_URL)}`;

  const ics = `BEGIN:VCALENDAR\nVERSION:2.0\nBEGIN:VEVENT\nDTSTART;TZID=Europe/London:${dateStr}T190000\nDTEND;TZID=Europe/London:${dateStr}T200000\nSUMMARY:${title}\nDESCRIPTION:${details}\nLOCATION:${SKOOL_URL}\nEND:VEVENT\nEND:VCALENDAR`;
  const apple = `data:text/calendar;charset=utf8,${encodeURIComponent(ics)}`;

  return { google, outlookPersonal, office365, yahoo, apple };
}

function buildPage(name, cal) {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>See you on the call!</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link href="https://fonts.googleapis.com/css2?family=Playfair+Display:wght@900&family=Inter:wght@400;600;700&display=swap" rel="stylesheet">
  <style>
    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      font-family: 'Inter', sans-serif;
      background: linear-gradient(160deg, #2d0a5e, #1a0535, #080010);
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 24px 16px;
    }
    .card {
      background: rgba(255,255,255,0.04);
      border: 1px solid rgba(168,85,247,0.2);
      border-radius: 24px;
      padding: 48px 32px 40px;
      text-align: center;
      width: 100%;
      max-width: 520px;
      backdrop-filter: blur(12px);
    }
    .tick { font-size: 64px; display: block; margin-bottom: 24px; }
    h1 {
      font-family: 'Playfair Display', serif;
      font-weight: 900;
      font-size: clamp(32px, 8vw, 52px);
      color: #f8f4ff;
      line-height: 1.15;
      margin-bottom: 16px;
    }
    .subtitle {
      font-size: clamp(18px, 4.5vw, 22px);
      color: #c4b5fd;
      line-height: 1.6;
      margin-bottom: 40px;
    }
    .cal-title {
      font-size: 13px;
      font-weight: 700;
      color: #a855f7;
      text-transform: uppercase;
      letter-spacing: 0.1em;
      margin-bottom: 16px;
    }
    .cal-buttons { display: flex; flex-direction: column; gap: 12px; }
    .cal-btn {
      display: block;
      padding: 18px 24px;
      border-radius: 50px;
      text-decoration: none;
      font-family: 'Inter', sans-serif;
      font-size: clamp(16px, 4vw, 18px);
      font-weight: 700;
      color: #fff;
      transition: opacity 0.2s;
    }
    .cal-btn:hover { opacity: 0.85; }
    .btn-google { background: #4285F4; box-shadow: 0 4px 20px rgba(66,133,244,0.35); }
    .btn-apple { background: #000; box-shadow: 0 4px 20px rgba(0,0,0,0.4); }
    .btn-outlook-personal { background: #0078D4; box-shadow: 0 4px 20px rgba(0,120,212,0.35); }
    .btn-outlook-work { background: #0F6CBD; box-shadow: 0 4px 20px rgba(15,108,189,0.35); }
    .btn-yahoo { background: #6001D2; box-shadow: 0 4px 20px rgba(96,1,210,0.35); }
  </style>
</head>
<body>
  <div class="card">
    <span class="tick">✅</span>
    <h1>You're on the list!</h1>
    <p class="subtitle">See you on the call. If anything changes before the call and you can't make it, please email me.</p>
    <p class="cal-title">Add call to your calendar</p>
    <div class="cal-buttons">
      <a class="cal-btn btn-google" href="${cal.google}" target="_blank">Google Calendar</a>
      <a class="cal-btn btn-apple" href="${cal.apple}" download="coaching-call.ics">Apple Calendar</a>
      <a class="cal-btn btn-outlook-personal" href="${cal.outlookPersonal}" target="_blank">Outlook (Personal)</a>
      <a class="cal-btn btn-outlook-work" href="${cal.office365}" target="_blank">Outlook (Work / Office 365)</a>
      <a class="cal-btn btn-yahoo" href="${cal.yahoo}" target="_blank">Yahoo Calendar</a>
    </div>
  </div>
</body>
</html>`;
}

function isRsvpOpen() {
  const now = new Date(new Date().toLocaleString('en-GB', { timeZone: 'Europe/London' }));
  const day = now.getDay(); // 0=Sun, 1=Mon, 2=Tue, 3=Wed, 4=Thu, 5=Fri, 6=Sat
  const hour = now.getHours();
  // Open: Tuesday any time, Wednesday before 3pm
  if (day === 2) return true;
  if (day === 3 && hour < 15) return true;
  return false;
}

const closedHtml = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>RSVP Closed</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link href="https://fonts.googleapis.com/css2?family=Playfair+Display:wght@900&family=Inter:wght@400;600;700&display=swap" rel="stylesheet">
  <style>
    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      font-family: 'Inter', sans-serif;
      background: linear-gradient(160deg, #2d0a5e, #1a0535, #080010);
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 24px 16px;
    }
    .card {
      background: rgba(255,255,255,0.04);
      border: 1px solid rgba(168,85,247,0.2);
      border-radius: 24px;
      padding: 48px 32px 40px;
      text-align: center;
      width: 100%;
      max-width: 520px;
      backdrop-filter: blur(12px);
    }
    .icon { font-size: 64px; display: block; margin-bottom: 24px; }
    h1 {
      font-family: 'Playfair Display', serif;
      font-weight: 900;
      font-size: clamp(32px, 8vw, 48px);
      color: #f8f4ff;
      line-height: 1.15;
      margin-bottom: 16px;
    }
    p { font-size: clamp(18px, 4.5vw, 22px); color: #c4b5fd; line-height: 1.6; }
  </style>
</head>
<body>
  <div class="card">
    <span class="icon">🔒</span>
    <h1>RSVP is now closed</h1>
    <p>Registration for this week's call has closed. See you next week.</p>
  </div>
</body>
</html>`;

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);

    if (url.pathname !== '/call') {
      return new Response('Not found', { status: 404 });
    }

    if (!isRsvpOpen()) {
      return new Response(closedHtml, {
        headers: { 'Content-Type': 'text/html;charset=UTF-8' },
      });
    }

    const firstName = url.searchParams.get('first_name') || '';
    const lastName = url.searchParams.get('last_name') || '';
    const id = url.searchParams.get('id') || '';
    const name = `${firstName} ${lastName}`.trim() || 'there';

    // Log to Google Sheet in the background
    const appsScriptUrl = new URL(env.APPS_SCRIPT_URL);
    appsScriptUrl.searchParams.set('first_name', firstName);
    appsScriptUrl.searchParams.set('last_name', lastName);
    appsScriptUrl.searchParams.set('id', id);
    ctx.waitUntil(fetch(appsScriptUrl.toString(), { redirect: 'follow' }));

    const cal = buildCalendarLinks(firstName, lastName);
    const html = buildPage(name, cal);

    return new Response(html, {
      headers: { 'Content-Type': 'text/html;charset=UTF-8' },
    });
  },
};
