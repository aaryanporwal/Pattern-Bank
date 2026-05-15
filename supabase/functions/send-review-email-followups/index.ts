import {
  countDueReviews,
  createServiceClient,
  getLocalDateAndTime,
  getReminderPreferences,
  isInReminderWindow,
  jsonResponse,
  sendReminderEmail,
  updateDelivery,
  upsertDelivery,
  userEmail,
} from "../_shared/reminders.ts";

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return jsonResponse({});
  if (req.method !== "POST") return jsonResponse({ error: "Method not allowed" }, { status: 405 });

  const now = new Date();
  const supabase = createServiceClient();
  const prefs = (await getReminderPreferences(supabase)).filter((pref) => pref.email_enabled);
  let immediateSent = 0;
  let eveningSent = 0;
  let skipped = 0;

  for (const pref of prefs) {
    const local = getLocalDateAndTime(now, pref.timezone || "UTC");
    const dueCount = await countDueReviews(supabase, pref.user_id, local.date);
    if (dueCount <= 0) {
      skipped += 1;
      continue;
    }

    const { data: morning } = await supabase
      .from("notification_deliveries")
      .select("*")
      .eq("user_id", pref.user_id)
      .eq("local_date", local.date)
      .eq("stage", "morning_push")
      .eq("channel", "push")
      .maybeSingle();

    if (morning && morning.status !== "sent") {
      const delivery = await upsertDelivery(supabase, {
        user_id: pref.user_id,
        local_date: local.date,
        stage: "immediate_email",
        channel: "email",
        due_count: dueCount,
      });
      if (delivery.status !== "sent") {
        const email = await userEmail(supabase, pref.user_id);
        if (email) {
          await sendReminderEmail(email, dueCount, "immediate_email");
          await updateDelivery(supabase, delivery.id, {
            status: "sent",
            due_count: dueCount,
            sent_at: new Date().toISOString(),
          });
          immediateSent += 1;
        }
      }
      continue;
    }

    if (!morning || morning.status !== "sent" || morning.clicked_at) {
      skipped += 1;
      continue;
    }

    if (!isInReminderWindow(local.time, pref.evening_followup_time)) {
      skipped += 1;
      continue;
    }

    if (morning.sent_at) {
      const { count } = await supabase
        .from("review_log")
        .select("id", { count: "exact", head: true })
        .eq("user_id", pref.user_id)
        .gte("created_at", morning.sent_at);
      if ((count ?? 0) >= morning.due_count) {
        await updateDelivery(supabase, morning.id, { reviewed_after_send: true });
        skipped += 1;
        continue;
      }
    }

    const delivery = await upsertDelivery(supabase, {
      user_id: pref.user_id,
      local_date: local.date,
      stage: "evening_email",
      channel: "email",
      due_count: dueCount,
    });
    if (delivery.status === "sent") continue;

    const email = await userEmail(supabase, pref.user_id);
    if (email) {
      await sendReminderEmail(email, dueCount, "evening_email");
      await updateDelivery(supabase, delivery.id, {
        status: "sent",
        due_count: dueCount,
        sent_at: new Date().toISOString(),
      });
      eveningSent += 1;
    }
  }

  return jsonResponse({ ok: true, immediateSent, eveningSent, skipped });
});
