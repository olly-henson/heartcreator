// Web Push for the Hub (Olly, 2026-11-02): new-application notifications on his iPhone.
// Standard Web Push (RFC 8291 aes128gcm payload encryption + RFC 8292 VAPID), WebCrypto only, so it
// runs in Cloudflare Pages Functions with no npm packages.
//
// Secret: env.VAPID_JWK = the VAPID private key as a JSON Web Key (EC P-256, with d, x, y).
//         Set with `npx wrangler pages secret put VAPID_JWK --project-name hub-ollyhenson`. Never in a file.
// KV:     "push:subs" = [ { endpoint, keys:{ p256dh, auth }, ua, added } ] (one per device that tapped "Notify me").

const enc = new TextEncoder();

export function b64u(buf) {
  const b = new Uint8Array(buf); let s = "";
  for (let i = 0; i < b.length; i++) s += String.fromCharCode(b[i]);
  return btoa(s).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}
export function unb64u(str) {
  const s = atob(String(str).replace(/-/g, "+").replace(/_/g, "/") + "===".slice((String(str).length + 3) % 4));
  const out = new Uint8Array(s.length); for (let i = 0; i < s.length; i++) out[i] = s.charCodeAt(i); return out;
}
function cat(...parts) {
  const n = parts.reduce((a, p) => a + p.length, 0), out = new Uint8Array(n); let o = 0;
  parts.forEach((p) => { out.set(p, o); o += p.length; }); return out;
}
async function hkdf(salt, ikm, info, len) {
  const k = await crypto.subtle.importKey("raw", ikm, "HKDF", false, ["deriveBits"]);
  return new Uint8Array(await crypto.subtle.deriveBits({ name: "HKDF", hash: "SHA-256", salt, info }, k, len * 8));
}

// The browser-facing VAPID public key (65-byte uncompressed point, base64url), from the JWK's x and y.
export function vapidPublic(jwk) { return b64u(cat(new Uint8Array([4]), unb64u(jwk.x), unb64u(jwk.y))); }

export async function vapidAuth(endpoint, jwk, subject) {
  const aud = new URL(endpoint).origin;
  const head = b64u(enc.encode(JSON.stringify({ typ: "JWT", alg: "ES256" })));
  const body = b64u(enc.encode(JSON.stringify({ aud, exp: Math.floor(Date.now() / 1000) + 12 * 3600, sub: subject })));
  const key = await crypto.subtle.importKey("jwk", { kty: "EC", crv: "P-256", d: jwk.d, x: jwk.x, y: jwk.y, ext: true }, { name: "ECDSA", namedCurve: "P-256" }, false, ["sign"]);
  const sig = await crypto.subtle.sign({ name: "ECDSA", hash: "SHA-256" }, key, enc.encode(head + "." + body));
  return "vapid t=" + head + "." + body + "." + b64u(sig) + ", k=" + vapidPublic(jwk);
}

// RFC 8291: encrypt the payload for one subscription. `fixed` is only for tests.
export async function encrypt(sub, payload, fixed) {
  const uaPublic = unb64u(sub.keys.p256dh), auth = unb64u(sub.keys.auth);
  const as = fixed && fixed.as ? fixed.as : await crypto.subtle.generateKey({ name: "ECDH", namedCurve: "P-256" }, true, ["deriveBits"]);
  const asPublic = new Uint8Array(await crypto.subtle.exportKey("raw", as.publicKey));
  const uaKey = await crypto.subtle.importKey("raw", uaPublic, { name: "ECDH", namedCurve: "P-256" }, false, []);
  const shared = new Uint8Array(await crypto.subtle.deriveBits({ name: "ECDH", public: uaKey }, as.privateKey, 256));
  const ikm = await hkdf(auth, shared, cat(enc.encode("WebPush: info\0"), uaPublic, asPublic), 32);
  const salt = fixed && fixed.salt ? fixed.salt : crypto.getRandomValues(new Uint8Array(16));
  const cek = await hkdf(salt, ikm, enc.encode("Content-Encoding: aes128gcm\0"), 16);
  const nonce = await hkdf(salt, ikm, enc.encode("Content-Encoding: nonce\0"), 12);
  const key = await crypto.subtle.importKey("raw", cek, "AES-GCM", false, ["encrypt"]);
  const ct = new Uint8Array(await crypto.subtle.encrypt({ name: "AES-GCM", iv: nonce }, key, cat(enc.encode(payload), new Uint8Array([2]))));
  const rs = new Uint8Array([0, 0, 16, 0]); // record size 4096
  return cat(salt, rs, new Uint8Array([asPublic.length]), asPublic, ct);
}

// Send one notification to every saved device. Devices the push service says are gone (404/410) are removed.
export async function pushAll(env, msg) {
  const jwk = JSON.parse(env.VAPID_JWK || "null");
  if (!jwk || !jwk.d) return { ok: false, error: "VAPID_JWK secret is not set" };
  const subs = (await env.HUB_KV.get("push:subs", "json")) || [];
  const payload = JSON.stringify(msg), keep = [], results = [];
  for (const sub of subs) {
    try {
      const body = await encrypt(sub, payload);
      const r = await fetch(sub.endpoint, {
        method: "POST",
        headers: {
          Authorization: await vapidAuth(sub.endpoint, jwk, "mailto:olly@ollyhenson.com"),
          "Content-Encoding": "aes128gcm", "Content-Type": "application/octet-stream",
          TTL: "86400", Urgency: "high",
        },
        body,
      });
      results.push(r.status);
      if (r.status !== 404 && r.status !== 410) keep.push(sub);
    } catch (e) { results.push("error"); keep.push(sub); }
  }
  if (keep.length !== subs.length) await env.HUB_KV.put("push:subs", JSON.stringify(keep));
  return { ok: true, devices: subs.length, results };
}
