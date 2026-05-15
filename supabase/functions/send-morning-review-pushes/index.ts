import webPush from "npm:web-push@3.6.7";
import {
  countDueReviews,
  createServiceClient,
  getActiveSubscriptions,
  getLocalDateAndTime,
  getReminderPreferences,
  isInReminderWindow,
  jsonResponse,
  markSubscriptionFailure,
  markSubscriptionSuccess,
  signClickToken,
  updateDelivery,
  upsertDelivery,
} from "../_shared/reminders.ts";

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return jsonResponse({});
  if (req.method !== "POST") return jsonResponse({ error: "Method not allowed" }, { status: 405 });

  webPush.setVapidDetails(
    Deno.env.get("VAPID_SUBJECT") || "mailto:reminders@pattern-bank.app",
    Deno.env.get("VAPID_PUBLIC_KEY") || "",
    Deno.env.get("VAPID_PRIVATE_KEY") || "",
  );

  const now = new Date();
  const supabase = createServiceClient();
  const prefs = await getReminderPreferences(supabase);
  let considered = 0;
  let sent = 0;
  let failed = 0;

  for (const pref of prefs) {
    const local = getLocalDateAndTime(now, pref.timezone || "UTC");
    if (!isInReminderWindow(local.time, pref.morning_push_time)) continue;
    considered += 1;

    const dueCount = await countDueReviews(supabase, pref.user_id, local.date);
    if (dueCount <= 0) continue;

    const delivery = await upsertDelivery(supabase, {
      user_id: pref.user_id,
      local_date: local.date,
      stage: "morning_push",
      channel: "push",
      due_count: dueCount,
    });
    if (delivery.status === "sent") continue;

    const subscriptions = await getActiveSubscriptions(supabase, pref.user_id);
    if (subscriptions.length === 0) {
      await updateDelivery(supabase, delivery.id, {
        status: "failed_permanent",
        due_count: dueCount,
        error_details: "No active push subscriptions",
      });
      failed += 1;
      continue;
    }

    const clickToken = await signClickToken(delivery.id, pref.user_id);
    const payload = JSON.stringify({
      title: "PatternBank reviews due",
      body: `${dueCount} review${dueCount === 1 ? "" : "s"} ready for today.`,
      url: "/?tab=dashboard&reminder=review",
      deliveryId: delivery.id,
      clickToken,
      supabaseUrl: Deno.env.get("SUPABASE_URL"),
      tag: `patternbank-review-${pref.user_id}-${local.date}`,
    });

    let successful = 0;
    const errors: string[] = [];
    for (const sub of subscriptions) {
      try {
        await webPush.sendNotification({
          endpoint: sub.endpoint,
          keys: { p256dh: sub.p256dh, auth: sub.auth },
        }, payload);
        successful += 1;
        await markSubscriptionSuccess(supabase, sub.id);
      } catch (err) {
        const statusCode = typeof err === "object" && err && "statusCode" in err ? Number((err as { statusCode?: number }).statusCode) : 0;
        const permanent = statusCode === 404 || statusCode === 410;
        const message = err instanceof Error ? err.message : "Unknown push error";
        errors.push(message);
        await markSubscriptionFailure(supabase, sub, message, permanent);
      }
    }

    if (successful > 0) {
      await updateDelivery(supabase, delivery.id, {
        status: "sent",
        due_count: dueCount,
        sent_at: new Date().toISOString(),
        error_details: errors.length ? errors.join("; ").slice(0, 1000) : null,
      });
      sent += 1;
    } else {
      await updateDelivery(supabase, delivery.id, {
        status: "failed_transient",
        due_count: dueCount,
        error_details: errors.join("; ").slice(0, 1000) || "All push sends failed",
      });
      failed += 1;
    }
  }

  return jsonResponse({ ok: true, considered, sent, failed });
});
