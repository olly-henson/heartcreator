/**
 * fix_reels_hyphens.mjs
 * Rewrites captions to remove em-dash / hyphen heavy phrasing that reads as AI.
 * Replaces with full stops, line breaks or natural phrasing.
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

function cleanHyphens(text) {
  return text
    // " — " used as a clause separator → full stop + new sentence
    .replace(/ — /g, '. ')
    // Clean up any double spaces or ". ." artifacts
    .replace(/\. \./g, '.')
    .replace(/  +/g, ' ')
    // Clean up ". \n" → ".\n"
    .replace(/\. \n/g, '.\n');
}

const res = await fetch(`https://api.notion.com/v1/databases/${DB_ID}/query`, {
  method: 'POST', headers, body: JSON.stringify({ page_size: 100 })
});
const json = await res.json();

let updated = 0;
for (const page of json.results) {
  const title = page.properties.Title.title[0]?.plain_text;
  const currentCaption = page.properties.Caption?.rich_text?.[0]?.plain_text || '';
  if (!currentCaption) continue;

  const newCaption = cleanHyphens(currentCaption);
  if (newCaption === currentCaption) continue;

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
