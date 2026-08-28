// ============================================================
// HEART ATTRACTOR — The Attraction Formula Intake Tracker
// ============================================================
//
// SHEET SETUP — tabs required:
//   - Responses  (linked natively via Google Forms — no Zapier)
//
// FORM — build with fields in this exact order:
//   1. Name
//   2. Email
//   3. What sort of relationship are you looking to create? Please be as
//      detailed as possible:
//
// This program has NO weekly/final check-ins — one form, one confirmation
// email, done. Do not add WEEKLY_SHEET/FINAL_SHEET logic to this script;
// if check-ins are added later, treat that as a new program rather than
// extending this one (matches how every other program here has its own
// tracker file, per the "what not to duplicate" convention).
//
// SCRIPT SETUP:
//   1. Fill in CONFIG values below (Resend API key, Skool community URL)
//   2. Extensions > Apps Script > paste this file > save
//   3. Run initializeTracking() once to set the starting point
//   4. Run setupTriggers() once — approve permissions when prompted
// ============================================================

const CONFIG = {
  OLLY_EMAIL:        'olly@ollyhenson.com',
  RESEND_API_KEY:    'YOUR_RESEND_API_KEY',
  SHARE_BASE_URL:    'https://share.ollyhenson.com',
  RESPONSES_SHEET:   'Responses',
};

// Column positions in Responses sheet (0-based) — matches the form field
// order specified above. If the form's question order ever changes, update
// these to match — Google Forms appends columns in question order.
const COLS = {
  TIMESTAMP: 0,
  NAME:      1,
  EMAIL:     2,
  ANSWER:    3, // "What sort of relationship are you looking to create?"
};

// ============================================================
// POLLING — runs every 5 minutes
// ============================================================
function checkNewSubmissions() {
  const props = PropertiesService.getScriptProperties();
  const ss = SpreadsheetApp.getActiveSpreadsheet();

  const sheet = ss.getSheetByName(CONFIG.RESPONSES_SHEET);
  if (!sheet) {
    Logger.log('ERROR: "' + CONFIG.RESPONSES_SHEET + '" tab not found.');
    return;
  }

  let lastProcessed = parseInt(props.getProperty('lastResponseRow') || '1');
  const lastRow = sheet.getLastRow();

  if (lastProcessed > lastRow) {
    Logger.log('WARNING: lastResponseRow (' + lastProcessed + ') ahead of sheet (' + lastRow + '). Resetting.');
    lastProcessed = lastRow - 1;
    props.setProperty('lastResponseRow', lastProcessed.toString());
  }

  for (let row = lastProcessed + 1; row <= lastRow; row++) {
    const rowData = sheet.getRange(row, 1, 1, sheet.getLastColumn()).getValues()[0];
    if (!String(rowData[COLS.EMAIL]).trim()) continue;
    sheet.getRange(row, COLS.TIMESTAMP + 1).setNumberFormat('d MMMM yyyy');
    processNewSubmission(rowData);
  }

  if (lastRow > lastProcessed) props.setProperty('lastResponseRow', lastRow.toString());
}

function processNewSubmission(row) {
  const name = row[COLS.NAME];
  const email = row[COLS.EMAIL];
  const answer = row[COLS.ANSWER];

  sendConfirmationEmail(email, name, answer);
  sendNotificationToOlly(name, email, answer);
}

// ============================================================
// EMAIL — confirmation (sent to the client)
// ============================================================
function sendConfirmationEmail(email, name, answer) {
  const subject = `You've started The Attraction Formula Program`;

  const html = wrapHtml(`
    <p>Hi ${firstName(name)},</p>
    <p>You've officially started The Attraction Formula Program.</p>
    <p>Here's the relationship that you're looking to create:</p>
    <blockquote style="margin:16px 0;padding:12px 16px;border-left:3px solid #B84FE8;color:#333333;">${escapeHtml(answer)}</blockquote>
    <p>${link(CONFIG.SHARE_BASE_URL + '?type=started&text=' + encodeURIComponent('I\'ve just started The Attraction Formula Program — excited to get going!'), 'Excited to get you started now, let us know that you\'ve started here →')}</p>
    <p>Olly</p>
  `);

  sendEmail(email, subject, html, 'You\'ve officially started The Attraction Formula.');
}

// ============================================================
// EMAIL — notification (sent to Olly)
// ============================================================
function sendNotificationToOlly(name, email, answer) {
  const subject = `${name} has started The Attraction Formula Program`;
  const startedText = `${firstName(name)} just started The Attraction Formula Program. Give them a warm welcome!`;
  const html = wrapHtml(`
    <p>${name} has just started The Attraction Formula Program.</p>
    <p><strong>Email:</strong> ${email}</p>
    <p><strong>What they're looking to create:</strong></p>
    <blockquote style="margin:16px 0;padding:12px 16px;border-left:3px solid #B84FE8;color:#333333;">${escapeHtml(answer)}</blockquote>
    <p>${link(CONFIG.SHARE_BASE_URL + '?type=win&text=' + encodeURIComponent(startedText), 'Share in the community that ' + firstName(name) + ' has started →')}</p>
  `);
  sendEmail(CONFIG.OLLY_EMAIL, subject, html);
}

// ============================================================
// HELPERS
// ============================================================
function firstName(fullName) {
  return String(fullName).trim().split(' ')[0];
}

function link(url, text) {
  return `<a href="${url}" style="color:#0066cc;">${text}</a>`;
}

function wrapHtml(body) {
  return `<div style="font-family:Arial,sans-serif;font-size:17px;line-height:1.7;color:#000000;">${body}</div>`;
}

function escapeHtml(text) {
  return String(text)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

function sendEmail(to, subject, htmlBody, plainText) {
  const response = UrlFetchApp.fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      'Authorization': 'Bearer ' + CONFIG.RESEND_API_KEY,
      'Content-Type': 'application/json',
    },
    payload: JSON.stringify({
      from: 'The Attraction Formula <olly@ollyhenson.com>',
      to: [to],
      subject: subject,
      html: htmlBody,
      text: plainText || '',
    }),
    muteHttpExceptions: true,
  });
  const code = response.getResponseCode();
  if (code < 200 || code >= 300) {
    Logger.log('EMAIL FAILED (' + code + ') to ' + to + ': ' + response.getContentText());
  } else {
    Logger.log('Email sent OK to ' + to + ' — ' + subject);
  }
}

// ============================================================
// SETUP
// ============================================================
function initializeTracking() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const props = PropertiesService.getScriptProperties();

  const sheet = ss.getSheetByName(CONFIG.RESPONSES_SHEET);
  if (sheet) props.setProperty('lastResponseRow', sheet.getLastRow().toString());

  Logger.log('Tracking initialised. Script will process only new submissions from this point.');
}

function setupTriggers() {
  ScriptApp.getProjectTriggers().forEach(t => ScriptApp.deleteTrigger(t));

  ScriptApp.newTrigger('checkNewSubmissions')
    .timeBased()
    .everyMinutes(5)
    .create();

  Logger.log('Trigger set up: checkNewSubmissions every 5 minutes.');
}

// ============================================================
// MANUAL TEST — resends the confirmation/notification emails for
// whatever row is already in the sheet, without needing a fresh
// form submission or waiting for the 5-minute poll. Run this
// directly from the function dropdown.
// ============================================================
function sendTestConfirmationEmail() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName(CONFIG.RESPONSES_SHEET);
  if (!sheet || sheet.getLastRow() < 2) {
    Logger.log('No response rows found to test with.');
    return;
  }
  const lastRow = sheet.getLastRow();
  const rowData = sheet.getRange(lastRow, 1, 1, sheet.getLastColumn()).getValues()[0];
  Logger.log('Resending for row ' + lastRow + ': ' + rowData[COLS.NAME] + ' / ' + rowData[COLS.EMAIL]);
  processNewSubmission(rowData);
  Logger.log('Done — check the Executions log above for "Email sent OK" / failure details.');
}

// ============================================================
// DEBUGGING
// ============================================================
function debugTracking() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const props = PropertiesService.getScriptProperties();
  const sheet = ss.getSheetByName(CONFIG.RESPONSES_SHEET);
  Logger.log('lastResponseRow property: ' + props.getProperty('lastResponseRow'));
  Logger.log('Actual last row in sheet: ' + (sheet ? sheet.getLastRow() : 'SHEET NOT FOUND'));
}
