// One-time script to generate a Google Docs refresh token.
// Run once: node get-docs-token.mjs
// Paste the refresh token into .env as DOCS_REFRESH_TOKEN

import { createServer } from 'http';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import open from 'open';

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
const REDIRECT_URI = 'http://localhost:3000/callback';
const SCOPE = 'https://www.googleapis.com/auth/documents https://www.googleapis.com/auth/drive';

const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${CLIENT_ID}&redirect_uri=${encodeURIComponent(REDIRECT_URI)}&response_type=code&scope=${encodeURIComponent(SCOPE)}&access_type=offline&prompt=consent`;

console.log('\nOpening browser for Google authorisation...');
console.log('If it does not open automatically, visit:\n');
console.log(authUrl);
console.log('\nWaiting for authorisation...\n');

const server = createServer(async (req, res) => {
  if (!req.url.startsWith('/callback')) return;

  const url = new URL(req.url, 'http://localhost:3000');
  const code = url.searchParams.get('code');

  if (!code) {
    res.end('No code received.');
    return;
  }

  const tokenRes = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      code,
      client_id: CLIENT_ID,
      client_secret: CLIENT_SECRET,
      redirect_uri: REDIRECT_URI,
      grant_type: 'authorization_code',
    }),
  });

  const tokens = await tokenRes.json();

  if (tokens.refresh_token) {
    console.log('✅ Success! Copy this refresh token into your .env as DOCS_REFRESH_TOKEN:\n');
    console.log(tokens.refresh_token);
    console.log('\nDone. You can close the browser tab and stop this script (Ctrl+C).');
    res.end('<h2>Done! Check your terminal for the refresh token. You can close this tab.</h2>');
  } else {
    console.log('❌ No refresh token returned. Full response:');
    console.log(JSON.stringify(tokens, null, 2));
    res.end('<h2>Something went wrong — check your terminal.</h2>');
  }

  server.close();
});

server.listen(3000, () => {
  try { open(authUrl); } catch {}
});
