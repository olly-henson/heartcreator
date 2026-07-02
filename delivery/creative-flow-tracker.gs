// ============================================================
// OLLY HENSON COACHING — Creative Flow Monthly Tracker
// ============================================================
//
// SHEET SETUP — tabs required:
//   - Baseline Responses      (linked natively via Google Forms)
//   - Monthly Responses       (linked natively via Google Forms)
//   - Manifestation Responses (linked natively via Google Forms)
//   - Sent Log                (auto-managed by script)
//   - Master                  (auto-created by script)
//   - Completed Program       (auto-created by script)
//
// BASELINE FORM — column order (after Timestamp):
//   Full Name, Email,
//   What do you want to create?,
//   How confident do you feel in successfully creating what you want?
//   (No confidence / Some confidence / Very confident)
//
// MONTHLY CHECK-IN FORM — column order (after Timestamp):
//   Full Name, Email,
//   How confident do you feel in successfully creating what you want?
//   (No confidence / Some confidence / Very confident),
//   Were there any synchronicities or opportunities you experienced this month?,
//   Wins this month?,
//   Is there anything you need help with?
//
// MANIFESTATION FORM — column order (after Timestamp):
//   Full Name, Email,
//   What did you create?,
//   How did it happen?
//
// SCRIPT SETUP:
//   1. Fill in CONFIG values below (form URLs, Resend API key)
//   2. Extensions > Apps Script > paste this file > save
//   3. Run initializeTracking() once to set the starting point
//   4. Run setupTriggers() once — approve permissions when prompted
// ============================================================

const CONFIG = {
  OLLY_EMAIL:           'olly@ollyhenson.com',
  RESEND_API_KEY:       'YOUR_RESEND_API_KEY',
  MONTHLY_FORM_URL:       'https://docs.google.com/forms/d/e/1FAIpQLSdLvtuTGYCVLbMySOxOybrAShiAArRW0H7v8exp2HgZuQVymA/viewform?usp=header',
  MANIFESTATION_FORM_URL: 'https://docs.google.com/forms/d/e/1FAIpQLScuo03eLOri7KVmkzLjo_aeeoLPQ0E16xeVIZTzxOQXsJ42pA/viewform?usp=header',
  SHARE_BASE_URL:       'https://share.ollyhenson.com',
  SKOOL_PROFILE_URL:    'https://www.skool.com/@olly-henson',
  BASELINE_SHEET:       'Baseline Responses',
  MONTHLY_SHEET:        'Monthly Responses',
  MANIFESTATION_SHEET:  'Manifestation Responses',
  SENT_LOG_SHEET:       'Sent Log',
  MASTER_SHEET:         'Master',
  COMPLETED_SHEET:      'Completed Program',
};

// Column positions in Baseline Responses sheet (0-based)
const BCOLS = {
  TIMESTAMP:  0,
  NAME:       1,
  EMAIL:      2,
  CATEGORY:   3,  // What are you creating? (Health / Wealth / Relationship / Career / Business success / Something else)
  OUTCOME:    4,  // Please add below what you want to create specifically
  EVIDENCE:   5,  // How will you know that you've created your intention?
  CONFIDENCE: 6,  // Not confident / Kind of confident / Completely confident
};

// Column positions in Monthly Responses sheet (0-based)
const MCOLS = {
  TIMESTAMP:       0,
  NAME:            1,
  EMAIL:           2,
  MEDITATIONS:     3,
  CONFIDENCE:      4,
  SYNCHRONICITIES: 5,
  WINS:            6,
  NEEDS:           7,
};

// Column positions in Manifestation Responses sheet (0-based)
const MANCOLS = {
  TIMESTAMP:    0,
  NAME:         1,
  EMAIL:        2,
  WHAT:         3,
  HOW:          4,
  HELPED:       5,
  RECOMMEND:    6,
  IMPROVEMENTS: 7,
};

// Column positions in Master sheet (0-based)
const MC = {
  NAME:            0,
  EMAIL:           1,
  CATEGORY:        2,
  OUTCOME:         3,
  EVIDENCE:        4,
  START_DATE:      5,
  NEXT_CHECKIN:    6,
  STATUS:          7,
  MONTH:           8,
  MEDITATIONS:     9,
  CONFIDENCE:      10,
  SYNCHRONICITIES: 11,
  WINS:            12,
  NEEDS:           13,
};

// Confidence score map — used to track trend direction
const CONFIDENCE_SCORE = {
  'Not confident':       1,
  'Kind of confident':   2,
  'Completely confident': 3,
};

// ============================================================
// POLLING — runs every 5 minutes
// ============================================================
function checkNewSubmissions() {
  const props = PropertiesService.getScriptProperties();
  const ss = SpreadsheetApp.getActiveSpreadsheet();

  // Baseline Responses
  const baselineSheet = ss.getSheetByName(CONFIG.BASELINE_SHEET);
  if (baselineSheet) {
    let lastProcessed = parseInt(props.getProperty('lastBaselineRow') || '1');
    const lastRow = baselineSheet.getLastRow();
    if (lastProcessed > lastRow) {
      lastProcessed = lastRow - 1;
      props.setProperty('lastBaselineRow', lastProcessed.toString());
    }
    for (let row = lastProcessed + 1; row <= lastRow; row++) {
      const rowData = baselineSheet.getRange(row, 1, 1, baselineSheet.getLastColumn()).getValues()[0];
      if (!String(rowData[BCOLS.EMAIL]).trim()) continue;
      baselineSheet.getRange(row, BCOLS.TIMESTAMP + 1).setNumberFormat('d MMMM yyyy');
      processBaselineRow(rowData);
    }
    if (lastRow > lastProcessed) props.setProperty('lastBaselineRow', lastRow.toString());
  }

  // Monthly Responses
  const monthlySheet = ss.getSheetByName(CONFIG.MONTHLY_SHEET);
  if (monthlySheet) {
    let lastProcessed = parseInt(props.getProperty('lastMonthlyRow') || '1');
    const lastRow = monthlySheet.getLastRow();
    if (lastProcessed > lastRow) {
      lastProcessed = lastRow - 1;
      props.setProperty('lastMonthlyRow', lastProcessed.toString());
    }
    for (let row = lastProcessed + 1; row <= lastRow; row++) {
      const rowData = monthlySheet.getRange(row, 1, 1, monthlySheet.getLastColumn()).getValues()[0];
      if (!String(rowData[MCOLS.EMAIL]).trim()) continue;
      monthlySheet.getRange(row, MCOLS.TIMESTAMP + 1).setNumberFormat('d MMMM yyyy');
      processMonthlyRow(rowData);
    }
    if (lastRow > lastProcessed) props.setProperty('lastMonthlyRow', lastRow.toString());
  }

  // Manifestation Responses
  const manifestationSheet = ss.getSheetByName(CONFIG.MANIFESTATION_SHEET);
  if (manifestationSheet) {
    let lastProcessed = parseInt(props.getProperty('lastManifestationRow') || '1');
    const lastRow = manifestationSheet.getLastRow();
    if (lastProcessed > lastRow) {
      lastProcessed = lastRow - 1;
      props.setProperty('lastManifestationRow', lastProcessed.toString());
    }
    for (let row = lastProcessed + 1; row <= lastRow; row++) {
      const rowData = manifestationSheet.getRange(row, 1, 1, manifestationSheet.getLastColumn()).getValues()[0];
      if (!String(rowData[MANCOLS.EMAIL]).trim()) continue;
      manifestationSheet.getRange(row, MANCOLS.TIMESTAMP + 1).setNumberFormat('d MMMM yyyy');
      processManifestationRow(rowData);
    }
    if (lastRow > lastProcessed) props.setProperty('lastManifestationRow', lastRow.toString());
  }
}

// ============================================================
// ROW PROCESSORS
// ============================================================
function processBaselineRow(row) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const email = String(row[BCOLS.EMAIL]).trim();
  const name = String(row[BCOLS.NAME]).trim();
  const category = String(row[BCOLS.CATEGORY] || '').trim();
  const outcome = String(row[BCOLS.OUTCOME] || '').trim();
  const evidence = String(row[BCOLS.EVIDENCE] || '').trim();
  const confidence = String(row[BCOLS.CONFIDENCE] || '').trim();
  const startDate = parseDate(row[BCOLS.TIMESTAMP]);
  const nextCheckIn = addMonths(startDate, 1);

  const masterSheet = ss.getSheetByName(CONFIG.MASTER_SHEET);
  if (masterSheet && findClientRow(masterSheet, email) !== -1) {
    Logger.log('Client already in Master: ' + email);
    return;
  }

  addToMaster(name, email, category, outcome, evidence, startDate, nextCheckIn, confidence);
  sendBaselineConfirmation(email, name, outcome, evidence);
}

function processMonthlyRow(row) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const email = String(row[MCOLS.EMAIL]).trim();
  const name = String(row[MCOLS.NAME]).trim();
  const meditations = String(row[MCOLS.MEDITATIONS] || '').trim();
  const confidence = String(row[MCOLS.CONFIDENCE] || '').trim();
  const synchronicities = String(row[MCOLS.SYNCHRONICITIES] || '').trim();
  const wins = String(row[MCOLS.WINS] || '').trim();
  const needs = String(row[MCOLS.NEEDS] || '').trim();
  const submitDate = parseDate(row[MCOLS.TIMESTAMP]);

  const masterSheet = ss.getSheetByName(CONFIG.MASTER_SHEET);
  const rowIndex = findClientRow(masterSheet, email);
  if (rowIndex === -1) { Logger.log('No Master entry found for: ' + email); return; }

  const currentMonth = Number(masterSheet.getRange(rowIndex + 1, MC.MONTH + 1).getValue()) || 0;
  const newMonth = currentMonth + 1;
  const nextCheckIn = addMonths(submitDate, 1);

  updateMaster(email, newMonth, confidence, synchronicities, wins, needs, nextCheckIn);
  sendMonthlyReport(email, name, newMonth, meditations, confidence, synchronicities, wins, needs);
}

function processManifestationRow(row) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const email = String(row[MANCOLS.EMAIL]).trim();
  const name = String(row[MANCOLS.NAME]).trim();
  const what = String(row[MANCOLS.WHAT] || '').trim();
  const how = String(row[MANCOLS.HOW] || '').trim();
  const helped = String(row[MANCOLS.HELPED] || '').trim();
  const recommend = String(row[MANCOLS.RECOMMEND] || '').trim();
  const improvements = String(row[MANCOLS.IMPROVEMENTS] || '').trim();

  const masterSheet = ss.getSheetByName(CONFIG.MASTER_SHEET);
  const rowIndex = findClientRow(masterSheet, email);
  if (rowIndex === -1) { Logger.log('No Master entry found for manifestation: ' + email); return; }

  const masterData = masterSheet.getRange(rowIndex + 1, 1, 1, masterSheet.getLastColumn()).getValues()[0];
  const outcome = String(masterData[MC.OUTCOME] || '').trim();
  const monthsInProgram = Number(masterData[MC.MONTH] || 0);

  sendManifestationCelebration(email, name, outcome, what, how, helped, recommend, improvements, monthsInProgram);
  moveToCompleted(email, masterSheet, outcome, what, how, monthsInProgram);
}

// ============================================================
// MONTHLY REMINDER TRIGGER — fires daily at 9am
// ============================================================
function sendMonthlyReminders() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const masterSheet = ss.getSheetByName(CONFIG.MASTER_SHEET);
  if (!masterSheet || masterSheet.getLastRow() <= 1) return;

  const data = masterSheet.getDataRange().getValues();
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  for (let i = 1; i < data.length; i++) {
    const email = String(data[i][MC.EMAIL]).trim();
    const name = String(data[i][MC.NAME]).trim();
    const nextCheckInRaw = data[i][MC.NEXT_CHECKIN];
    const currentMonth = Number(data[i][MC.MONTH]);

    if (!email || !nextCheckInRaw || nextCheckInRaw === 'Complete') continue;

    const nextCheckIn = parseDate(nextCheckInRaw);
    nextCheckIn.setHours(0, 0, 0, 0);

    if (nextCheckIn.getTime() === today.getTime() && !alreadySentReminder(email, currentMonth + 1)) {
      sendMonthlyFormEmail(email, name, currentMonth + 1);
      logReminderSent(email, name, currentMonth + 1);
    }
  }
}

// ============================================================
// MASTER TAB
// ============================================================
function addToMaster(name, email, category, outcome, evidence, startDate, nextCheckIn, confidence) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let masterSheet = ss.getSheetByName(CONFIG.MASTER_SHEET);
  if (!masterSheet) {
    masterSheet = ss.insertSheet(CONFIG.MASTER_SHEET);
    masterSheet.appendRow([
      'Name', 'Email', 'Category', 'Chosen Outcome', 'How They\'ll Know', 'Start Date', 'Next Check-In', 'Status', 'Month',
      'Meditations This Month', 'Confidence', 'Synchronicities This Month', 'Wins This Month', 'Needs Help With'
    ]);
  }

  masterSheet.appendRow([
    name, email, category, outcome, evidence, startDate, nextCheckIn, '', 0,
    '', confidence, '', '', ''
  ]);

  const newRow = masterSheet.getLastRow();
  masterSheet.getRange(newRow, MC.START_DATE + 1).setNumberFormat('d MMMM yyyy');
  masterSheet.getRange(newRow, MC.NEXT_CHECKIN + 1).setNumberFormat('d MMMM yyyy');
}

function updateMaster(email, monthNumber, meditations, confidence, synchronicities, wins, needs, nextCheckIn) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const masterSheet = ss.getSheetByName(CONFIG.MASTER_SHEET);
  if (!masterSheet) return;

  const rowIndex = findClientRow(masterSheet, email);
  if (rowIndex === -1) return;

  const sheetRow = rowIndex + 1;

  masterSheet.getRange(sheetRow, MC.MONTH + 1).setValue(monthNumber);
  masterSheet.getRange(sheetRow, MC.MEDITATIONS + 1).setValue(meditations);
  masterSheet.getRange(sheetRow, MC.CONFIDENCE + 1).setValue(confidence);
  masterSheet.getRange(sheetRow, MC.SYNCHRONICITIES + 1).setValue(synchronicities);
  masterSheet.getRange(sheetRow, MC.WINS + 1).setValue(wins);
  masterSheet.getRange(sheetRow, MC.NEEDS + 1).setValue(needs);

  const nextCheckInCell = masterSheet.getRange(sheetRow, MC.NEXT_CHECKIN + 1);
  nextCheckInCell.setValue(nextCheckIn);
  nextCheckInCell.setNumberFormat('d MMMM yyyy');

  const confScore = CONFIDENCE_SCORE[confidence] || 0;
  const statusColor = confScore === 3 ? '🟢 Completely Confident'
                    : confScore === 2 ? '🟡 Kind of Confident'
                    : '🔴 Not Confident';
  masterSheet.getRange(sheetRow, MC.STATUS + 1).setValue(statusColor);
}

function moveToCompleted(email, masterSheet, outcome, what, how, monthsInProgram) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();

  let completedSheet = ss.getSheetByName(CONFIG.COMPLETED_SHEET);
  if (!completedSheet) completedSheet = ss.insertSheet(CONFIG.COMPLETED_SHEET);

  if (completedSheet.getLastRow() === 0) {
    completedSheet.appendRow([
      'Name', 'Email', 'Chosen Outcome', 'Start Date', 'Completion Date',
      'Months in Program', 'What They Created', 'How It Happened'
    ]);
  }

  const rowIndex = findClientRow(masterSheet, email);
  if (rowIndex === -1) return;

  const masterData = masterSheet.getRange(rowIndex + 1, 1, 1, masterSheet.getLastColumn()).getValues()[0];

  completedSheet.appendRow([
    masterData[MC.NAME], masterData[MC.EMAIL], outcome,
    masterData[MC.START_DATE], new Date(),
    monthsInProgram, what, how
  ]);

  const newRow = completedSheet.getLastRow();
  completedSheet.getRange(newRow, 4).setNumberFormat('d MMMM yyyy');
  completedSheet.getRange(newRow, 5).setNumberFormat('d MMMM yyyy');

  masterSheet.deleteRow(rowIndex + 1);
}

// ============================================================
// HELPERS
// ============================================================
function findClientRow(sheet, email) {
  const data = sheet.getDataRange().getValues();
  for (let i = 1; i < data.length; i++) {
    if (String(data[i][MC.EMAIL]).trim().toLowerCase() === email.toLowerCase()) return i;
  }
  return -1;
}

function parseDate(value) {
  if (value instanceof Date) return value;
  return new Date(value);
}

function addDays(date, days) {
  return new Date(date.getTime() + days * 24 * 60 * 60 * 1000);
}

function addMonths(date, months) {
  const d = new Date(date);
  d.setMonth(d.getMonth() + months);
  return d;
}

function firstName(fullName) {
  return String(fullName).trim().split(' ')[0];
}

function link(url, text) {
  return `<a href="${url}" style="color:#0066cc;">${text}</a>`;
}

function wrapHtml(body) {
  return `<div style="font-family:Arial,sans-serif;font-size:17px;line-height:1.7;color:#000000;">${body}</div>`;
}

function sendEmail(to, subject, htmlBody, plainText) {
  UrlFetchApp.fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      'Authorization': 'Bearer ' + CONFIG.RESEND_API_KEY,
      'Content-Type': 'application/json',
    },
    payload: JSON.stringify({
      from: 'Creative Flow <olly@ollyhenson.com>',
      to: [to],
      subject: subject,
      html: htmlBody,
      text: plainText || '',
    }),
    muteHttpExceptions: true,
  });
}

// ============================================================
// SENT LOG
// ============================================================
function logReminderSent(email, name, monthNumber) {
  const sheet = getSentLogSheet();
  sheet.appendRow([new Date(), email, name, monthNumber, 'reminder']);
}

function getSentLogSheet() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName(CONFIG.SENT_LOG_SHEET);
  if (sheet.getLastRow() === 0) {
    sheet.appendRow(['Date Sent', 'Email', 'Name', 'Month Number', 'Type']);
  }
  return sheet;
}

function alreadySentReminder(email, monthNumber) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName(CONFIG.SENT_LOG_SHEET);
  if (!sheet || sheet.getLastRow() <= 1) return false;
  const data = sheet.getDataRange().getValues();
  for (let i = 1; i < data.length; i++) {
    if (
      String(data[i][1]).trim().toLowerCase() === email.toLowerCase() &&
      data[i][3] === monthNumber &&
      data[i][4] === 'reminder'
    ) return true;
  }
  return false;
}

// ============================================================
// EMAIL — baseline confirmation
// ============================================================
function sendBaselineConfirmation(email, name, outcome, evidence) {
  const subject = `Creative Flow starts now`;

  const html = wrapHtml(`
    <p>Hi ${firstName(name)},</p>
    <p>And so it begins…</p>
    <p>Your intentions have been set and you've officially started Creative Flow.</p>
    <p>Your chosen outcome: <strong>${outcome}</strong></p>
    <p>You'll know you've created it when: <strong>${evidence}</strong></p>
    <p>Your first monthly check-in will arrive in 30 days.</p>
    <p>Between now and then, do your best to complete the daily Creative Flow practice.</p>
    <p>So that's completing the Creative Flow Meditation 1x per day and anchoring your intention throughout your day.</p>
    <p>If you need any help at any point, ask a question ${link('https://www.skool.com/the-healing-code-8609', 'here')} in the community feed.</p>
    <p>${link(CONFIG.SHARE_BASE_URL + '?type=started&text=' + encodeURIComponent('I\'ve just started Creative Flow — excited to see what I create!'), 'Let us know that you\'ve started here →')}</p>
    <p>To creating and living your life with confidence and ease.<br>Olly</p>
  `);

  sendEmail(email, subject, html, 'You\'ve officially started Creative Flow.');
  sendBaselineNotificationToOlly(email, name, outcome, evidence);
}

function sendBaselineNotificationToOlly(email, name, outcome, evidence) {
  const subject = `${name} has started Creative Flow`;
  const html = wrapHtml(`
    <p>${name} has just started Creative Flow.</p>
    <p><strong>Email:</strong> ${email}</p>
    <p><strong>Chosen outcome:</strong> ${outcome}</p>
    <p><strong>How they'll know it's happened:</strong> ${evidence}</p>
  `);
  sendEmail(CONFIG.OLLY_EMAIL, subject, html);
}

// ============================================================
// EMAIL — monthly check-in reminder
// ============================================================
function sendMonthlyFormEmail(email, name, monthNumber) {
  const subject = `Your month ${monthNumber} check-in — Creative Flow`;

  const html = wrapHtml(`
    <p>Hi ${firstName(name)},</p>
    <p>Here's your Month ${monthNumber} check-in.</p>
    <p>Please add this month's update via the link below:</p>
    <p>${link(CONFIG.MONTHLY_FORM_URL, 'Complete Your Month ' + monthNumber + ' Check-In')}</p>
    <p>Once you've done that, you'll receive your monthly progress report.</p>
    <p>To creating and living your life with confidence and ease.<br>Olly</p>
  `);

  sendEmail(email, subject, html, 'Your Month ' + monthNumber + ' check-in is ready. Complete it here: ' + CONFIG.MONTHLY_FORM_URL);
}

// ============================================================
// EMAIL — monthly progress report
// ============================================================
function sendMonthlyReport(email, name, monthNumber, meditations, confidence, synchronicities, wins, needs) {
  const shareText = [wins, synchronicities].filter(Boolean).join('\n\n');
  const shareUrl = shareText ? CONFIG.SHARE_BASE_URL + '?type=win&text=' + encodeURIComponent(shareText) : '';
  const ollyShareText = shareText ? `Update from ${firstName(name)} this month:\n\n${shareText}` : '';
  const ollyShareUrl = ollyShareText ? CONFIG.SHARE_BASE_URL + '?type=win&text=' + encodeURIComponent(ollyShareText) : '';
  const helpUrl = needs ? CONFIG.SHARE_BASE_URL + '?type=help&text=' + encodeURIComponent(needs) : '';
  const needsLineClient = needs ? `<p><strong>What you need help with:</strong> ${needs}<br>${link(helpUrl, 'Ask for help in the community →')}</p>` : '';
  const coachUrl = needs ? CONFIG.SHARE_BASE_URL + '?type=coach&text=' + encodeURIComponent(needs) : '';
  const needsLineOlly = needs ? `<p><strong>Client needs help with:</strong> ${needs}<br>${link(coachUrl, 'Help client with this →')}</p>` : '';

  const clientSubject = `Your month ${monthNumber} progress report — Creative Flow`;
  const clientHtml = wrapHtml(`
    <p>Hi ${firstName(name)},</p>
    <p>Here is your Month ${monthNumber} progress report.</p>
    <p><strong>Meditations this month:</strong> ${meditations}</p>
    <p><strong>Confidence in creating your outcome:</strong> ${confidence}</p>
    ${synchronicities ? `<p><strong>Synchronicities & opportunities this month:</strong><br>${synchronicities}</p>` : ''}
    ${wins ? `<p><strong>Wins this month:</strong><br>${wins}</p>` : ''}
    ${shareUrl ? `<p>${link(shareUrl, 'Share your wins and synchronicities in the community →')}</p>` : ''}
    ${needsLineClient}
    <p>To creating and living your life with confidence and ease.<br>Olly</p>
  `);

  const ollySubject = `[Monthly report] ${name} — Month ${monthNumber}`;
  const ollyHtml = wrapHtml(`
    <p><strong>Program:</strong> Creative Flow<br><strong>Client:</strong> ${name} (${email})<br><strong>Month:</strong> ${monthNumber}</p>
    <p><strong>Meditations this month:</strong> ${meditations}</p>
    <p><strong>Confidence:</strong> ${confidence}</p>
    ${(synchronicities || wins) ? `<p><strong>Synchronicities & wins:</strong><br>${[synchronicities, wins].filter(Boolean).join('<br><br>')}</p>` : ''}
    ${ollyShareUrl ? `<p>${link(ollyShareUrl, 'Share this update in the community →')}</p>` : ''}
    ${needsLineOlly}
    ${confidence === 'Not confident' ? '<p style="color:#c62828;"><strong>⚠️ FLAGGED: Client has no confidence this month — may be worth a personal check-in.</strong></p>' : ''}
  `);

  sendEmail(email, clientSubject, clientHtml);
  sendEmail(CONFIG.OLLY_EMAIL, ollySubject, ollyHtml);
}

// ============================================================
// EMAIL — manifestation celebration
// ============================================================
function sendManifestationCelebration(email, name, outcome, what, how, helped, recommend, improvements, monthsInProgram) {
  const shareText = `I set out to create: ${outcome}\n\nWhat happened: ${what}\n\nHow it happened: ${how}`;
  const shareUrl = CONFIG.SHARE_BASE_URL + '?type=final&text=' + encodeURIComponent(shareText);
  const ollyShareUrl = CONFIG.SHARE_BASE_URL + '?type=results&text=' + encodeURIComponent(`${firstName(name)} just manifested their outcome after ${monthsInProgram} month${monthsInProgram !== 1 ? 's' : ''} in Creative Flow:\n\n${shareText}`);

  const clientSubject = `🎉 You did it — Creative Flow`;
  const clientHtml = wrapHtml(`
    <p>Hi ${firstName(name)},</p>
    <p>You did it.</p>
    <p>You set out to create: <strong>${outcome}</strong></p>
    <p>And you made it happen in ${monthsInProgram} month${monthsInProgram !== 1 ? 's' : ''}.</p>
    <p><strong>What you created:</strong><br>${what}</p>
    <p><strong>How it happened:</strong><br>${how}</p>
    <p><strong>How the program helped:</strong><br>${helped}</p>
    <p>This is what Creative Flow is all about. You stayed in the energy of what you wanted, and the universe delivered.</p>
    <p>Well done ${firstName(name)}!</p>
    <p>${link(shareUrl, 'Share your result in the community and inspire others →')}</p>
    <p>To creating and living your life with confidence and ease.<br>Olly</p>
  `);

  const ollySubject = `🎉 ${name} just manifested their outcome`;
  const ollyHtml = wrapHtml(`
    <p><strong>${name}</strong> (${email}) has just submitted a manifestation report after <strong>${monthsInProgram} month${monthsInProgram !== 1 ? 's' : ''}</strong> in Creative Flow.</p>
    <p><strong>Chosen outcome:</strong> ${outcome}</p>
    <p><strong>What they created:</strong><br>${what}</p>
    <p><strong>How it happened:</strong><br>${how}</p>
    <p><strong>How the program helped:</strong><br>${helped}</p>
    <p><strong>Would they recommend?</strong><br>${recommend || '—'}</p>
    <p><strong>Improvements suggested:</strong><br>${improvements || '—'}</p>
    <p>${link(ollyShareUrl, 'Share this result in the community →')}</p>
  `);

  sendEmail(email, clientSubject, clientHtml);
  sendEmail(CONFIG.OLLY_EMAIL, ollySubject, ollyHtml);
}

// ============================================================
// SETUP — run once
// ============================================================
function initializeTracking() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const props = PropertiesService.getScriptProperties();

  const baselineSheet = ss.getSheetByName(CONFIG.BASELINE_SHEET);
  if (baselineSheet) props.setProperty('lastBaselineRow', baselineSheet.getLastRow().toString());

  const monthlySheet = ss.getSheetByName(CONFIG.MONTHLY_SHEET);
  if (monthlySheet) props.setProperty('lastMonthlyRow', monthlySheet.getLastRow().toString());

  const manifestationSheet = ss.getSheetByName(CONFIG.MANIFESTATION_SHEET);
  if (manifestationSheet) props.setProperty('lastManifestationRow', manifestationSheet.getLastRow().toString());

  Logger.log('Tracking initialised. Script will process only new submissions from this point.');
}

function setupTriggers() {
  ScriptApp.getProjectTriggers().forEach(t => ScriptApp.deleteTrigger(t));

  ScriptApp.newTrigger('sendMonthlyReminders')
    .timeBased()
    .everyDays(1)
    .atHour(9)
    .create();

  ScriptApp.newTrigger('checkNewSubmissions')
    .timeBased()
    .everyMinutes(5)
    .create();

  Logger.log('Triggers set up. System is live.');
}

// ============================================================
// DEBUG
// ============================================================
function debugTracking() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const props = PropertiesService.getScriptProperties();
  const baselineSheet = ss.getSheetByName(CONFIG.BASELINE_SHEET);
  const monthlySheet = ss.getSheetByName(CONFIG.MONTHLY_SHEET);
  const manifestationSheet = ss.getSheetByName(CONFIG.MANIFESTATION_SHEET);

  Logger.log('lastBaselineRow (counter): ' + props.getProperty('lastBaselineRow'));
  Logger.log('Actual baseline sheet rows: ' + (baselineSheet ? baselineSheet.getLastRow() : 'NOT FOUND'));
  Logger.log('lastMonthlyRow (counter): ' + props.getProperty('lastMonthlyRow'));
  Logger.log('Actual monthly sheet rows: ' + (monthlySheet ? monthlySheet.getLastRow() : 'NOT FOUND'));
  Logger.log('lastManifestationRow (counter): ' + props.getProperty('lastManifestationRow'));
  Logger.log('Actual manifestation sheet rows: ' + (manifestationSheet ? manifestationSheet.getLastRow() : 'NOT FOUND'));
}

// ============================================================
// TEST FUNCTIONS
// ============================================================
function testBaselineConfirmation() {
  sendBaselineConfirmation('olly@ollyhenson.com', 'Olly Henson', 'Build a thriving coaching business that creates true freedom', 'I will have consistent £10k months and a full client roster.');
}

function testMonthlyReminder() {
  sendMonthlyFormEmail('olly@ollyhenson.com', 'Olly Henson', 1);
}

function testMonthlyReport() {
  sendMonthlyReport(
    'olly@ollyhenson.com',
    'Olly Henson',
    2,
    '18',
    'Very confident',
    'A speaking opportunity appeared out of nowhere — exactly what I had been visualising.',
    'Signed my first premium client this month.',
    'How to stay in the feeling when things feel slow.'
  );
}

function testManifestationCelebration() {
  sendManifestationCelebration(
    'olly@ollyhenson.com',
    'Olly Henson',
    'Build a thriving coaching business that creates true freedom',
    'I hit my first £10k month and booked out my program.',
    'I stayed consistent with the daily practice and opportunities just kept appearing. It felt effortless by the end.',
    'It helped me stay in the feeling of success even when things felt slow. That consistency made all the difference.',
    'Without question — this has changed how I approach everything.',
    'Nothing — it was exactly what I needed.',
    4
  );
}
