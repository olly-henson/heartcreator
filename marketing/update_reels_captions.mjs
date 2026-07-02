/**
 * update_reels_captions.mjs
 * - Removes the Script field from the Instagram Reels database
 * - Adds hashtags to all captions
 */

import { readFileSync } from 'fs';
import { resolve } from 'path';

const envPath = resolve('C:/Users/Olly/AI OS/marketing/.env');
const env = Object.fromEntries(
  readFileSync(envPath, 'utf8')
    .split('\n')
    .filter(l => l.includes('=') && !l.startsWith('#'))
    .map(l => l.split('=').map(p => p.trim()))
);

const headers = {
  Authorization: `Bearer ${env['NOTION_API_TOKEN']}`,
  'Content-Type': 'application/json',
  'Notion-Version': '2022-06-28',
};

const DB_ID = '36e30e58-6a0d-81e7-8c2a-e6c4f729915a';

const HASHTAGS = `\n\n#chronicillness #chronicfatigue #fibromyalgia #invisibleillness #chronicpain #brainfog #dysautonomia #nervoussystemhealing #nervoussystemregulation #heartcoherence #fightorflight #chronicillnessrecovery #healing #backtolife #regulateforrelief`;

// ── 1. Remove Script field ─────────────────────────────────────────────────
console.log('🗑️  Removing Script field...');
const dbRes = await fetch(`https://api.notion.com/v1/databases/${DB_ID}`, {
  method: 'PATCH',
  headers,
  body: JSON.stringify({ properties: { Script: null } })
});
if (!dbRes.ok) { const e = await dbRes.json(); console.error(JSON.stringify(e)); }
else console.log('✅ Script field removed.');

// ── 2. Fetch all pages and append hashtags to captions ────────────────────
console.log('\n📝 Updating captions with hashtags...');
const res = await fetch(`https://api.notion.com/v1/databases/${DB_ID}/query`, {
  method: 'POST', headers, body: JSON.stringify({ page_size: 100 })
});
const json = await res.json();

let updated = 0;
for (const page of json.results) {
  const title = page.properties.Title.title[0]?.plain_text;
  const currentCaption = page.properties.Caption?.rich_text?.[0]?.plain_text || '';

  // Skip if hashtags already added
  if (currentCaption.includes('#chronicillness')) {
    console.log(`⏭️  Already has hashtags: ${title}`);
    continue;
  }

  const newCaption = currentCaption + HASHTAGS;

  const upRes = await fetch(`https://api.notion.com/v1/pages/${page.id}`, {
    method: 'PATCH', headers,
    body: JSON.stringify({
      properties: {
        Caption: { rich_text: [{ type: 'text', text: { content: newCaption } }] }
      }
    })
  });
  if (!upRes.ok) { const e = await upRes.json(); console.error('Failed:', title, JSON.stringify(e)); }
  else { console.log(`✅ ${title}`); updated++; }
}

console.log(`\nDone. ${updated} captions updated.`);
