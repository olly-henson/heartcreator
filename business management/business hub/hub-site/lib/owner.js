// Olly's own visits never count in the funnel stats (Olly, 2026-11-10: "remove my ip from any clicks so it doesn't
// warp the results when I'm testing").
// Every time he opens the Hub (behind Cloudflare Access, so it can only be him) his current internet address is saved
// in KV "ownerips" as { "<address>": lastSeenMs }. /api/track skips visits from those addresses.
// Phones and home internet change address, so: kept for 30 days after he was last seen on it, and IPv6 addresses are
// matched on their first 4 blocks (the /64 network), because phones rotate the rest.

const KEY = "ownerips";
const KEEP_MS = 30 * 24 * 3600 * 1000;

function ipKey(ip) {
  ip = String(ip || "").trim().toLowerCase();
  if (!ip) return "";
  if (ip.indexOf(":") === -1) return ip; // IPv4: exact
  let full = ip;
  if (ip.indexOf("::") !== -1) { // expand :: so the first 4 blocks are right
    const [a, b] = ip.split("::"), ha = a ? a.split(":") : [], hb = b ? b.split(":") : [];
    full = ha.concat(Array(8 - ha.length - hb.length).fill("0"), hb).join(":");
  }
  return full.split(":").slice(0, 4).map(function (h) { return h.replace(/^0+(?=.)/, ""); }).join(":") + "::/64";
}
async function readIps(env) {
  try { return JSON.parse((await env.HUB_KV.get(KEY)) || "{}") || {}; } catch { return {}; }
}

export async function rememberOwner(env, request) {
  const k = ipKey(request.headers.get("cf-connecting-ip"));
  if (!k || !env.HUB_KV) return;
  const ips = await readIps(env), now = Date.now();
  if (ips[k] && now - ips[k] < 3600 * 1000) return; // seen in the last hour: no write
  ips[k] = now;
  Object.keys(ips).forEach(function (x) { if (now - ips[x] > KEEP_MS) delete ips[x]; });
  await env.HUB_KV.put(KEY, JSON.stringify(ips));
}

export async function isOwner(env, request) {
  const k = ipKey(request.headers.get("cf-connecting-ip"));
  if (!k) return false;
  const ips = await readIps(env);
  return !!ips[k] && Date.now() - ips[k] < KEEP_MS;
}
