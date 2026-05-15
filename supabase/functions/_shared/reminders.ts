import { createClient } from "https://esm.sh/@supabase/supabase-js@2.97.0";

export const corsHeaders = {
  "access-control-allow-origin": "*",
  "access-control-allow-headers": "authorization, x-client-info, apikey, content-type",
  "access-control-allow-methods": "POST, OPTIONS",
};

export type SupabaseAdmin = ReturnType<typeof createServiceClient>;

export interface NotificationPreference {
  user_id: string;
  reminders_enabled: boolean;
  email_enabled: boolean;
  morning_push_time: string;
  evening_followup_time: string;
  timezone: string;
}

export interface PushSubscriptionRow {
  id: string;
  user_id: string;
  endpoint: string;
  p256dh: string;
  auth: string;
  timezone: string;
  platform: string | null;
  enabled: boolean;
  failure_count: number;
}

export interface NotificationDelivery {
  id: string;
  user_id: string;
  local_date: string;
  stage: "morning_push" | "immediate_email" | "evening_email" | "test_push";
  channel: "push" | "email";
  status: "pending" | "sent" | "failed_transient" | "failed_permanent" | "skipped";
  due_count: number;
  sent_at: string | null;
  clicked_at: string | null;
  reviewed_after_send: boolean;
}

export function jsonResponse(body: unknown, init: ResponseInit = {}) {
  return new Response(JSON.stringify(body), {
    ...init,
    headers: {
      "content-type": "application/json",
      ...corsHeaders,
      ...(init.headers ?? {}),
    },
  });
}

export function createServiceClient() {
  const url = Deno.env.get("SUPABASE_URL");
  const key = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  if (!url || !key) throw new Error("Missing Supabase service credentials");
  return createClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

export async function getAuthenticatedUser(req: Request) {
  const url = Deno.env.get("SUPABASE_URL");
  const anon = Deno.env.get("SUPABASE_ANON_KEY");
  if (!url || !anon) throw new Error("Missing Supabase auth credentials");
  const authHeader = req.headers.get("authorization") ?? "";
  const client = createClient(url, anon, {
    global: { headers: { authorization: authHeader } },
    auth: { persistSession: false, autoRefreshToken: false },
  });
  const { data, error } = await client.auth.getUser();
  if (error || !data.user) return null;
  return data.user;
}

export function getLocalDateAndTime(now: Date, timezone: string) {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: timezone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).formatToParts(now);
  const values = Object.fromEntries(parts.map((part) => [part.type, part.value]));
  return {
    date: `${values.year}-${values.month}-${values.day}`,
    time: `${values.hour}:${values.minute}`,
  };
}

export function isInReminderWindow(localTime: string, configuredTime: string, windowMinutes = 5) {
  const [hour, minute] = localTime.split(":").map(Number);
  const [targetHour, targetMinute] = configuredTime.slice(0, 5).split(":").map(Number);
  const current = hour * 60 + minute;
  const target = targetHour * 60 + targetMinute;
  return current >= target && current < target + windowMinutes;
}

export async function countDueReviews(supabase: SupabaseAdmin, userId: string, localDate: string) {
  const { count, error } = await supabase
    .from("problems")
    .select("id", { count: "exact", head: true })
    .eq("user_id", userId)
    .eq("exclude_from_review", false)
    .lte("next_review_date", localDate);
  if (error) throw error;
  return count ?? 0;
}

export async function upsertDelivery(
  supabase: SupabaseAdmin,
  row: {
    user_id: string;
    local_date: string;
    stage: NotificationDelivery["stage"];
    channel: NotificationDelivery["channel"];
    status?: NotificationDelivery["status"];
    due_count: number;
    sent_at?: string | null;
    error_details?: string | null;
  },
) {
  const { data, error } = await supabase
    .from("notification_deliveries")
    .upsert({
      status: "pending",
      ...row,
      updated_at: new Date().toISOString(),
    }, { onConflict: "user_id,local_date,stage,channel", ignoreDuplicates: true })
    .select("*")
    .single();
  if (error) throw error;
  return data as NotificationDelivery;
}

export async function updateDelivery(
  supabase: SupabaseAdmin,
  id: string,
  updates: Partial<NotificationDelivery> & { error_details?: string | null },
) {
  const { error } = await supabase
    .from("notification_deliveries")
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq("id", id);
  if (error) throw error;
}

export async function getActiveSubscriptions(supabase: SupabaseAdmin, userId: string) {
  const { data, error } = await supabase
    .from("notification_subscriptions")
    .select("*")
    .eq("user_id", userId)
    .eq("enabled", true);
  if (error) throw error;
  return (data ?? []) as PushSubscriptionRow[];
}

export async function markSubscriptionSuccess(supabase: SupabaseAdmin, id: string) {
  await supabase
    .from("notification_subscriptions")
    .update({
      failure_count: 0,
      last_success_at: new Date().toISOString(),
      last_error: null,
      updated_at: new Date().toISOString(),
    })
    .eq("id", id);
}

export async function markSubscriptionFailure(supabase: SupabaseAdmin, sub: PushSubscriptionRow, message: string, permanent: boolean) {
  await supabase
    .from("notification_subscriptions")
    .update({
      enabled: permanent ? false : sub.enabled,
      failure_count: sub.failure_count + 1,
      last_failure_at: new Date().toISOString(),
      last_error: message.slice(0, 500),
      updated_at: new Date().toISOString(),
    })
    .eq("id", sub.id);
}

export async function getReminderPreferences(supabase: SupabaseAdmin) {
  const { data, error } = await supabase
    .from("notification_preferences")
    .select("*")
    .eq("reminders_enabled", true);
  if (error) throw error;
  return (data ?? []) as NotificationPreference[];
}

export async function userEmail(supabase: SupabaseAdmin, userId: string) {
  const { data, error } = await supabase.auth.admin.getUserById(userId);
  if (error) throw error;
  return data.user?.email ?? null;
}

function base64UrlEncode(bytes: ArrayBuffer) {
  const binary = String.fromCharCode(...new Uint8Array(bytes));
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

async function hmac(message: string, secret: string) {
  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
  return base64UrlEncode(await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(message)));
}

export async function signClickToken(deliveryId: string, userId: string) {
  const secret = Deno.env.get("WEB_PUSH_CLICK_SECRET") || Deno.env.get("VAPID_PRIVATE_KEY");
  if (!secret) throw new Error("Missing click token secret");
  const payload = `${deliveryId}.${userId}`;
  const signature = await hmac(payload, secret);
  return `${payload}.${signature}`;
}

export async function verifyClickToken(token: string) {
  const secret = Deno.env.get("WEB_PUSH_CLICK_SECRET") || Deno.env.get("VAPID_PRIVATE_KEY");
  if (!secret) throw new Error("Missing click token secret");
  const parts = token.split(".");
  if (parts.length !== 3) return null;
  const [deliveryId, userId, signature] = parts;
  const expected = await hmac(`${deliveryId}.${userId}`, secret);
  if (signature !== expected) return null;
  return { deliveryId, userId };
}

export async function sendReminderEmail(email: string, dueCount: number, stage: "immediate_email" | "evening_email") {
  const apiKey = Deno.env.get("RESEND_API_KEY");
  const from = Deno.env.get("REMINDER_EMAIL_FROM");
  if (!apiKey || !from) throw new Error("Missing Resend configuration");
  const appUrl = Deno.env.get("APP_URL") || "https://pattern-bank.vercel.app";
  const subject = stage === "immediate_email"
    ? `${dueCount} PatternBank review${dueCount === 1 ? "" : "s"} due`
    : `Still due: ${dueCount} PatternBank review${dueCount === 1 ? "" : "s"}`;
  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      authorization: `Bearer ${apiKey}`,
      "content-type": "application/json",
    },
    body: JSON.stringify({
      from,
      to: email,
      subject,
      html: `<p>You have ${dueCount} PatternBank review${dueCount === 1 ? "" : "s"} due.</p><p><a href="${appUrl}/?tab=dashboard&reminder=review">Open PatternBank</a></p>`,
    }),
  });
  if (!response.ok) {
    throw new Error(`Resend failed with ${response.status}: ${await response.text()}`);
  }
}
