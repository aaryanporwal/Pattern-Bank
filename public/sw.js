/* global clients */

const TRACK_PATH = "/functions/v1/track-notification-click";

self.addEventListener("push", (event) => {
  let data = {};
  try {
    data = event.data ? event.data.json() : {};
  } catch {
    data = {};
  }

  event.waitUntil(self.registration.showNotification(data.title || "PatternBank review", {
    body: data.body || "You have reviews due today.",
    icon: "/favicon-192.png",
    badge: "/favicon-192.png",
    tag: data.tag || "patternbank-review-reminder",
    data: {
      url: data.url || "/?tab=dashboard&reminder=review",
      clickToken: data.clickToken || null,
      deliveryId: data.deliveryId || null,
      supabaseUrl: data.supabaseUrl || null,
    },
  }));
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  const data = event.notification.data || {};
  const targetUrl = new URL(data.url || "/", self.location.origin);
  if (data.clickToken) targetUrl.searchParams.set("notification_click_token", data.clickToken);
  if (data.deliveryId) targetUrl.searchParams.set("notification_delivery_id", data.deliveryId);

  event.waitUntil((async () => {
    if (data.clickToken && data.supabaseUrl) {
      try {
        await fetch(`${data.supabaseUrl}${TRACK_PATH}`, {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({ clickToken: data.clickToken }),
        });
      } catch {
        // The opened app carries the token in the URL as a fallback.
      }
    }

    const allClients = await clients.matchAll({ type: "window", includeUncontrolled: true });
    const existing = allClients.find((client) => "focus" in client);
    if (existing) {
      await existing.navigate(targetUrl.href);
      return existing.focus();
    }
    return clients.openWindow(targetUrl.href);
  })());
});
