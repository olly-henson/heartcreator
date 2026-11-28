// Latest activity list on the Hub's Sales tab (Olly, 2026-11-28): every applicant notification is also saved here,
// so he can see "Sarah Jones opened their video", "Steve Smith clicked Join" at the top of the tab and tick each Seen.
// KV key "feed:notes" = [{ id, cid, who, what, t (ISO), seen (ISO or null) }], newest first, last 150 kept.
// Lives only in KV (names never go in the repo, which is public). Read and ticked through /api/notes (behind Access).
export const FEED_KEY = "feed:notes";

export async function logFeed(env, item) {
  try {
    const list = (await env.HUB_KV.get(FEED_KEY, "json")) || [];
    list.unshift({
      id: Date.now().toString(36) + Math.random().toString(36).slice(2, 6),
      cid: String(item.cid || "").replace(/[^A-Za-z0-9_-]/g, ""),
      who: String(item.who || "An applicant").slice(0, 80),
      what: String(item.what || "").slice(0, 160),
      t: new Date().toISOString(),
      seen: null,
    });
    await env.HUB_KV.put(FEED_KEY, JSON.stringify(list.slice(0, 150)));
  } catch (e) {}
}
