import { useState, useEffect } from "react";
import AccountSection from "./AccountSection";
import MobileAppSection from "./MobileAppSection";
import DailyGoalSection from "./DailyGoalSection";
import ProblemListPicker from "./ProblemListPicker";
import BulkAddSection from "./BulkAddSection";
import DataSection from "./DataSection";
import FeedbackSection from "./FeedbackSection";
import DangerZoneSection from "./DangerZoneSection";
import ExtraPatternsSection from "./ExtraPatternsSection";
import NotificationReminderSection from "./NotificationReminderSection";
import type { User } from "@supabase/supabase-js";
import type { Preferences, LeetCodeProblem } from "../types";

function CollapsibleSection({ title, defaultOpen = false, children }: {
  title: string;
  defaultOpen?: boolean;
  children: React.ReactNode;
}) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div>
      <button
        onClick={() => setOpen(!open)}
        className="flex w-full cursor-pointer items-center justify-between border-none bg-transparent py-0 text-[13px] font-semibold tracking-wide text-pb-text-muted"
      >
        <span>{title}</span>
        <span
          className="text-[20px] text-pb-text-muted transition-transform duration-150"
          style={{ transform: open ? "rotate(90deg)" : "rotate(0deg)" }}
        >
          ▸
        </span>
      </button>
      {open && <div className="mt-2">{children}</div>}
    </div>
  );
}

interface Props {
  isOpen: boolean;
  onClose: () => void;
  preferences: Preferences;
  onUpdatePreferences: (updates: Partial<Preferences>) => void;
  onExport: () => void;
  onImport: (file: File) => void;
  onBulkAdd: (problems: LeetCodeProblem[], patternMap?: Map<number, string[]> | null) => void;
  problemCount: number;
  existingProblemNumbers: Set<number>;
  user: User | null;
  onSignInGoogle: () => Promise<{ error: Error | null }>;
  onSignInGitHub: () => Promise<{ error: Error | null }>;
  onSignInApple: () => Promise<{ error: Error | null }>;
  onSignOut: () => Promise<void>;
  onSetAllDue: () => void;
  onRequestClearData: () => void;
  showToast: (message: string) => void;
}

export default function SettingsModal({
  isOpen,
  onClose,
  preferences,
  onUpdatePreferences,
  onExport,
  onImport,
  onBulkAdd,
  problemCount,
  existingProblemNumbers,
  user,
  onSignInGoogle,
  onSignInGitHub,
  onSignInApple,
  onSignOut,
  onSetAllDue,
  onRequestClearData,
  showToast,
}: Props) {
  // Escape key to close
  useEffect(() => {
    if (!isOpen) return;
    const handleEsc = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", handleEsc);
    return () => document.removeEventListener("keydown", handleEsc);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-[1000] flex items-center justify-center bg-black/70 p-4"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="w-full max-w-[420px] overflow-y-auto rounded-[14px] border border-pb-border bg-pb-surface max-sm:max-h-screen max-sm:max-w-full max-sm:rounded-none sm:max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-pb-border px-6 py-4">
          <h2 className="text-base font-semibold text-pb-text">Settings</h2>
          <button
            onClick={onClose}
            aria-label="Close settings"
            className="cursor-pointer rounded-md border-none bg-transparent px-2 py-1 text-xl leading-none text-pb-text-muted hover:text-pb-text"
          >
            ✕
          </button>
        </div>

        <div className="flex flex-col gap-6 px-6 py-5">
          <AccountSection
            user={user}
            onSignInGoogle={onSignInGoogle}
            onSignInGitHub={onSignInGitHub}
            onSignInApple={onSignInApple}
            onSignOut={onSignOut}
          />

          <MobileAppSection />

          <DailyGoalSection
            preferences={preferences}
            onUpdatePreferences={onUpdatePreferences}
          />

          <NotificationReminderSection
            user={user}
            preferences={preferences}
            onUpdatePreferences={onUpdatePreferences}
            showToast={showToast}
          />

          <div>
            <label className="mb-1.5 block text-[13px] font-semibold tracking-wide text-pb-text-muted">
              Hide patterns during review
            </label>
            <button
              onClick={() => onUpdatePreferences({ hidePatternsDuringReview: !preferences.hidePatternsDuringReview })}
              className="flex w-full cursor-pointer items-center justify-between rounded-lg border border-pb-border bg-transparent px-3 py-2.5 text-left transition-colors duration-150 hover:border-pb-text-muted"
            >
              <span className="text-sm text-pb-text">
                {preferences.hidePatternsDuringReview ? "On" : "Off"}
              </span>
              <span
                className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors duration-200 ${
                  preferences.hidePatternsDuringReview ? "bg-pb-accent" : "bg-pb-border"
                }`}
              >
                <span
                  className={`inline-block h-3.5 w-3.5 rounded-full bg-white transition-transform duration-200 ${
                    preferences.hidePatternsDuringReview ? "translate-x-[18px]" : "translate-x-[3px]"
                  }`}
                />
              </span>
            </button>
            <p className="mt-2 text-xs leading-relaxed text-pb-text-dim">
              Test your pattern recognition — tap to reveal on each card.
            </p>
          </div>

          <CollapsibleSection title="Additional patterns">
            <ExtraPatternsSection
              hideLabel
              enabledExtraPatterns={preferences.enabledExtraPatterns}
              onToggle={(pattern) => {
                const current = preferences.enabledExtraPatterns;
                const updated = current.includes(pattern)
                  ? current.filter((p) => p !== pattern)
                  : [...current, pattern];
                onUpdatePreferences({ enabledExtraPatterns: updated });
              }}
            />
          </CollapsibleSection>

          <CollapsibleSection title="Import problem list">
            <ProblemListPicker
              hideLabel
              existingIds={existingProblemNumbers}
              onBulkAdd={(problems, patternMap) => { onBulkAdd(problems, patternMap); onClose(); }}
            />
          </CollapsibleSection>

          <CollapsibleSection title="Bulk add">
            <BulkAddSection
              onBulkAdd={(problems) => { onBulkAdd(problems); onClose(); }}
              existingIds={existingProblemNumbers}
            />
          </CollapsibleSection>

          <CollapsibleSection title="Data">
            <DataSection
              hideLabel
              problemCount={problemCount}
              onExport={onExport}
              onImport={onImport}
              onClose={onClose}
            />
          </CollapsibleSection>

          <CollapsibleSection title="Feedback">
            <FeedbackSection user={user} />
          </CollapsibleSection>

          <CollapsibleSection title="Danger zone">
            <DangerZoneSection
              hideLabel
              onSetAllDue={onSetAllDue}
              onRequestClearData={onRequestClearData}
            />
          </CollapsibleSection>

        </div>
      </div>
    </div>
  );
}
