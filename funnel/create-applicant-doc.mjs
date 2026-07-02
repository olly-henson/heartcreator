// create-applicant-doc.mjs
// Receives a webhook POST from GHL when an application is submitted.
// Creates a Google Doc in the HCP Applicants folder with all answers formatted.
// Run permanently: node create-applicant-doc.mjs

import { createServer } from 'http';
import { readFileSync } from 'fs';

const ENV_PATH = 'C:/Users/Olly/AI OS/marketing/.env';

function loadEnv(path) {
  const lines = readFileSync(path, 'utf8').split('\n');
  const env = {};
  for (const line of lines) {
    const match = line.match(/^([^#=]+)=(.*)$/);
    if (match) env[match[1].trim()] = match[2].trim();
  }
  return env;
}

const env = loadEnv(ENV_PATH);
const CLIENT_ID = env.DOCS_CLIENT_ID;
const CLIENT_SECRET = env.DOCS_CLIENT_SECRET;
const REFRESH_TOKEN = env.DOCS_REFRESH_TOKEN;
const FOLDER_ID = env.DOCS_FOLDER_ID;

async function getAccessToken() {
  const res = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      client_id: CLIENT_ID,
      client_secret: CLIENT_SECRET,
      refresh_token: REFRESH_TOKEN,
      grant_type: 'refresh_token',
    }),
  });
  const data = await res.json();
  return data.access_token;
}

async function createDoc(accessToken, title) {
  const res = await fetch('https://www.googleapis.com/drive/v3/files?fields=id,parents', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      name: title,
      mimeType: 'application/vnd.google-apps.document',
    }),
  });
  const text = await res.text();
  console.log('createDoc raw response:', text.slice(0, 500));
  const data = JSON.parse(text);
  if (!res.ok) throw new Error(`createDoc error: ${JSON.stringify(data)}`);
  return { documentId: data.id, parents: data.parents };
}

async function moveToFolder(accessToken, fileId, currentParents) {
  const removeParents = currentParents ? currentParents.join(',') : 'root';
  const url = `https://www.googleapis.com/drive/v3/files/${fileId}?addParents=${FOLDER_ID}&removeParents=${removeParents}&fields=id,parents`;
  const res = await fetch(url, {
    method: 'PATCH',
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  const data = await res.json();
  if (!res.ok) console.error('❌ moveToFolder error:', JSON.stringify(data));
  return data;
}

async function writeContent(accessToken, docId, data) {
  const { first_name, last_name, email, whatsapp, situation, outcome, become, tried, coaching_before } = data;

  const name = [first_name, last_name].filter(Boolean).join(' ') || 'Unknown Applicant';
  const submittedAt = new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' });

  const requests = [
    // Title
    { insertText: { location: { index: 1 }, text: `${name} Application\n` } },
    { updateParagraphStyle: { range: { startIndex: 1, endIndex: `${name} Application\n`.length + 1 }, paragraphStyle: { namedStyleType: 'HEADING_1' }, fields: 'namedStyleType' } },

    // Meta
    { insertText: { location: { index: `${name} Application\n`.length + 1 }, text: `Submitted: ${submittedAt}\nEmail: ${email || '—'}\nWhatsApp: ${whatsapp || '—'}\n\n` } },
  ];

  const questions = [
    { label: 'Q1 — Current situation', value: situation },
    { label: 'Q2 — What they want to create', value: outcome },
    { label: 'Q3 — What has been holding them back', value: become },
    { label: 'Q4 — What they have tried', value: tried },
    { label: 'Q5 — Previous coaching experience', value: coaching_before },
  ];

  // Build text block first, then style
  let index = `${name} Application\n`.length + 1 + `Submitted: ${submittedAt}\nEmail: ${email || '—'}\nWhatsApp: ${whatsapp || '—'}\n\n`.length;

  for (const q of questions) {
    const labelText = `${q.label}\n`;
    const answerText = `${q.value || 'No answer provided'}\n\n`;

    requests.push({ insertText: { location: { index }, text: labelText } });
    requests.push({
      updateParagraphStyle: {
        range: { startIndex: index, endIndex: index + labelText.length },
        paragraphStyle: { namedStyleType: 'HEADING_2' },
        fields: 'namedStyleType',
      },
    });
    index += labelText.length;

    requests.push({ insertText: { location: { index }, text: answerText } });
    index += answerText.length;
  }

  await fetch(`https://docs.googleapis.com/v1/documents/${docId}:batchUpdate`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ requests }),
  });
}

const server = createServer(async (req, res) => {
  if (req.method !== 'POST') {
    res.writeHead(200);
    res.end('HCP Doc Writer running.');
    return;
  }

  let body = '';
  req.on('data', chunk => { body += chunk; });
  req.on('end', async () => {
    try {
      const data = JSON.parse(body);
      const firstName = data.first_name || 'Unknown';
      const lastName = data.last_name || '';
      const name = [firstName, lastName].filter(Boolean).join(' ');
      const docTitle = `${name} Application`;

      console.log(`\nNew application received: ${name}`);

      const accessToken = await getAccessToken();
      const doc = await createDoc(accessToken, docTitle);
      await moveToFolder(accessToken, doc.documentId, doc.parents);
      await writeContent(accessToken, doc.documentId, data);

      console.log(`✅ Doc created: ${docTitle}`);
      console.log(`   https://docs.google.com/document/d/${doc.documentId}/edit`);

      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ success: true, docId: doc.documentId }));
    } catch (err) {
      console.error('❌ Error creating doc:', err.message);
      res.writeHead(500);
      res.end(JSON.stringify({ error: err.message }));
    }
  });
});

server.listen(3001, () => {
  console.log('HCP Doc Writer listening on port 3001');
  console.log('Waiting for applications...');
});
