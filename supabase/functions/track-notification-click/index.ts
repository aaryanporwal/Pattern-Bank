import { createServiceClient, getAuthenticatedUser, jsonResponse, verifyClickToken } from "../_shared/reminders.ts";

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return jsonResponse({});
  if (req.method !== "POST") return jsonResponse({ error: "Method not allowed" }, { status: 405 });

  const body = await req.json().catch(() => null);
  const supabase = createServiceClient();
  let deliveryId = typeof body?.deliveryId === "string" ? body.deliveryId : null;
  let userId = null as string | null;

  if (typeof body?.clickToken === "string") {
    const verified = await verifyClickToken(body.clickToken);
    if (!verified) return jsonResponse({ error: "Invalid click token" }, { status: 400 });
    deliveryId = verified.deliveryId;
    userId = verified.userId;
  } else {
    const user = await getAuthenticatedUser(req);
    if (!user) return jsonResponse({ error: "Unauthorized" }, { status: 401 });
    userId = user.id;
  }

  if (!deliveryId || !userId) return jsonResponse({ error: "Missing delivery" }, { status: 400 });
  const { error } = await supabase
    .from("notification_deliveries")
    .update({ clicked_at: new Date().toISOString(), updated_at: new Date().toISOString() })
    .eq("id", deliveryId)
    .eq("user_id", userId)
    .eq("stage", "morning_push")
    .eq("channel", "push");
  if (error) return jsonResponse({ error: error.message }, { status: 500 });
  return jsonResponse({ ok: true });
});
