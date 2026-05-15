import webPush from "npm:web-push@3.6.7";
import {
  createServiceClient,
  getActiveSubscriptions,
  getAuthenticatedUser,
  jsonResponse,
  markSubscriptionFailure,
  markSubscriptionSuccess,
} from "../_shared/reminders.ts";

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return jsonResponse({});
  if (req.method !== "POST") return jsonResponse({ error: "Method not allowed" }, { status: 405 });
  const user = await getAuthenticatedUser(req);
  if (!user) return jsonResponse({ error: "Unauthorized" }, { status: 401 });

  webPush.setVapidDetails(
    Deno.env.get("VAPID_SUBJECT") || "mailto:reminders@pattern-bank.app",
    Deno.env.get("VAPID_PUBLIC_KEY") || "",
    Deno.env.get("VAPID_PRIVATE_KEY") || "",
  );

  const supabase = createServiceClient();
  const subscriptions = await getActiveSubscriptions(supabase, user.id);
  if (!subscriptions.length) return jsonResponse({ error: "No active push subscriptions" }, { status: 400 });

  const payload = JSON.stringify({
    title: "PatternBank test",
    body: "Push reminders are working.",
    url: "/?tab=dashboard",
    supabaseUrl: Deno.env.get("SUPABASE_URL"),
    tag: `patternbank-test-${user.id}`,
  });

  let sent = 0;
  for (const sub of subscriptions) {
    try {
      await webPush.sendNotification({
        endpoint: sub.endpoint,
        keys: { p256dh: sub.p256dh, auth: sub.auth },
      }, payload);
      sent += 1;
      await markSubscriptionSuccess(supabase, sub.id);
    } catch (err) {
      const statusCode = typeof err === "object" && err && "statusCode" in err ? Number((err as { statusCode?: number }).statusCode) : 0;
      await markSubscriptionFailure(supabase, sub, err instanceof Error ? err.message : "Unknown push error", statusCode === 404 || statusCode === 410);
    }
  }

  if (sent === 0) return jsonResponse({ error: "No test push could be sent" }, { status: 500 });
  return jsonResponse({ ok: true, sent });
});
