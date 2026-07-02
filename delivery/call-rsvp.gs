const SHEET_ID = '1vwQCpnDvyB2UlzFBIcQG4OaWWZdIo9h2h6cJHtmn0Rs';
const SHEET_NAME = 'Sheet1';

function doGet(e) {
  const firstName = e.parameter.first_name || '';
  const lastName = e.parameter.last_name || '';
  const name = (firstName + ' ' + lastName).trim() || 'Unknown';

  const sheet = SpreadsheetApp.openById(SHEET_ID).getSheetByName(SHEET_NAME);

  // Add header row if sheet is empty
  if (sheet.getLastRow() === 0) {
    sheet.appendRow(['Date', 'Attendees']);
  }

  const now = new Date();
  // Always log against the next Wednesday (call day)
  const day = now.getDay();
  const daysUntilWed = (3 - day + 7) % 7 || 7;
  const callDate = new Date(now);
  callDate.setDate(now.getDate() + daysUntilWed);
  const date = Utilities.formatDate(callDate, 'Europe/London', 'dd/MM/yyyy');

  // Find existing row for today's date
  const data = sheet.getDataRange().getValues();
  let matchRow = -1;
  for (let i = 1; i < data.length; i++) {
    if (data[i][0] === date) {
      matchRow = i + 1; // 1-indexed
      break;
    }
  }

  if (matchRow === -1) {
    // No row for today — create one
    sheet.appendRow([date, name]);
  } else {
    // Append name to existing attendees cell
    const existing = sheet.getRange(matchRow, 2).getValue();
    sheet.getRange(matchRow, 2).setValue(existing + ', ' + name);
  }

  const dayName = Utilities.formatDate(callDate, 'Europe/London', 'EEEE');
  const fullDate = Utilities.formatDate(callDate, 'Europe/London', 'dd MMMM yyyy');
  MailApp.sendEmail({
    to: 'olly@ollyhenson.com',
    subject: '📋 Call RSVP: ' + name,
    body: name + ' has registered for the Q&A Coaching Call on ' + dayName + ' ' + fullDate + '.'
  });

  // Build calendar links for today's call at 7pm–8pm London time
  const dateCompact = Utilities.formatDate(now, 'Europe/London', 'yyyyMMdd');
  const googleStart = dateCompact + 'T190000';
  const googleEnd = dateCompact + 'T200000';
  const callTitle = 'Coaching Q&A Call';
  const callDetails = 'Join here: https://www.skool.com/live/hKJmFBDh2Zk';
  const callLocation = 'https://www.skool.com/live/hKJmFBDh2Zk';

  const googleUrl = 'https://calendar.google.com/calendar/render?action=TEMPLATE'
    + '&text=' + encodeURIComponent(callTitle)
    + '&dates=' + googleStart + '/' + googleEnd
    + '&ctz=Europe/London'
    + '&details=' + encodeURIComponent(callDetails)
    + '&location=' + encodeURIComponent(callLocation);

  const outlookUrl = 'https://outlook.live.com/calendar/0/action/compose'
    + '?subject=' + encodeURIComponent(callTitle)
    + '&startdt=' + dateCompact.substring(0,4) + '-' + dateCompact.substring(4,6) + '-' + dateCompact.substring(6,8) + 'T19:00:00'
    + '&enddt=' + dateCompact.substring(0,4) + '-' + dateCompact.substring(4,6) + '-' + dateCompact.substring(6,8) + 'T20:00:00'
    + '&body=' + encodeURIComponent(callDetails)
    + '&location=' + encodeURIComponent(callLocation);

  const icsContent = 'BEGIN:VCALENDAR\nVERSION:2.0\nBEGIN:VEVENT\n'
    + 'DTSTART;TZID=Europe/London:' + googleStart + '\n'
    + 'DTEND;TZID=Europe/London:' + googleEnd + '\n'
    + 'SUMMARY:' + callTitle + '\n'
    + 'DESCRIPTION:' + callDetails + '\n'
    + 'LOCATION:' + callLocation + '\n'
    + 'END:VEVENT\nEND:VCALENDAR';
  const icsUrl = 'data:text/calendar;charset=utf8,' + encodeURIComponent(icsContent);

  const yahooUrl = 'https://calendar.yahoo.com/?v=60&title=' + encodeURIComponent(callTitle)
    + '&st=' + googleStart
    + '&et=' + googleEnd
    + '&desc=' + encodeURIComponent(callDetails)
    + '&in_loc=' + encodeURIComponent(callLocation);

  const office365Url = 'https://outlook.office.com/calendar/action/compose'
    + '?subject=' + encodeURIComponent(callTitle)
    + '&startdt=' + dateCompact.substring(0,4) + '-' + dateCompact.substring(4,6) + '-' + dateCompact.substring(6,8) + 'T19:00:00'
    + '&enddt=' + dateCompact.substring(0,4) + '-' + dateCompact.substring(4,6) + '-' + dateCompact.substring(6,8) + 'T20:00:00'
    + '&body=' + encodeURIComponent(callDetails)
    + '&location=' + encodeURIComponent(callLocation);

  const html = `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>See you on the call!</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
      background: #f0f0f0;
      padding: 24px 16px;
      display: flex;
      justify-content: center;
    }
    .card {
      background: white;
      border-radius: 20px;
      box-shadow: 0 2px 16px rgba(0,0,0,0.08);
      padding: 48px 40px 40px;
      text-align: center;
      width: 100%;
      max-width: 540px;
    }
    .tick { font-size: 64px; display: block; margin-bottom: 20px; }
    h1 { font-size: 52px; color: #111; line-height: 1.2; margin-bottom: 20px; }
    .subtitle { color: #555; font-size: 30px; line-height: 1.5; margin-bottom: 40px; }
    .cal-title { font-size: 16px; font-weight: 700; color: #333; text-transform: uppercase; letter-spacing: 0.06em; margin-bottom: 16px; }
    .cal-buttons { display: flex; flex-direction: column; gap: 12px; }
    .cal-btn {
      display: block;
      padding: 20px;
      border-radius: 12px;
      text-decoration: none;
      font-size: 20px;
      font-weight: 600;
      color: white;
    }
    .btn-google { background: #4285F4; }
    .btn-apple { background: #000; }
    .btn-outlook { background: #0078D4; }
    .btn-yahoo { background: #6001D2; }
  </style>
</head>
<body>
  <div class="card">
    <span class="tick">✅</span>
    <h1>You're on the list, ${name}!</h1>
    <p class="subtitle">See you on the call. If anything changes before the call and you can't make it, please email me.</p>
    <p class="cal-title">Add call to your calendar</p>
    <div class="cal-buttons">
      <a class="cal-btn btn-google" href="${googleUrl}" target="_blank">Google Calendar</a>
      <a class="cal-btn btn-apple" href="${icsUrl}" download="coaching-call.ics">Apple Calendar</a>
      <a class="cal-btn btn-outlook" href="${outlookUrl}" target="_blank">Outlook (Personal)</a>
      <a class="cal-btn btn-outlook" href="${office365Url}" target="_blank">Outlook (Work / Office 365)</a>
      <a class="cal-btn btn-yahoo" href="${yahooUrl}" target="_blank">Yahoo Calendar</a>
    </div>
  </div>
</body>
</html>`;

  return HtmlService.createHtmlOutput(html);
}

function testEmail() {
  MailApp.sendEmail({
    to: 'olly@ollyhenson.com',
    subject: 'Test email from Call RSVP',
    body: 'If you got this, email notifications are working.'
  });
}
