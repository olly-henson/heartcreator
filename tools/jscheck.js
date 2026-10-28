// Syntax-check every inline <script> in an HTML file (no JSON blocks, no src= scripts).
// Usage: node jscheck.js FILE.html   -> prints "JS OK (n scripts)" or the first error per script, exit 1 on error.
const fs = require('fs');
const s = fs.readFileSync(process.argv[2], 'utf8');
let n = 0, bad = 0;
for (const m of s.matchAll(/<script(\s[^>]*)?>([\s\S]*?)<\/script>/g)) {
  const attrs = m[1] || '';
  if (/src=|type="application\/json"|type="application\/ld\+json"/.test(attrs)) continue;
  n++;
  try { new Function(m[2]); } catch (e) { bad++; console.log(`script ${n}: ${e.message}`); }
}
if (bad) process.exit(1);
console.log(`JS OK (${n} scripts)`);
