import type { Preferences } from "../types";
import useReviewReminders from "../hooks/useReviewReminders";
import type { User } from "@supabase/supabase-js";

interface Props {
  user: User | null;
  preferences: Preferences;
  onUpdatePreferences: (updates: Partial<Preferences>) => void;
  showToast: (message: string) => void;
}

const STATUS_COPY = {
  unsupported: "Push is unavailable",
  "needs-ios-install": "Install to Home Screen",
  "permission-denied": "Permission denied",
  "not-subscribed": "Push not enabled",
  subscribed: "Push subscribed",
  failed: "Push setup failed",
};

export default function NotificationReminderSection({ user, preferences, onUpdatePreferences, showToast }: Props) {
  const reminders = useReviewReminders(user?.id ?? null, preferences.reviewRemindersEnabled ?? false);

  const handleToggle = async () => {
    if (!preferences.reviewRemindersEnabled) {
      const subscribed = await reminders.subscribe();
      if (!subscribed) return;
      onUpdatePreferences({
        reviewRemindersEnabled: true,
        reminderTimezone: Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC",
      });
      showToast("Review reminders enabled");
      return;
    }
    onUpdatePreferences({ reviewRemindersEnabled: false });
    showToast("Review reminders disabled");
  };

  const sendTest = async () => {
    const ok = await reminders.sendTest();
    if (ok) showToast("Test notification sent");
  };

  return (
    <div>
      <label className="mb-1.5 block text-[13px] font-semibold uppercase tracking-wide text-pb-text-muted">
        Review Reminders
      </label>
      <div className="rounded-lg border border-pb-border bg-pb-bg/40 p-3">
        <button
          onClick={handleToggle}
          disabled={!user || reminders.busy}
          className="flex w-full cursor-pointer items-center justify-between rounded-lg border border-pb-border bg-transparent px-3 py-2.5 text-left transition-colors duration-150 hover:border-pb-text-muted disabled:cursor-not-allowed disabled:opacity-60"
        >
          <span className="text-sm text-pb-text">
            {preferences.reviewRemindersEnabled ? "On" : "Off"}
          </span>
          <span
            className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors duration-200 ${
              preferences.reviewRemindersEnabled ? "bg-pb-accent" : "bg-pb-border"
            }`}
          >
            <span
              className={`inline-block h-3.5 w-3.5 rounded-full bg-white transition-transform duration-200 ${
                preferences.reviewRemindersEnabled ? "translate-x-[18px]" : "translate-x-[3px]"
              }`}
            />
          </span>
        </button>

        <div className="mt-3 grid grid-cols-2 gap-2 text-xs">
          <div className="rounded-md border border-pb-border px-2.5 py-2">
            <div className="font-medium text-pb-text">Push</div>
            <div className="mt-0.5 text-pb-text-muted">{STATUS_COPY[reminders.status]}</div>
          </div>
          <div className="rounded-md border border-pb-border px-2.5 py-2">
            <div className="font-medium text-pb-text">Email</div>
            <div className="mt-0.5 text-pb-text-muted">
              {(preferences.emailRemindersEnabled ?? true) ? "Fallback enabled" : "Fallback off"}
            </div>
          </div>
        </div>

        <button
          onClick={() => onUpdatePreferences({ emailRemindersEnabled: !(preferences.emailRemindersEnabled ?? true) })}
          disabled={!user}
          className="mt-3 w-full cursor-pointer rounded-md border border-pb-border bg-transparent px-3 py-2 text-left text-xs text-pb-text transition-colors duration-150 hover:border-pb-text-muted disabled:cursor-not-allowed disabled:opacity-60"
        >
          Email fallback: {(preferences.emailRemindersEnabled ?? true) ? "On" : "Off"}
        </button>

        {preferences.reviewRemindersEnabled && reminders.status === "subscribed" && (
          <button
            onClick={sendTest}
            disabled={reminders.busy}
            className="mt-2 w-full cursor-pointer rounded-md border border-pb-border bg-transparent px-3 py-2 text-xs text-pb-text transition-colors duration-150 hover:border-pb-text-muted disabled:cursor-wait disabled:opacity-60"
          >
            Send test push
          </button>
        )}

        <p className="mt-3 text-xs leading-relaxed text-pb-text-dim">
          Push goes out at 9 AM local when reviews are due. Email is used only if push cannot be sent, or at 6 PM when an unclicked push still has due reviews.
        </p>
        {!user && <p className="mt-2 text-xs text-pb-medium">Sign in to enable reminders.</p>}
        {reminders.status === "needs-ios-install" && (
          <p className="mt-2 text-xs text-pb-medium">On iPhone or iPad, add PatternBank to the Home Screen before enabling push.</p>
        )}
        {reminders.errorMessage && <p className="mt-2 text-xs text-pb-error">{reminders.errorMessage}</p>}
      </div>
    </div>
  );
}
