import { useCallback, useEffect, useMemo, useState } from "react";
import { saveNotificationSubscription, sendTestNotification, trackNotificationClick } from "../utils/supabaseData";
import { supabase } from "../utils/supabaseClient";

export type PushReminderStatus =
  | "unsupported"
  | "needs-ios-install"
  | "permission-denied"
  | "not-subscribed"
  | "subscribed"
  | "failed";

function isStandalonePwa(): boolean {
  return window.matchMedia("(display-mode: standalone)").matches || ("standalone" in navigator && Boolean((navigator as Navigator & { standalone?: boolean }).standalone));
}

function isIosLike(): boolean {
  return /iPad|iPhone|iPod/.test(navigator.userAgent) || (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1);
}

function urlBase64ToArrayBuffer(base64String: string): ArrayBuffer {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; i += 1) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray.buffer as ArrayBuffer;
}

function detectPlatform(): string {
  if (isIosLike()) return "ios-pwa";
  if (/Android/i.test(navigator.userAgent)) return "android";
  if (/Mac/i.test(navigator.platform)) return "macos";
  if (/Win/i.test(navigator.platform)) return "windows";
  return "web";
}

export default function useReviewReminders(userId: string | null, enabled: boolean) {
  const publicVapidKey = import.meta.env.VITE_VAPID_PUBLIC_KEY;
  const [status, setStatus] = useState<PushReminderStatus>("unsupported");
  const [busy, setBusy] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const supported = useMemo(() => {
    return Boolean("serviceWorker" in navigator && "PushManager" in window && "Notification" in window && publicVapidKey);
  }, [publicVapidKey]);

  const refreshStatus = useCallback(async () => {
    setErrorMessage(null);
    if (!supported) {
      setStatus("unsupported");
      return;
    }
    if (isIosLike() && !isStandalonePwa()) {
      setStatus("needs-ios-install");
      return;
    }
    if (Notification.permission === "denied") {
      setStatus("permission-denied");
      return;
    }
    try {
      const registration = await navigator.serviceWorker.getRegistration("/");
      const subscription = await registration?.pushManager.getSubscription();
      setStatus(subscription ? "subscribed" : "not-subscribed");
    } catch {
      setStatus("failed");
    }
  }, [supported]);

  useEffect(() => {
    refreshStatus();
  }, [refreshStatus]);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const clickToken = params.get("notification_click_token");
    if (!clickToken) return;
    trackNotificationClick(clickToken);
    params.delete("notification_click_token");
    params.delete("notification_delivery_id");
    const next = `${window.location.pathname}${params.toString() ? `?${params}` : ""}${window.location.hash}`;
    window.history.replaceState({}, "", next);
  }, []);

  const subscribe = useCallback(async () => {
    if (!userId) {
      setErrorMessage("Sign in to enable review reminders.");
      return false;
    }
    if (!supported) {
      setErrorMessage(publicVapidKey ? "Push notifications are not supported in this browser." : "Push reminders are not configured yet.");
      setStatus("unsupported");
      return false;
    }
    if (isIosLike() && !isStandalonePwa()) {
      setStatus("needs-ios-install");
      return false;
    }

    setBusy(true);
    setErrorMessage(null);
    try {
      const permission = await Notification.requestPermission();
      if (permission === "denied") {
        setStatus("permission-denied");
        return false;
      }
      if (permission !== "granted") {
        setStatus("not-subscribed");
        return false;
      }

      if (!publicVapidKey) {
        throw new Error("Push reminders are not configured yet.");
      }
      const registration = await navigator.serviceWorker.register("/sw.js", { scope: "/" });
      const existing = await registration.pushManager.getSubscription();
      const subscription = existing ?? await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToArrayBuffer(publicVapidKey),
      });
      const json = subscription.toJSON();
      if (!json.endpoint || !json.keys?.p256dh || !json.keys?.auth) {
        throw new Error("Browser returned an incomplete push subscription.");
      }
      const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC";
      const { error } = await saveNotificationSubscription({
        endpoint: json.endpoint,
        p256dh: json.keys.p256dh,
        auth: json.keys.auth,
        timezone,
        platform: detectPlatform(),
        userAgent: navigator.userAgent,
        enabled: true,
      });
      if (error) throw error;
      setStatus("subscribed");
      return true;
    } catch (err) {
      console.error("Failed to subscribe to review reminders", err);
      setStatus("failed");
      setErrorMessage(err instanceof Error ? err.message : "Could not save this push subscription.");
      return false;
    } finally {
      setBusy(false);
    }
  }, [publicVapidKey, supported, userId]);

  const sendTest = useCallback(async () => {
    setBusy(true);
    setErrorMessage(null);
    try {
      const { error } = await sendTestNotification();
      if (error) throw error;
      return true;
    } catch (err) {
      setErrorMessage(err instanceof Error ? err.message : "Could not send a test notification.");
      return false;
    } finally {
      setBusy(false);
    }
  }, []);

  useEffect(() => {
    if (!userId || !enabled || status === "subscribed") return;
    if (supabase) refreshStatus();
  }, [enabled, refreshStatus, status, userId]);

  return { status, busy, errorMessage, subscribe, sendTest, refreshStatus };
}
