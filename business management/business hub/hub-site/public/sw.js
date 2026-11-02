// Business Hub service worker (2026-11-02): only shows new-application notifications and opens the Hub
// on that applicant's Looms screen when one is tapped. No fetch handler, so it never caches or changes page loads.
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
