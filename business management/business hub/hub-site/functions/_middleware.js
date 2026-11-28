// Privacy guard (2026-11-28): every deploy also gets its own copy at <id>.hub-ollyhenson.pages.dev
// (and <branch>.hub-ollyhenson.pages.dev). Cloudflare Access only covers the two main addresses below,
// so those copies would serve applicant data to anyone. Only the protected hosts (and local dev) get through.
const ALLOWED = new Set(["hub.ollyhenson.com", "hub-ollyhenson.pages.dev", "localhost", "127.0.0.1"]);

export async function onRequest({ request, next }) {
  const host = new URL(request.url).hostname.toLowerCase();
  if (!ALLOWED.has(host)) return new Response("Not found", { status: 404, headers: { "cache-control": "no-store" } });
  return next();
}
