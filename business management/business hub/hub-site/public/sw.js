// Business Hub service worker (2026-11-02): only shows new-application notifications and opens the Hub
// on that applicant's Looms screen when one is tapped.
// 2026-11-05: also keeps a copy of the Hub page itself (network first), so it still opens with no signal for recording.
// Only page loads are touched; /api calls always go to the network.
self.addEventListener("install", function () { self.skipWaiting(); });
self.addEventListener("activate", function (e) { e.waitUntil(self.clients.claim()); });

self.addEventListener("push", function (e) {
  var d = {};
  try { d = e.data ? e.data.json() : {}; } catch (x) {}
  e.waitUntil(self.registration.showNotification(d.title || "New application", {
    body: d.body || "Tap to review it in the Looms tab.",
    tag: d.tag || "hub",
    data: { url: d.url || "/#looms" }
  }));
});

self.addEventListener("notificationclick", function (e) {
  e.notification.close();
  var url = new URL((e.notification.data && e.notification.data.url) || "/#looms", self.location.origin).href;
  e.waitUntil(self.clients.matchAll({ type: "window", includeUncontrolled: true }).then(function (list) {
    for (var i = 0; i < list.length; i++) {
      if ("focus" in list[i]) { list[i].postMessage({ open: url }); return list[i].focus(); }
    }
    return self.clients.openWindow(url);
  }));
});

var PAGE_CACHE = "hub-page-v1";
self.addEventListener("fetch", function (e) {
  var r = e.request;
  if (r.method !== "GET" || r.mode !== "navigate") return;
  var u = new URL(r.url);
  if (u.origin !== self.location.origin || u.pathname.indexOf("/api/") === 0) return;
  e.respondWith(fetch(r).then(function (res) {
    if (res && res.ok && res.type === "basic" && !res.redirected) {
      var copy = res.clone();
      caches.open(PAGE_CACHE).then(function (c) { c.put("/", copy); }).catch(function () {});
    }
    return res;
  }).catch(function () {
    return caches.open(PAGE_CACHE).then(function (c) { return c.match("/"); }).then(function (hit) {
      return hit || new Response("<p style='font:16px system-ui;padding:24px'>No signal, and the Hub hasn't been saved on this phone yet. Open it once with a connection.</p>", { headers: { "content-type": "text/html" } });
    });
  }));
});
