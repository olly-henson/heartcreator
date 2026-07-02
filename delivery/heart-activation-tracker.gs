// ============================================================
// OLLY HENSON COACHING — Heart Activation 6-Week Tracker
// ============================================================
//
// SHEET SETUP — tabs required:
//   - Baseline Responses (linked natively via Google Forms)
//   - Weekly Responses   (linked natively via Google Forms)
//   - Final Responses    (linked natively via Google Forms)
//   - Sent Log           (auto-managed by script)
//   - Master             (auto-created by script)
//   - Completed Program  (auto-created by script)
//
// BASELINE FORM — column order (after Timestamp):
//   Full Name, Email,
//   Pain, Energy, Anxiety, Calmness, Sleep,
//   Depressive Thoughts, Focus, Mood, Stress Resilience
//
// WEEKLY CHECK-IN FORM — column order (after Timestamp):
//   Full Name, Email,
//   Pain, Energy, Anxiety, Calmness, Sleep,
//   Depressive Thoughts, Focus, Mood, Stress Resilience,
//   How many meditations did you do this week?,
//   Wins this week,
//   Anything you need help with?
//
// FINAL CHECK-IN FORM — column order (after Timestamp):
//   Full Name, Email,
//   Pain, Energy, Anxiety, Calmness, Sleep,
//   Depressive Thoughts, Focus, Mood, Stress Resilience,
//   How many meditations did you do this week?,
//   How do you feel now compared to when you started?,
//   What's your biggest positive to take from completing this program?,
//   Would you recommend this program to others?,
//   Is there anything you think could make this program better?
//
// SCRIPT SETUP:
//   1. Fill in CONFIG values below (form URLs, Resend API key)
//   2. Extensions > Apps Script > paste this file > save
//   3. Run initializeTracking() once to set the starting point
//   4. Run setupTriggers() once — approve permissions when prompted
// ============================================================

const CONFIG = {
  OLLY_EMAIL:        'olly@ollyhenson.com',
  RESEND_API_KEY:    'YOUR_RESEND_API_KEY',
  WEEKLY_FORM_URL:   'https://docs.google.com/forms/d/e/1FAIpQLSefoMJNUpXUYQBhdSe7eFec724Z3VT6r8PVWVRj-pxLgqdJGw/viewform?usp=header',
  FINAL_FORM_URL:    'https://docs.google.com/forms/d/e/1FAIpQLSdblP9-FQdynyi6yNt1mWO8XblKZNMmjK2ARH-IggCTd-G06g/viewform?usp=header',
  SHARE_BASE_URL:    'https://share.ollyhenson.com',
  SKOOL_PROFILE_URL: 'https://www.skool.com/@olly-henson',
  CLASSROOM_URL:     'https://www.skool.com/the-healing-code-8609/classroom/568dd6c7?md=89c28755c54349259564a5c75425185e',
  BASELINE_SHEET:    'Baseline Responses',
  WEEKLY_SHEET:      'Weekly Responses',
  FINAL_SHEET:       'Final Responses',
  SENT_LOG_SHEET:    'Sent Log',
  MASTER_SHEET:      'Master',
  COMPLETED_SHEET:   'Completed Program',
  TOTAL_WEEKS:       6,
};

// Column positions in Baseline and Weekly Responses sheets (0-based)
const COLS = {
  TIMESTAMP:   0,
  NAME:        1,
  EMAIL:       2,
  PAIN:        3,
  ENERGY:      4,
  ANXIETY:     5,
  CALMNESS:    6,
  SLEEP:       7,
  DEPRESSIVE:  8,
  FOCUS:       9,
  MOOD:        10,
  RESILIENCE:  11,
  MEDITATIONS: 12,
  WINS:        13,
  NEEDS:       14,
};

// Column positions in Final Responses sheet (0-based)
const FINAL_COLS = {
  TIMESTAMP:    0,
  NAME:         1,
  EMAIL:        2,
  PAIN:         3,
  ENERGY:       4,
  ANXIETY:      5,
  CALMNESS:     6,
  SLEEP:        7,
  DEPRESSIVE:   8,
  FOCUS:        9,
  MOOD:         10,
  RESILIENCE:   11,
  MEDITATIONS:  12,
  HOW_FEEL:     13,
  BIGGEST_POS:  14,
  RECOMMEND:    15,
  IMPROVEMENTS: 16,
};

// Column positions in Master sheet (0-based)
const MC = {
  NAME:         0,
  EMAIL:        1,
  START_DATE:   2,
  END_DATE:     3,
  NEXT_CHECKIN: 4,
  STATUS:       5,
  CURRENT_WEEK: 6,
  PAIN:         7,
  ENERGY:       8,
  ANXIETY:      9,
  CALMNESS:     10,
  SLEEP:        11,
  DEPRESSIVE:   12,
  FOCUS:        13,
  MOOD:         14,
  RESILIENCE:   15,
  MEDITATIONS:  16,
  WINS:         17,
  NEEDS:        18,
};

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
      Logger.log('WARNING: lastBaselineRow (' + lastProcessed + ') ahead of sheet (' + lastRow + '). Resetting.');
      lastProcessed = lastRow - 1;
      props.setProperty('lastBaselineRow', lastProcessed.toString());
    }
    for (let row = lastProcessed + 1; row <= lastRow; row++) {
      const rowData = baselineSheet.getRange(row, 1, 1, baselineSheet.getLastColumn()).getValues()[0];
      if (!String(rowData[COLS.EMAIL]).trim()) continue;
      baselineSheet.getRange(row, COLS.TIMESTAMP + 1).setNumberFormat('d MMMM yyyy');
      processBaselineRow(rowData);
    }
    if (lastRow > lastProcessed) props.setProperty('lastBaselineRow', lastRow.toString());
  }

  // Weekly Responses
  const weeklySheet = ss.getSheetByName(CONFIG.WEEKLY_SHEET);
  if (weeklySheet) {
    let lastProcessed = parseInt(props.getProperty('lastWeeklyRow') || '1');
    const lastRow = weeklySheet.getLastRow();
    if (lastProcessed > lastRow) {
      Logger.log('WARNING: lastWeeklyRow (' + lastProcessed + ') ahead of sheet (' + lastRow + '). Resetting.');
      lastProcessed = lastRow - 1;
      props.setProperty('lastWeeklyRow', lastProcessed.toString());
    }
    for (let row = lastProcessed + 1; row <= lastRow; row++) {
      const rowData = weeklySheet.getRange(row, 1, 1, weeklySheet.getLastColumn()).getValues()[0];
      if (!String(rowData[COLS.EMAIL]).trim()) continue;
      weeklySheet.getRange(row, COLS.TIMESTAMP + 1).setNumberFormat('d MMMM yyyy');
      processWeeklyRow(rowData);
    }
    if (lastRow > lastProcessed) props.setProperty('lastWeeklyRow', lastRow.toString());
  }

  // Final Responses
  const finalSheet = ss.getSheetByName(CONFIG.FINAL_SHEET);
  if (finalSheet) {
    let lastProcessed = parseInt(props.getProperty('lastFinalRow') || '1');
    const lastRow = finalSheet.getLastRow();
    if (lastProcessed > lastRow) {
      Logger.log('WARNING: lastFinalRow (' + lastProcessed + ') ahead of sheet (' + lastRow + '). Resetting.');
      lastProcessed = lastRow - 1;
      props.setProperty('lastFinalRow', lastProcessed.toString());
    }
    for (let row = lastProcessed + 1; row <= lastRow; row++) {
      const rowData = finalSheet.getRange(row, 1, 1, finalSheet.getLastColumn()).getValues()[0];
      if (!String(rowData[FINAL_COLS.EMAIL]).trim()) continue;
      finalSheet.getRange(row, FINAL_COLS.TIMESTAMP + 1).setNumberFormat('d MMMM yyyy');
      processFinalRow(rowData);
    }
    if (lastRow > lastProcessed) props.setProperty('lastFinalRow', lastRow.toString());
  }
}

// ============================================================
// ROW PROCESSORS
// ============================================================
function processBaselineRow(row) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const email = String(row[COLS.EMAIL]).trim();
  const name = String(row[COLS.NAME]).trim();
  const startDate = parseDate(row[COLS.TIMESTAMP]);
  const endDate = addDays(startDate, 42);
  const nextCheckIn = addDays(startDate, 7);

  const masterSheet = ss.getSheetByName(CONFIG.MASTER_SHEET);
  if (masterSheet && findClientRow(masterSheet, email) !== -1) {
    Logger.log('Client already in Master: ' + email);
    return;
  }

  addToMaster(name, email, startDate, endDate, nextCheckIn, extractScores(row));
  sendBaselineConfirmation(email, name);
}

function processWeeklyRow(row) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const baselineSheet = ss.getSheetByName(CONFIG.BASELINE_SHEET);

  const email = String(row[COLS.EMAIL]).trim();
  const name = String(row[COLS.NAME]).trim();
  const submitDate = parseDate(row[COLS.TIMESTAMP]);
  const meditations = row[COLS.MEDITATIONS] || 0;
  const wins = String(row[COLS.WINS] || '').trim();
  const needs = String(row[COLS.NEEDS] || '').trim();

  const baseline = getClientBaseline(baselineSheet, email);
  if (!baseline) { Logger.log('No baseline found for: ' + email); return; }

  const joinDate = parseDate(baseline[COLS.TIMESTAMP]);
  const weekNumber = Math.round((submitDate - joinDate) / (1000 * 60 * 60 * 24 * 7));

  if (weekNumber >= CONFIG.TOTAL_WEEKS) {
    Logger.log('Week ' + weekNumber + ' for ' + email + ' — skipping (handled by final form).');
    return;
  }

  const nextCheckIn = addDays(joinDate, (weekNumber + 1) * 7);
  const baselineScores = extractScores(baseline);
  const currentScores = extractScores(row);

  updateMaster(email, weekNumber, currentScores, baselineScores, nextCheckIn, meditations, wins, needs);
  sendProgressReport(email, name, weekNumber, baselineScores, currentScores, meditations, wins, needs, false);
}

function processFinalRow(row) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const baselineSheet = ss.getSheetByName(CONFIG.BASELINE_SHEET);

  const email = String(row[FINAL_COLS.EMAIL]).trim();
  const name = String(row[FINAL_COLS.NAME]).trim();
  const meditations = Number(row[FINAL_COLS.MEDITATIONS]) || 0;
  const howFeel = String(row[FINAL_COLS.HOW_FEEL] || '').trim();
  const biggestPos = String(row[FINAL_COLS.BIGGEST_POS] || '').trim();
  const recommend = String(row[FINAL_COLS.RECOMMEND] || '').trim();
  const improvements = String(row[FINAL_COLS.IMPROVEMENTS] || '').trim();

  const baseline = getClientBaseline(baselineSheet, email);
  if (!baseline) { Logger.log('No baseline found for final row: ' + email); return; }

  const baselineScores = extractScores(baseline);
  const currentScores = extractScores(row);

  updateMaster(email, CONFIG.TOTAL_WEEKS, currentScores, baselineScores, null, meditations, '', '');
  sendProgressReport(email, name, CONFIG.TOTAL_WEEKS, baselineScores, currentScores, meditations, '', '', true, howFeel, biggestPos, recommend, improvements);
  moveToCompleted(email, baselineSheet, currentScores, meditations, howFeel, biggestPos, recommend, improvements);
}

// ============================================================
// DAILY TRIGGER — send check-in reminders
// ============================================================
function sendWeeklyReminders() {
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
    const currentWeek = Number(data[i][MC.CURRENT_WEEK]);

    if (!email || !nextCheckInRaw || nextCheckInRaw === 'Complete') continue;

    const nextCheckIn = parseDate(nextCheckInRaw);
    nextCheckIn.setHours(0, 0, 0, 0);
    const upcomingWeek = currentWeek + 1;

    if (nextCheckIn.getTime() === today.getTime() && !alreadySentReminder(email, upcomingWeek)) {
      if (upcomingWeek >= CONFIG.TOTAL_WEEKS) {
        sendFinalFormEmail(email, name);
      } else {
        sendWeeklyFormEmail(email, name, upcomingWeek);
      }
      logReminderSent(email, name, upcomingWeek);
    }
  }
}

// ============================================================
// MASTER TAB
// ============================================================
function addToMaster(name, email, startDate, endDate, nextCheckIn, scores) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let masterSheet = ss.getSheetByName(CONFIG.MASTER_SHEET);
  if (!masterSheet) {
    masterSheet = ss.insertSheet(CONFIG.MASTER_SHEET);
    masterSheet.appendRow([
      'Name', 'Email', 'Start Date', 'Program End Date', 'Next Check-In', 'Status', 'Week',
      'Pain', 'Energy', 'Anxiety', 'Calmness', 'Sleep', 'Depressive Thoughts',
      'Focus', 'Mood', 'Stress Resilience', 'Total Meditations to Date', 'Wins This Week', 'Needs Help With'
    ]);
  }

  masterSheet.appendRow([
    name, email, startDate, endDate, nextCheckIn, '', 0,
    scores.PAIN, scores.ENERGY, scores.ANXIETY, scores.CALMNESS, scores.SLEEP,
    scores.DEPRESSIVE, scores.FOCUS, scores.MOOD, scores.RESILIENCE,
    '', '', ''
  ]);

  const newRow = masterSheet.getLastRow();
  masterSheet.getRange(newRow, MC.START_DATE + 1).setNumberFormat('d MMMM yyyy');
  masterSheet.getRange(newRow, MC.END_DATE + 1).setNumberFormat('d MMMM yyyy');
  masterSheet.getRange(newRow, MC.NEXT_CHECKIN + 1).setNumberFormat('d MMMM yyyy');
}

function updateMaster(email, weekNumber, scores, baseline, nextCheckIn, meditations, wins, needs) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const masterSheet = ss.getSheetByName(CONFIG.MASTER_SHEET);
  if (!masterSheet) return;

  const rowIndex = findClientRow(masterSheet, email);
  if (rowIndex === -1) return;

  const sheetRow = rowIndex + 1;

  masterSheet.getRange(sheetRow, MC.CURRENT_WEEK + 1).setValue(weekNumber);
  const nextCheckInCell = masterSheet.getRange(sheetRow, MC.NEXT_CHECKIN + 1);
  nextCheckInCell.setValue(nextCheckIn || 'Complete');
  if (nextCheckIn) nextCheckInCell.setNumberFormat('d MMMM yyyy');

  const prevMeditations = Number(masterSheet.getRange(sheetRow, MC.MEDITATIONS + 1).getValue()) || 0;
  masterSheet.getRange(sheetRow, MC.MEDITATIONS + 1).setValue(prevMeditations + meditations);
  masterSheet.getRange(sheetRow, MC.WINS + 1).setValue(wins);
  masterSheet.getRange(sheetRow, MC.NEEDS + 1).setValue(needs);

  let statusImproved = 0, statusDeclined = 0;
  METRICS.forEach(m => {
    const curr = scores[m.key];
    const base = baseline[m.key];
    const diff = curr - base;
    const diffStr = diff > 0 ? '+' + diff : String(diff);
    const isImproved = m.direction === 'up' ? diff > 0 : diff < 0;
    const isDeclined = m.direction === 'up' ? diff < 0 : diff > 0;
    const color = isImproved ? '#66bb6a' : isDeclined ? '#e57373' : '#fff176';

    if (isImproved) statusImproved++;
    if (isDeclined) statusDeclined++;

    const cell = masterSheet.getRange(sheetRow, MC[m.key] + 1);
    cell.setValue(diffStr);
    cell.setBackground(color);
  });

  const status = statusImproved >= 5 ? '🟢 Going Well'
               : statusImproved >= 3 ? '🟡 Going Okay'
               : statusDeclined >= 3 ? '🔴 Needs Help'
               : '🟠 Might Need Help';
  masterSheet.getRange(sheetRow, MC.STATUS + 1).setValue(status);
}

function moveToCompleted(email, baselineSheet, finalScores, meditations, howFeel, biggestPos, recommend, improvements) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const masterSheet = ss.getSheetByName(CONFIG.MASTER_SHEET);
  if (!masterSheet) return;

  let completedSheet = ss.getSheetByName(CONFIG.COMPLETED_SHEET);
  if (!completedSheet) completedSheet = ss.insertSheet(CONFIG.COMPLETED_SHEET);

  if (completedSheet.getLastRow() === 0) {
    completedSheet.appendRow([
      'Name', 'Email', 'Start Date', 'Program End Date', 'Completion Date',
      'Pain', 'Energy', 'Anxiety', 'Calmness', 'Sleep', 'Depressive Thoughts',
      'Focus', 'Mood', 'Stress Resilience',
      'Total Meditations', 'How do you feel now?', 'Biggest positive',
      'Would you recommend?', 'Improvements'
    ]);
  }

  const rowIndex = findClientRow(masterSheet, email);
  if (rowIndex === -1) return;

  const masterData = masterSheet.getRange(rowIndex + 1, 1, 1, masterSheet.getLastColumn()).getValues()[0];
  const baseline = getClientBaseline(baselineSheet, email);
  const b = baseline ? extractScores(baseline) : {};

  completedSheet.appendRow([
    masterData[MC.NAME], masterData[MC.EMAIL],
    masterData[MC.START_DATE], masterData[MC.END_DATE], new Date(),
    '', '', '', '', '', '', '', '', '',
    masterData[MC.MEDITATIONS],
    howFeel, biggestPos, recommend, improvements
  ]);

  const newRow = completedSheet.getLastRow();
  METRICS.forEach((m, i) => {
    const diff = finalScores[m.key] - (b[m.key] || 0);
    const diffStr = diff > 0 ? '+' + diff : String(diff);
    const isImproved = m.direction === 'up' ? diff > 0 : diff < 0;
    const isDeclined = m.direction === 'up' ? diff < 0 : diff > 0;
    const color = isImproved ? '#66bb6a' : isDeclined ? '#e57373' : '#fff176';
    const cell = completedSheet.getRange(newRow, 6 + i);
    cell.setValue(diffStr);
    cell.setBackground(color);
  });

  completedSheet.getRange(newRow, 3).setNumberFormat('d MMMM yyyy');
  completedSheet.getRange(newRow, 4).setNumberFormat('d MMMM yyyy');
  completedSheet.getRange(newRow, 5).setNumberFormat('d MMMM yyyy');

  masterSheet.deleteRow(rowIndex + 1);
  updateSummaryDashboard();
}

// ============================================================
// SUMMARY DASHBOARD
// ============================================================
function updateSummaryDashboard() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const completedSheet = ss.getSheetByName(CONFIG.COMPLETED_SHEET);
  if (!completedSheet || completedSheet.getLastRow() <= 1) return;

  let dashSheet = ss.getSheetByName('Summary Dashboard');
  if (!dashSheet) dashSheet = ss.insertSheet('Summary Dashboard');
  dashSheet.clearContents();
  dashSheet.clearFormats();

  const data = completedSheet.getDataRange().getValues();
  const clientRows = data.slice(1).filter(r => String(r[1]).trim());
  const clientCount = clientRows.length;

  dashSheet.getRange(1, 1, 1, 6).merge();
  dashSheet.getRange(1, 1).setValue('Heart Activation — Results Summary');
  dashSheet.getRange(1, 1).setFontSize(14).setFontWeight('bold').setFontColor('#ffffff').setBackground('#222222').setHorizontalAlignment('center');
  dashSheet.setRowHeight(1, 40);

  dashSheet.getRange(2, 1, 1, 6).merge();
  dashSheet.getRange(2, 1).setValue('Based on ' + clientCount + ' completed client' + (clientCount !== 1 ? 's' : ''));
  dashSheet.getRange(2, 1).setFontSize(10).setFontColor('#666666').setBackground('#f9f9f9').setHorizontalAlignment('center').setFontStyle('italic');
  dashSheet.setRowHeight(2, 28);

  const headers = ['Metric', 'Avg Baseline', 'Avg Final', 'Avg Change', '% Improvement', 'Clients'];
  dashSheet.getRange(3, 1, 1, headers.length).setValues([headers]);
  dashSheet.getRange(3, 1, 1, headers.length)
    .setFontWeight('bold')
    .setFontColor('#ffffff')
    .setBackground('#444444')
    .setHorizontalAlignment('center')
    .setFontSize(11);
  dashSheet.getRange(3, 1).setHorizontalAlignment('left');
  dashSheet.setRowHeight(3, 32);

  if (clientCount === 0) return;

  const baselineSheet = ss.getSheetByName(CONFIG.BASELINE_SHEET);
  const baselineData = baselineSheet ? baselineSheet.getDataRange().getValues() : [];

  METRICS.forEach((m, i) => {
    const colIndex = 5 + i;
    let totalBaseline = 0, totalFinal = 0, validCount = 0;

    clientRows.forEach(row => {
      const email = String(row[1]).trim().toLowerCase();
      const baselineRow = baselineData.slice(1).find(b => String(b[COLS.EMAIL]).trim().toLowerCase() === email);
      if (!baselineRow) return;

      const baseVal = Number(baselineRow[COLS[m.key]]);
      const diffStr = String(row[colIndex]).replace('+', '');
      const diff = parseFloat(diffStr);
      if (isNaN(baseVal) || isNaN(diff)) return;

      totalBaseline += baseVal;
      totalFinal += baseVal + diff;
      validCount++;
    });

    const dataRowNum = 4 + i;
    dashSheet.setRowHeight(dataRowNum, 30);

    if (validCount === 0) {
      dashSheet.getRange(dataRowNum, 1, 1, 6).setValues([[m.label, '—', '—', '—', '—', 0]]);
      return;
    }

    const avgBaseline = totalBaseline / validCount;
    const avgFinal = totalFinal / validCount;
    const avgChange = avgFinal - avgBaseline;

    const pctImprovement = avgBaseline === 0 && avgFinal === 0 ? 0
      : avgBaseline === 0 ? 100
      : m.direction === 'down'
      ? ((avgBaseline - avgFinal) / avgBaseline) * 100
      : ((avgFinal - avgBaseline) / avgBaseline) * 100;

    const rowBg = i % 2 === 0 ? '#ffffff' : '#f9f9f9';
    const pctColor = pctImprovement > 0 ? '#1b5e20' : pctImprovement < 0 ? '#b71c1c' : '#555555';
    const pctBg = pctImprovement > 0 ? '#c8e6c9' : pctImprovement < 0 ? '#ffcdd2' : '#fff9c4';

    dashSheet.getRange(dataRowNum, 1, 1, 6).setValues([[
      m.label,
      Math.round(avgBaseline * 10) / 10,
      Math.round(avgFinal * 10) / 10,
      (avgChange >= 0 ? '+' : '') + (Math.round(avgChange * 10) / 10),
      Math.round(pctImprovement) + '%',
      validCount
    ]]);

    dashSheet.getRange(dataRowNum, 1, 1, 6).setBackground(rowBg).setFontSize(11).setVerticalAlignment('middle');
    dashSheet.getRange(dataRowNum, 2, 1, 4).setHorizontalAlignment('center');
    dashSheet.getRange(dataRowNum, 6).setHorizontalAlignment('center');
    dashSheet.getRange(dataRowNum, 5).setBackground(pctBg).setFontColor(pctColor).setFontWeight('bold').setHorizontalAlignment('center');
  });

  const summaryRowNum = 4 + METRICS.length;
  dashSheet.setRowHeight(summaryRowNum, 38);

  const pctValues = [];
  METRICS.forEach((m, i) => {
    const colIndex = 5 + i;
    let totalBaseline = 0, totalFinal = 0, validCount = 0;
    clientRows.forEach(row => {
      const email = String(row[1]).trim().toLowerCase();
      const baselineRow = baselineData.slice(1).find(b => String(b[COLS.EMAIL]).trim().toLowerCase() === email);
      if (!baselineRow) return;
      const baseVal = Number(baselineRow[COLS[m.key]]);
      const diffStr = String(row[colIndex]).replace('+', '');
      const diff = parseFloat(diffStr);
      if (isNaN(baseVal) || isNaN(diff)) return;
      totalBaseline += baseVal;
      totalFinal += baseVal + diff;
      validCount++;
    });
    if (validCount === 0) return;
    const avgBaseline = totalBaseline / validCount;
    const avgFinal = totalFinal / validCount;
    const pct = avgBaseline === 0 && avgFinal === 0 ? 0
      : avgBaseline === 0 ? 100
      : m.direction === 'down'
      ? ((avgBaseline - avgFinal) / avgBaseline) * 100
      : ((avgFinal - avgBaseline) / avgBaseline) * 100;
    pctValues.push(pct);
  });

  const overallAvgPct = pctValues.length > 0
    ? Math.round(pctValues.reduce((a, b) => a + b, 0) / pctValues.length)
    : 0;

  const overallColor = overallAvgPct > 0 ? '#1b5e20' : overallAvgPct < 0 ? '#b71c1c' : '#555555';
  const overallBg    = overallAvgPct > 0 ? '#c8e6c9' : overallAvgPct < 0 ? '#ffcdd2' : '#fff9c4';

  dashSheet.getRange(summaryRowNum, 1, 1, 6).merge();
  dashSheet.getRange(summaryRowNum, 1).setValue('⭐ Overall Average Client Improvement: ' + overallAvgPct + '%');
  dashSheet.getRange(summaryRowNum, 1)
    .setBackground(overallBg)
    .setFontColor(overallColor)
    .setFontWeight('bold')
    .setFontSize(13)
    .setHorizontalAlignment('center')
    .setVerticalAlignment('middle');

  dashSheet.setColumnWidth(1, 175);
  dashSheet.setColumnWidth(2, 120);
  dashSheet.setColumnWidth(3, 100);
  dashSheet.setColumnWidth(4, 110);
  dashSheet.setColumnWidth(5, 130);
  dashSheet.setColumnWidth(6, 80);

  const totalRows = 3 + METRICS.length + 1;
  dashSheet.getRange(3, 1, totalRows, 6).setBorder(true, true, true, true, true, true, '#dddddd', SpreadsheetApp.BorderStyle.SOLID);
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

function getClientBaseline(sheet, email) {
  const data = sheet.getDataRange().getValues();
  let match = null;
  for (let i = 1; i < data.length; i++) {
    if (String(data[i][COLS.EMAIL]).trim().toLowerCase() === email.toLowerCase()) match = data[i];
  }
  return match;
}

function extractScores(row) {
  const scores = {};
  METRICS.forEach(m => { scores[m.key] = Number(row[COLS[m.key]]); });
  return scores;
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
      from: 'Heart Activation Program <olly@ollyhenson.com>',
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
function logReminderSent(email, name, weekNumber) {
  const sheet = getSentLogSheet();
  sheet.appendRow([new Date(), email, name, weekNumber, 'reminder']);
}

function getSentLogSheet() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName(CONFIG.SENT_LOG_SHEET);
  if (sheet.getLastRow() === 0) {
    sheet.appendRow(['Date Sent', 'Email', 'Name', 'Week Number', 'Type']);
  }
  return sheet;
}

function alreadySentReminder(email, weekNumber) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName(CONFIG.SENT_LOG_SHEET);
  if (!sheet || sheet.getLastRow() <= 1) return false;
  const data = sheet.getDataRange().getValues();
  for (let i = 1; i < data.length; i++) {
    if (
      String(data[i][1]).trim().toLowerCase() === email.toLowerCase() &&
      data[i][3] === weekNumber &&
      data[i][4] === 'reminder'
    ) return true;
  }
  return false;
}

// ============================================================
// EMAIL — baseline confirmation
// ============================================================
function sendBaselineConfirmation(email, name) {
  const subject = `Heart Activation starts now`;

  const html = wrapHtml(`
    <p>Hi ${firstName(name)},</p>
    <p>Your baseline scores have been recorded and you've officially started the six weeks of Heart Activation.</p>
    <p>Your first check-in will arrive in your inbox in seven days.</p>
    <p>Each day, do your best to complete the Heart Activation Meditation and to self-regulate throughout your day.</p>
    <p>If you need any help at any point, ask a question ${link('https://www.skool.com/the-healing-code-8609', 'here')} in the community feed.</p>
    <p>${link(CONFIG.SHARE_BASE_URL + '?type=started&text=' + encodeURIComponent('I\'ve just started the Heart Activation program — excited to get going!'), 'Let us know that you\'ve started here →')}</p>
    <p>To creating and living your life with confidence and ease.<br>Olly</p>
  `);

  sendEmail(email, subject, html, 'Your baseline scores have been recorded. You\'ve officially started the six weeks of Heart Activation.');
  sendBaselineNotificationToOlly(email, name);
}

function sendBaselineNotificationToOlly(email, name) {
  const subject = `${name} has started Heart Activation`;
  const startedText = `${firstName(name)} starts Heart Activation today. You've got this. Keep us posted with how you're doing.`;
  const html = wrapHtml(`
    <p>${name} has just started their six weeks of Heart Activation.</p>
    <p><strong>Email:</strong> ${email}</p>
    <p>${link(CONFIG.SHARE_BASE_URL + '?type=win&text=' + encodeURIComponent(startedText), 'Share in the community that ' + firstName(name) + ' has started →')}</p>
  `);
  sendEmail(CONFIG.OLLY_EMAIL, subject, html);
}

// ============================================================
// EMAIL — weekly check-in reminder
// ============================================================
function sendWeeklyFormEmail(email, name, weekNumber) {
  const subject = `Your week ${weekNumber} check-in — Heart Activation Program`;

  const html = wrapHtml(`
    <p>Hi ${firstName(name)},</p>
    <p>Here's your Week ${weekNumber} check-in.</p>
    <p>Please add this week's results via the link below:</p>
    <p>${link(CONFIG.WEEKLY_FORM_URL, 'Complete Your Week ' + weekNumber + ' Check-In')}</p>
    <p>Once you've done that, you'll receive your weekly progress report.</p>
    <p>To creating and living your life with confidence and ease.<br>Olly</p>
  `);

  sendEmail(email, subject, html, 'Your Week ' + weekNumber + ' check-in is ready. Complete it here: ' + CONFIG.WEEKLY_FORM_URL);
}

// ============================================================
// EMAIL — final check-in reminder
// ============================================================
function sendFinalFormEmail(email, name) {
  const subject = `Your final check-in — Heart Activation Program`;

  const html = wrapHtml(`
    <p>Hi ${firstName(name)},</p>
    <p>You've made it to your final check-in for Heart Activation — well done for completing the six weeks.</p>
    <p>Please complete your final check-in using the link below. This one includes a few extra questions alongside your usual scores.</p>
    <p>${link(CONFIG.FINAL_FORM_URL, 'Complete Your Final Check-In')}</p>
    <p>Once you've done that, you'll get your final progress report.</p>
    <p>To creating and living your life with confidence and ease.<br>Olly</p>
  `);

  sendEmail(email, subject, html, 'Complete your final check-in here: ' + CONFIG.FINAL_FORM_URL);
}

// ============================================================
// EMAIL — progress report
// ============================================================
function sendProgressReport(email, name, weekNumber, baseline, current, meditations, wins, needs, isFinal, howFeel, biggestPos, recommend, improvements) {
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

  const statusLabel = improved >= 5 ? '🟢 Going Well'
                   : improved >= 3 ? '🟡 Going Okay'
                   : declined >= 3 ? '🔴 Needs Help'
                   : '🟠 Might Need Help';
  const shareUrl     = wins ? CONFIG.SHARE_BASE_URL + '?type=win&text=' + encodeURIComponent(wins) : '';
  const ollyWinText  = wins ? `Great win from ${firstName(name)} this week: ${wins}` : '';
  const ollyWinUrl   = wins ? CONFIG.SHARE_BASE_URL + '?type=win&text=' + encodeURIComponent(ollyWinText) : '';
  const helpUrl         = needs ? CONFIG.SHARE_BASE_URL + '?type=help&text=' + encodeURIComponent(needs) : '';
  const winsLine        = wins  ? `<p><strong>Wins this week:</strong> "${wins}"<br>${link(shareUrl, 'Share this win in the community →')}</p>` : '';
  const needsLineClient = needs ? `<p><strong>What you need help with:</strong> ${needs}<br>${link(helpUrl, 'Ask for help in the community →')}</p>` : '';
  const coachUrl        = needs ? CONFIG.SHARE_BASE_URL + '?type=coach&text=' + encodeURIComponent(needs) : '';
  const needsLineOlly   = needs ? `<p><strong>Client needs help with:</strong> ${needs}<br>${link(coachUrl, 'Help client with this →')}</p>` : '';
  const ollyWinsLine    = wins  ? `<p><strong>Wins this week:</strong> ${wins}<br>${link(ollyWinUrl, 'Share this win in the community →')}</p>` : '';

  const combinedText  = isFinal ? [howFeel, biggestPos].filter(Boolean).join('\n\n') : '';
  const finalShareUrl = combinedText ? CONFIG.SHARE_BASE_URL + '?type=final&text=' + encodeURIComponent(combinedText) : '';
  const ollyShareUrl  = combinedText ? CONFIG.SHARE_BASE_URL + '?type=results&text=' + encodeURIComponent(combinedText) : '';

  const qualitativeBlockClient = isFinal ? `
    <p><strong>Your Experience</strong></p>
    <p>${howFeel ? `"${howFeel}` : '—'}</p>
    <p>${biggestPos ? `${biggestPos}"` : '—'}</p>
    ${finalShareUrl ? `<p>Would love it if you could share your results of the program with the community as inspiration. Just ${link(finalShareUrl, 'click here to share the results and feel the love →')}.</p>` : ''}
  ` : ``;

  const qualitativeBlockOlly = isFinal ? `
    <p><strong>Client Experience</strong></p>
    <p>${howFeel ? `"${howFeel}` : '—'}</p>
    <p>${biggestPos ? `${biggestPos}"` : '—'}</p>
    ${ollyShareUrl ? `<p>${link(ollyShareUrl, 'Share Client Results →')}</p>` : ''}
    <p><strong>Would you recommend this program to others?</strong><br>${recommend || '—'}</p>
    <p><strong>Is there anything that could make this program better?</strong><br>${improvements || '—'}</p>
  ` : ``;

  const clientSubject = isFinal
    ? `Your final progress report — Heart Activation Program`
    : `Your week ${weekNumber} progress report — Heart Activation Program`;

  const clientHtml = wrapHtml(`
    <p>Hi ${firstName(name)},</p>
    <p>${isFinal ? 'Congratulations on completing the Heart Activation Program!<br><br>Here are your final results:' : `Here is your Week ${weekNumber} progress report.`}</p>
    <table style="border-collapse:collapse;width:100%;font-size:16px;">
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
    <p><strong>${improved} out of ${METRICS.length} areas have improved since you started.</strong></p>
    ${!isFinal ? `<p><strong>Meditations this week:</strong> ${meditations}</p>` : ''}
    ${!isFinal ? winsLine : ''}
    ${needsLineClient}
    ${qualitativeBlockClient}
    <p>To creating and living your life with confidence and ease.<br>Olly</p>
  `);

  const ollySubject = isFinal
    ? `[Final report] ${name} — 6-week summary`
    : `[Progress report] ${name} — Week ${weekNumber}`;

  const ollyHtml = wrapHtml(`
    <p><strong>Client:</strong> ${name} (${email})<br><strong>Week:</strong> ${weekNumber}</p>
    <table style="border-collapse:collapse;width:100%;font-size:16px;">
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
    <p>Improved: <strong>${improved}/${METRICS.length}</strong> &nbsp;|&nbsp; Declined: <strong>${declined}/${METRICS.length}</strong> &nbsp;|&nbsp; Status: <strong>${statusLabel}</strong></p>
    ${!isFinal ? `<p><strong>Meditations this week:</strong> ${meditations}</p>` : ''}
    ${!isFinal ? ollyWinsLine : ''}
    ${needsLineOlly}
    ${qualitativeBlockOlly}
    ${declined >= 3 ? '<p style="color:#c62828;"><strong>⚠️ FLAGGED: 3 or more metrics declined — may be worth a personal check-in.</strong></p>' : ''}
  `);

  sendEmail(email, clientSubject, clientHtml, 'Your progress report for week ' + weekNumber + ' is ready.');
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

  const weeklySheet = ss.getSheetByName(CONFIG.WEEKLY_SHEET);
  if (weeklySheet) props.setProperty('lastWeeklyRow', weeklySheet.getLastRow().toString());

  const finalSheet = ss.getSheetByName(CONFIG.FINAL_SHEET);
  if (finalSheet) props.setProperty('lastFinalRow', finalSheet.getLastRow().toString());

  Logger.log('Tracking initialised. Script will process only new submissions from this point.');
}

function setupTriggers() {
  ScriptApp.getProjectTriggers().forEach(t => ScriptApp.deleteTrigger(t));

  ScriptApp.newTrigger('sendWeeklyReminders')
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
// DEBUG / RESET
// ============================================================
function debugTracking() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const props = PropertiesService.getScriptProperties();
  const baselineSheet = ss.getSheetByName(CONFIG.BASELINE_SHEET);
  const weeklySheet = ss.getSheetByName(CONFIG.WEEKLY_SHEET);
  const finalSheet = ss.getSheetByName(CONFIG.FINAL_SHEET);

  Logger.log('lastBaselineRow (counter): ' + props.getProperty('lastBaselineRow'));
  Logger.log('Actual baseline sheet rows: ' + (baselineSheet ? baselineSheet.getLastRow() : 'NOT FOUND'));
  Logger.log('lastWeeklyRow (counter): ' + props.getProperty('lastWeeklyRow'));
  Logger.log('Actual weekly sheet rows: ' + (weeklySheet ? weeklySheet.getLastRow() : 'NOT FOUND'));
  Logger.log('lastFinalRow (counter): ' + props.getProperty('lastFinalRow'));
  Logger.log('Actual final sheet rows: ' + (finalSheet ? finalSheet.getLastRow() : 'NOT FOUND'));
}

// ============================================================
// TEST FUNCTIONS
// ============================================================
function testBaselineConfirmation() {
  sendBaselineConfirmation('olly@ollyhenson.com', 'Olly Henson');
}

function testWeeklyReminder() {
  sendWeeklyFormEmail('olly@ollyhenson.com', 'Olly Henson', 1);
}

function testFinalReminder() {
  sendFinalFormEmail('olly@ollyhenson.com', 'Olly Henson');
}

function testReport() {
  sendProgressReport(
    'olly@ollyhenson.com',
    'Olly Henson',
    3,
    { PAIN:8, ENERGY:2, ANXIETY:7, CALMNESS:3, SLEEP:4, DEPRESSIVE:8, FOCUS:5, MOOD:4, RESILIENCE:2 },
    { PAIN:5, ENERGY:5, ANXIETY:4, CALMNESS:6, SLEEP:6, DEPRESSIVE:5, FOCUS:7, MOOD:7, RESILIENCE:5 },
    5, 'Feeling more energised than I have in months', 'More support on breathwork technique',
    false
  );
}

function testFinalReport() {
  sendProgressReport(
    'olly@ollyhenson.com',
    'Olly Henson',
    6,
    { PAIN:8, ENERGY:2, ANXIETY:7, CALMNESS:3, SLEEP:4, DEPRESSIVE:8, FOCUS:5, MOOD:4, RESILIENCE:2 },
    { PAIN:3, ENERGY:8, ANXIETY:2, CALMNESS:8, SLEEP:8, DEPRESSIVE:2, FOCUS:8, MOOD:8, RESILIENCE:7 },
    12, 'Feeling like myself again', '',
    true,
    'I feel like my heart has genuinely opened. I have energy and joy I didn\'t think was possible.',
    'Realising I could access these states whenever I chose. That changed everything.',
    'Without question. I only wish I had found this program years ago.',
    'Nothing — the program was exactly what I needed.'
  );
}
