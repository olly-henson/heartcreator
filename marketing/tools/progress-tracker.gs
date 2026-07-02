// ============================================================
// OLLY HENSON COACHING — Monthly Progress Tracker
// ============================================================
//
// SETUP (do this once):
//
// 1. Create a new Google Sheet called "Progress Tracker"
// 2. Create Google Form 1 — "Baseline Results"
//      Settings > Collect email addresses (so email auto-captures)
//      Questions in this exact order:
//        - First Name (Short answer)
//        - Pain (Linear scale 1–10, 1 = none, 10 = severe)
//        - Energy (Linear scale 1–10, 1 = none, 10 = full)
//        - Anxiety (Linear scale 1–10, 1 = none, 10 = severe)
//        - Calmness (Linear scale 1–10, 1 = none, 10 = very calm)
//        - Sleep (Linear scale 1–10, 1 = terrible, 10 = excellent)
//        - Depressive Thoughts (Linear scale 1–10, 1 = none, 10 = severe)
//        - Focus (Linear scale 1–10, 1 = none, 10 = sharp)
//        - Mood (Linear scale 1–10, 1 = very low, 10 = excellent)
//        - Stress Resilience (Linear scale 1–10, 1 = none, 10 = very high)
//      Link responses to the Progress Tracker sheet → rename tab to "Baseline"
//
// 3. Create Google Form 2 — "Monthly Check-in"
//      Identical questions and settings to Form 1
//      Link responses to the SAME Progress Tracker sheet → rename tab to "Monthly"
//
// 4. Create a third tab in the sheet called "Sent Log"
//
// 5. Open Apps Script: Extensions > Apps Script
//      Paste this entire file and save
//
// 6. Fill in the CONFIG values below
//
// 7. Run setupTriggers() once from the editor (Run > setupTriggers)
//      Approve permissions when prompted
//
// That's it. The system runs automatically from here.
// ============================================================

const CONFIG = {
  OLLY_EMAIL:        'olly@ollyhenson.com',
  MONTHLY_FORM_URL:  'PASTE_YOUR_MONTHLY_FORM_URL_HERE',
  SKOOL_PROFILE_URL: 'https://www.skool.com/@olly-henson',
  BASELINE_SHEET:    'Baseline',
  MONTHLY_SHEET:     'Monthly',
  SENT_LOG_SHEET:    'Sent Log',
};

// Column positions (0-based) — matches your existing sheet structure exactly
// Col 0: Date Filled In, Col 1: Email, Col 2: Full Name, Col 3–11: metrics, Col 12: Ideal Outcome
const COLS = {
  TIMESTAMP:     0,
  EMAIL:         1,
  NAME:          2,
  PAIN:          3,
  ENERGY:        4,
  ANXIETY:       5,
  CALMNESS:      6,
  SLEEP:         7,
  DEPRESSIVE:    8,
  FOCUS:         9,
  MOOD:          10,
  RESILIENCE:    11,
  IDEAL_OUTCOME: 12,
};

// Direction: 'down' = lower score is better, 'up' = higher score is better
const METRICS = [
  { key: 'PAIN',       label: 'Pain',               direction: 'down' },
  { key: 'ENERGY',     label: 'Energy',              direction: 'up'   },
  { key: 'ANXIETY',    label: 'Anxiety',             direction: 'down' },
  { key: 'CALMNESS',   label: 'Calmness',            direction: 'up'   },
  { key: 'SLEEP',      label: 'Sleep',               direction: 'up'   },
  { key: 'DEPRESSIVE', label: 'Depressive Thoughts', direction: 'down' },
  { key: 'FOCUS',      label: 'Focus',               direction: 'up'   },
  { key: 'MOOD',       label: 'Mood',                direction: 'up'   },
  { key: 'RESILIENCE', label: 'Stress Resilience',   direction: 'up'   },
];

// ============================================================
// DAILY TRIGGER
// Runs every morning. Sends monthly reminders and follow-ups.
// ============================================================
function sendMonthlyReminders() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const baselineSheet = ss.getSheetByName(CONFIG.BASELINE_SHEET);
  if (!baselineSheet) return;

  const data = baselineSheet.getDataRange().getValues();
  const today = new Date();

  // Send monthly check-in reminders
  for (let i = 1; i < data.length; i++) {
    const row = data[i];
    const joinDate = parseDate(row[COLS.TIMESTAMP]);
    const email = String(row[COLS.EMAIL]).trim();
    const name = String(row[COLS.NAME]).trim();

    if (!email || !joinDate) continue;

    const monthsElapsed = monthsBetween(joinDate, today);
    if (monthsElapsed >= 1 && isAnniversaryToday(joinDate, today)) {
      sendMonthlyFormEmail(email, name, monthsElapsed);
      logReminderSent(email, name, monthsElapsed);
    }
  }

  // Send follow-ups to anyone who hasn't submitted 7 days after their reminder
  checkFollowUps();
}

// ============================================================
// FOLLOW-UP — checks Sent Log for non-responders after 7 days
// ============================================================
function checkFollowUps() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sentLogSheet = ss.getSheetByName(CONFIG.SENT_LOG_SHEET);
  const monthlySheet = ss.getSheetByName(CONFIG.MONTHLY_SHEET);
  if (!sentLogSheet || !monthlySheet) return;

  const logData = sentLogSheet.getDataRange().getValues();
  const today = new Date();

  for (let i = 1; i < logData.length; i++) {
    const row = logData[i];
    const sentDate = parseDate(row[0]);
    const email = String(row[1]).trim();
    const name = String(row[2]).trim();
    const monthNumber = row[3];
    const followedUp = row[4];

    if (followedUp) continue;

    const daysSinceSent = Math.floor((today - sentDate) / (1000 * 60 * 60 * 24));
    if (daysSinceSent < 7) continue;

    // Check if they've submitted their monthly form since the reminder was sent
    if (!hasSubmittedMonthly(monthlySheet, email, sentDate)) {
      sendFollowUpEmail(email, name, monthNumber);
      sentLogSheet.getRange(i + 1, 5).setValue(true); // mark as followed up
    }
  }
}

// ============================================================
// SENT LOG — records when reminders are sent
// ============================================================
function logReminderSent(email, name, monthNumber) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sentLogSheet = ss.getSheetByName(CONFIG.SENT_LOG_SHEET);
  if (!sentLogSheet) return;

  // Add header row if sheet is empty
  if (sentLogSheet.getLastRow() === 0) {
    sentLogSheet.appendRow(['Date Sent', 'Email', 'Name', 'Month Number', 'Followed Up']);
  }

  sentLogSheet.appendRow([new Date(), email, name, monthNumber, false]);
}

function hasSubmittedMonthly(monthlySheet, email, afterDate) {
  const data = monthlySheet.getDataRange().getValues();
  for (let i = 1; i < data.length; i++) {
    const rowEmail = String(data[i][COLS.EMAIL]).trim().toLowerCase();
    const rowDate = parseDate(data[i][COLS.TIMESTAMP]);
    if (rowEmail === email.toLowerCase() && rowDate > afterDate) {
      return true;
    }
  }
  return false;
}

// ============================================================
// FORM SUBMIT TRIGGER
// Fires when any form linked to this sheet is submitted.
// Ignores baseline submissions — only acts on monthly ones.
// ============================================================
function onAnyFormSubmit(e) {
  const sheetName = e.range.getSheet().getName();
  if (sheetName !== CONFIG.MONTHLY_SHEET) return;

  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const baselineSheet = ss.getSheetByName(CONFIG.BASELINE_SHEET);
  const monthlySheet = ss.getSheetByName(CONFIG.MONTHLY_SHEET);

  const lastRow = monthlySheet.getLastRow();
  const row = monthlySheet.getRange(lastRow, 1, 1, monthlySheet.getLastColumn()).getValues()[0];

  const email = String(row[COLS.EMAIL]).trim();
  const name = String(row[COLS.NAME]).trim();
  const submitDate = new Date(row[COLS.TIMESTAMP]);

  const baseline = getClientBaseline(baselineSheet, email);
  if (!baseline) {
    Logger.log('No baseline found for: ' + email);
    return;
  }

  const joinDate = parseDate(baseline[COLS.TIMESTAMP]);
  const monthNumber = monthsBetween(joinDate, submitDate);

  sendProgressReport(
    email,
    name,
    monthNumber,
    extractScores(baseline),
    extractScores(row),
    extractIdealOutcome(baseline)
  );
}

// ============================================================
// HELPERS
// ============================================================

function parseDate(value) {
  if (value instanceof Date) return value;
  return new Date(value);
}

function monthsBetween(start, end) {
  return (end.getFullYear() - start.getFullYear()) * 12
       + (end.getMonth() - start.getMonth());
}

function isAnniversaryToday(joinDate, today) {
  const joinDay = joinDate.getDate();
  const todayDay = today.getDate();
  const lastDayOfThisMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0).getDate();
  return todayDay === joinDay || (joinDay > lastDayOfThisMonth && todayDay === lastDayOfThisMonth);
}

function getClientBaseline(sheet, email) {
  const data = sheet.getDataRange().getValues();
  for (let i = 1; i < data.length; i++) {
    if (String(data[i][COLS.EMAIL]).trim().toLowerCase() === email.toLowerCase()) {
      return data[i];
    }
  }
  return null;
}

function extractScores(row) {
  const scores = {};
  METRICS.forEach(m => { scores[m.key] = Number(row[COLS[m.key]]); });
  return scores;
}

function extractIdealOutcome(row) {
  return String(row[COLS.IDEAL_OUTCOME] || '').trim();
}

function firstName(fullName) {
  return fullName.trim().split(' ')[0];
}

function link(url, text) {
  return `<a href="${url}" style="color:#000000;">${text}</a>`;
}

function wrapHtml(body) {
  return `<div style="font-family:Arial,sans-serif;font-size:15px;line-height:1.6;color:#000000;">${body}</div>`;
}

// ============================================================
// EMAIL — monthly reminder
// ============================================================
function sendMonthlyFormEmail(email, name, monthNumber) {
  const subject = `Your Month ${monthNumber} check-in — Olly Henson Coaching`;

  const html = wrapHtml(`
    <p>Hi ${firstName(name)},</p>
    <p>Hope you're all good — here's the link to this month's check-in. Looking forward to seeing your progress.</p>
    <p>${link(CONFIG.MONTHLY_FORM_URL, "This Month's Check-In Form")}</p>
    <p>To your health, happiness and success.<br>Olly</p>
  `);

  MailApp.sendEmail({ to: email, subject: subject, htmlBody: html });
}

// ============================================================
// EMAIL — 7-day follow-up
// ============================================================
function sendFollowUpEmail(email, name, monthNumber) {
  const subject = `Checking in — Olly Henson Coaching`;

  const html = wrapHtml(`
    <p>Hi ${firstName(name)},</p>
    <p>Just checking in — I noticed you haven't filled in your monthly check-in yet.</p>
    <p>Everything ok?</p>
    <p>If you've just forgotten, here's the link: ${link(CONFIG.MONTHLY_FORM_URL, "This Month's Check-In Form")}</p>
    <p>If you want to discuss anything in particular, just send me a DM — hit the <strong>Chat</strong> button on ${link(CONFIG.SKOOL_PROFILE_URL, "my profile here")}.</p>
    <p>To your health, happiness and success.<br>Olly</p>
  `);

  MailApp.sendEmail({ to: email, subject: subject, htmlBody: html });
}

// ============================================================
// EMAIL — progress report (to client and Olly)
// ============================================================
function sendProgressReport(email, name, monthNumber, baseline, current, idealOutcome) {
  let reportRows = '';
  let improved = 0;
  let declined = 0;

  METRICS.forEach(m => {
    const base = baseline[m.key];
    const curr = current[m.key];
    const diff = curr - base;
    const isImproved = m.direction === 'up' ? diff > 0 : diff < 0;
    const isDeclined = m.direction === 'up' ? diff < 0 : diff > 0;

    if (isImproved) improved++;
    if (isDeclined) declined++;

    const emoji = isImproved ? '✅' : '➡️';
    const diffStr = diff > 0 ? `+${diff}` : `${diff}`;

    reportRows += `
      <tr>
        <td style="padding:6px 12px;border-bottom:1px solid #eeeeee;">${m.label}</td>
        <td style="padding:6px 12px;border-bottom:1px solid #eeeeee;text-align:center;">${base}/10</td>
        <td style="padding:6px 12px;border-bottom:1px solid #eeeeee;text-align:center;">${curr}/10</td>
        <td style="padding:6px 12px;border-bottom:1px solid #eeeeee;text-align:center;">${diffStr}</td>
        <td style="padding:6px 12px;border-bottom:1px solid #eeeeee;text-align:center;">${emoji}</td>
      </tr>`;
  });

  const goalLine = idealOutcome
    ? `<p><em>Your goal when you started: "${idealOutcome}"</em></p>`
    : '';

  const message = declined === 0 && improved >= 6
    ? 'This is real progress. The work you are putting in is having a genuine effect on your body and your life.'
    : declined === 0 && improved >= 3
    ? 'Progress is happening. Keep going — you\'re doing really well.'
    : `Here are your results for this month. If you would like to discuss them with me, just reach out — you can send me a DM by hitting the Chat button <a href="${CONFIG.SKOOL_PROFILE_URL}" style="color:#000000;">on my profile here</a>.`;

  // Client email
  const clientSubject = `Your Month ${monthNumber} progress report — Olly Henson Coaching`;
  const clientHtml = wrapHtml(`
    <p>Hi ${firstName(name)},</p>
    <p>Here is your Month ${monthNumber} progress report.</p>
    ${goalLine}
    <table style="border-collapse:collapse;width:100%;font-size:14px;">
      <thead>
        <tr style="background:#f5f5f5;">
          <th style="padding:8px 12px;text-align:left;">Metric</th>
          <th style="padding:8px 12px;text-align:center;">Baseline</th>
          <th style="padding:8px 12px;text-align:center;">Now</th>
          <th style="padding:8px 12px;text-align:center;">Change</th>
          <th style="padding:8px 12px;text-align:center;">Status</th>
        </tr>
      </thead>
      <tbody>${reportRows}</tbody>
    </table>
    <p><strong>${improved} out of 9 areas have improved since you started.</strong></p>
    <p>${message}</p>
    <p>If anything in this report has raised a question, drop me a message in the community and we will look at it together.</p>
    <p>To your health, happiness and success.<br>Olly</p>
  `);

  // Olly's copy
  const ollySubject = `[Progress Report] ${name} — Month ${monthNumber}`;
  const ollyHtml = wrapHtml(`
    <p><strong>Client:</strong> ${name} (${email})<br><strong>Month:</strong> ${monthNumber}</p>
    <table style="border-collapse:collapse;width:100%;font-size:14px;">
      <thead>
        <tr style="background:#f5f5f5;">
          <th style="padding:8px 12px;text-align:left;">Metric</th>
          <th style="padding:8px 12px;text-align:center;">Baseline</th>
          <th style="padding:8px 12px;text-align:center;">Now</th>
          <th style="padding:8px 12px;text-align:center;">Change</th>
          <th style="padding:8px 12px;text-align:center;">Status</th>
        </tr>
      </thead>
      <tbody>${reportRows}</tbody>
    </table>
    <p>Improved: <strong>${improved}/9</strong> &nbsp;|&nbsp; Declined: <strong>${declined}/9</strong></p>
    ${declined >= 3 ? '<p style="color:#c62828;"><strong>⚠️ FLAGGED: 3 or more metrics declined — may be worth a personal check-in.</strong></p>' : ''}
  `);

  MailApp.sendEmail({ to: email, subject: clientSubject, htmlBody: clientHtml });
  MailApp.sendEmail({ to: CONFIG.OLLY_EMAIL, subject: ollySubject, htmlBody: ollyHtml });
}

// ============================================================
// RUN ONCE — sets up all triggers
// ============================================================
function setupTriggers() {
  ScriptApp.getProjectTriggers().forEach(t => ScriptApp.deleteTrigger(t));

  const ss = SpreadsheetApp.getActiveSpreadsheet();

  ScriptApp.newTrigger('sendMonthlyReminders')
    .timeBased()
    .everyDays(1)
    .atHour(9)
    .create();

  ScriptApp.newTrigger('onAnyFormSubmit')
    .forSpreadsheet(ss)
    .onFormSubmit()
    .create();

  Logger.log('Triggers set up. System is live.');
}

// ============================================================
// TEST FUNCTIONS
// ============================================================
function testReport() {
  sendProgressReport(
    'olly@ollyhenson.com',
    'Olly Henson',
    1,
    { PAIN:8, ENERGY:2, ANXIETY:7, CALMNESS:3, SLEEP:4, DEPRESSIVE:8, FOCUS:5, MOOD:4, RESILIENCE:0 },
    { PAIN:5, ENERGY:5, ANXIETY:4, CALMNESS:6, SLEEP:6, DEPRESSIVE:5, FOCUS:7, MOOD:7, RESILIENCE:4 },
    'To get back to fishing every weekend'
  );
}

function testReminder() {
  sendMonthlyFormEmail('olly@ollyhenson.com', 'Olly Henson', 1);
}

function testFollowUp() {
  sendFollowUpEmail('olly@ollyhenson.com', 'Olly Henson', 1);
}
