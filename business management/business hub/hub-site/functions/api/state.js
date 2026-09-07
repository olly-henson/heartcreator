// Cloudflare Pages Function — GET/PUT the single shared Business Hub record.
//
// Route: /api/state   (this file's path under functions/ is the route)
// Binding: env.HUB_KV  — a Workers KV namespace (set in the Pages project's
//          Settings → Functions → KV namespace bindings, or in wrangler.toml)
//
// Record shape stored in KV under key "record":
//   { rev: <int>, updatedAt: <ISO string>, state: <the app's state object> }
//
// Concurrency: the client sends the `rev` it last saw. If it no longer
// matches, we return 409 with the current record so the client can ask the
// user before overwriting. A `force: true` body skips that check.
//
// Auth: the whole hub.ollyhenson.com zone sits behind Cloudflare Access, so
// only an authenticated session reaches this function at all — no extra
// check needed here. (If Access is ever removed, add one.)

const KEY = "record";

function json(body, status) {
  return new Response(JSON.stringify(body), {
    status: status || 200,
    headers: {
      "content-type": "application/json; charset=utf-8",
      "cache-control": "no-store",
    },
  });
}

async function readRecord(env) {
  const raw = await env.HUB_KV.get(KEY);
  if (!raw) return { rev: 0, updatedAt: null, state: null };
  try {
    return JSON.parse(raw);
  } catch {
    return { rev: 0, updatedAt: null, state: null };
  }
}

export async function onRequestGet({ env }) {
  if (!env.HUB_KV) return json({ error: "HUB_KV binding missing" }, 500);
  return json(await readRecord(env));
}

export async function onRequestPut({ request, env }) {
  if (!env.HUB_KV) return json({ error: "HUB_KV binding missing" }, 500);

  let body;
  try {
    body = await request.json();
  } catch {
    return json({ ok: false, error: "invalid JSON body" }, 400);
  }
  if (!body || typeof body !== "object" || typeof body.state !== "object" || body.state === null) {
    return json({ ok: false, error: "body.state must be an object" }, 400);
  }

  const incomingRev = Number(body.rev) || 0;
  const force = body.force === true;
  const current = await readRecord(env);

  if (!force && incomingRev !== current.rev) {
    return json(
      { ok: false, conflict: true, rev: current.rev, updatedAt: current.updatedAt, state: current.state },
      409
    );
  }

  const next = {
    rev: current.rev + 1,
    updatedAt: new Date().toISOString(),
    state: body.state,
  };
  await env.HUB_KV.put(KEY, JSON.stringify(next));
  return json({ ok: true, rev: next.rev, updatedAt: next.updatedAt });
}
