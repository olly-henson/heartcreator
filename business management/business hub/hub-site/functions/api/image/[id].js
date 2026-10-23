// Cloudflare Pages Function — images attached to Story ideas.
//
// Route: /api/image/<id>   (GET to view, PUT to upload, DELETE to remove)
// Binding: env.HUB_KV — the same KV namespace as /api/state, keys "img:<id>".
//
// Images live in their own KV keys rather than inside the state record, so
// the record stays small and quick to save. The state only keeps the ids
// (state.stories.ideas[].images). Ids are random and never reused, so a GET
// can be cached for a long time.
//
// Auth: behind Cloudflare Access like the rest of the zone.

const MAX_BYTES = 8 * 1024 * 1024;
const ID_RE = /^[a-z0-9-]{8,64}$/;

function err(msg, status) {
  return new Response(JSON.stringify({ ok: false, error: msg }), {
    status,
    headers: { "content-type": "application/json; charset=utf-8", "cache-control": "no-store" },
  });
}

export async function onRequestGet({ params, env }) {
  if (!ID_RE.test(params.id)) return err("bad id", 400);
  const { value, metadata } = await env.HUB_KV.getWithMetadata("img:" + params.id, { type: "arrayBuffer" });
  if (!value) return err("not found", 404);
  return new Response(value, {
    headers: {
      "content-type": (metadata && metadata.type) || "image/jpeg",
      "cache-control": "private, max-age=31536000, immutable",
    },
  });
}

export async function onRequestPut({ params, request, env }) {
  if (!ID_RE.test(params.id)) return err("bad id", 400);
  const type = request.headers.get("content-type") || "";
  if (!/^image\/(jpeg|png|webp|gif)$/.test(type)) return err("images only", 415);
  const buf = await request.arrayBuffer();
  if (!buf.byteLength) return err("empty", 400);
  if (buf.byteLength > MAX_BYTES) return err("too large", 413);
  await env.HUB_KV.put("img:" + params.id, buf, { metadata: { type } });
  return new Response(JSON.stringify({ ok: true }), {
    headers: { "content-type": "application/json; charset=utf-8", "cache-control": "no-store" },
  });
}

export async function onRequestDelete({ params, env }) {
  if (!ID_RE.test(params.id)) return err("bad id", 400);
  await env.HUB_KV.delete("img:" + params.id);
  return new Response(JSON.stringify({ ok: true }), {
    headers: { "content-type": "application/json; charset=utf-8", "cache-control": "no-store" },
  });
}
