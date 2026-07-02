/**
 * fix_community_posts_emoji.mjs
 * Removes 😎 from all post sign-offs — it was added incorrectly to every post.
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

const res = await fetch(`https://api.notion.com/v1/databases/${DB_ID}/query`, {
  method: 'POST', headers, body: JSON.stringify({ page_size: 100 })
});
const json = await res.json();

let updated = 0;
for (const page of json.results) {
  const title = page.properties.Title.title[0]?.plain_text;
  const current = page.properties.Post?.rich_text?.[0]?.plain_text || '';
  if (!current.includes('😎')) continue;

  const cleaned = current.replace(/\nOlly 😎/g, '\nOlly');

  const upRes = await fetch(`https://api.notion.com/v1/pages/${page.id}`, {
    method: 'PATCH', headers,
    body: JSON.stringify({
      properties: {
        Post: { rich_text: [{ type: 'text', text: { content: cleaned } }] }
      }
    })
  });
  if (!upRes.ok) { const e = await upRes.json(); console.error('Failed:', title); }
  else { console.log(`✅ ${title}`); updated++; }
}

console.log(`\nDone. ${updated} posts updated.`);
