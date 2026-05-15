import { createServiceClient, getAuthenticatedUser, jsonResponse } from "../_shared/reminders.ts";

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return jsonResponse({});
  if (req.method !== "POST") return jsonResponse({ error: "Method not allowed" }, { status: 405 });

  const user = await getAuthenticatedUser(req);
  if (!user) return jsonResponse({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json().catch(() => null);
  if (!body?.endpoint || !body?.p256dh || !body?.auth) {
    return jsonResponse({ error: "Invalid subscription" }, { status: 400 });
  }

  const supabase = createServiceClient();
  const timezone = typeof body.timezone === "string" ? body.timezone : "UTC";
  const { error } = await supabase
    .from("notification_subscriptions")
    .upsert({
      user_id: user.id,
      endpoint: body.endpoint,
      p256dh: body.p256dh,
      auth: body.auth,
      timezone,
      platform: body.platform ?? null,
      user_agent: body.userAgent ?? null,
      enabled: body.enabled ?? true,
      failure_count: 0,
      last_error: null,
      updated_at: new Date().toISOString(),
    }, { onConflict: "endpoint" });
  if (error) return jsonResponse({ error: error.message }, { status: 500 });

  await supabase
    .from("notification_preferences")
    .upsert({
      user_id: user.id,
      reminders_enabled: Boolean(body.enabled ?? true),
      timezone,
      updated_at: new Date().toISOString(),
    }, { onConflict: "user_id" });

  return jsonResponse({ ok: true });
});
