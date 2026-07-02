/**
 * fix_community_posts.mjs
 * - Removes em-dash hyphens from post copy
 * - Adds 😎 emoji to sign-offs on non-engagement posts
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

const DB_ID = '36e30e58-6a0d-81d1-8d13-e38b0136d61e';

function cleanPost(text, type) {
  let cleaned = text
    .replace(/ — /g, '. ')
    .replace(/\. \./g, '.')
    .replace(/  +/g, ' ')
    .replace(/\. \n/g, '.\n');

  // Add 😎 to sign-off on non-engagement posts
  if (type !== 'Engagement') {
    cleaned = cleaned.replace(/\nOlly$/, '\nOlly 😎');
  }

  return cleaned;
}

const res = await fetch(`https://api.notion.com/v1/databases/${DB_ID}/query`, {
  method: 'POST', headers, body: JSON.stringify({ page_size: 100 })
});
const json = await res.json();

let updated = 0;
for (const page of json.results) {
  const title = page.properties.Title.title[0]?.plain_text;
  const type = page.properties['Type of Post']?.select?.name;
  const current = page.properties.Post?.rich_text?.[0]?.plain_text || '';
  if (!current) continue;

  const cleaned = cleanPost(current, type);
  if (cleaned === current) { console.log(`⏭️  No changes: ${title}`); continue; }

  const upRes = await fetch(`https://api.notion.com/v1/pages/${page.id}`, {
    method: 'PATCH', headers,
    body: JSON.stringify({
      properties: {
        Post: { rich_text: [{ type: 'text', text: { content: cleaned } }] }
      }
    })
  });
  if (!upRes.ok) { const e = await upRes.json(); console.error('Failed:', title, JSON.stringify(e)); }
  else { console.log(`✅ ${title}`); updated++; }
}

console.log(`\nDone. ${updated} posts updated.`);
