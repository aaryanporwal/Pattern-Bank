import { useState, useEffect, useRef } from "react";
import { User } from "@supabase/supabase-js";
import { loadReviewLog } from "../utils/storage";
import { syncOnSignIn, SyncResult } from "../utils/sync";
import type { Problem, Preferences, SyncStatus } from "../types";

interface UseCloudSyncParams {
  user: User | null;
  problems: Problem[];
  preferences: Preferences;
  showToast: (msg: string) => void;
  onSyncComplete: (result: SyncResult) => void;
}

interface UseCloudSyncReturn {
  syncStatus: SyncStatus;
}

export default function useCloudSync({
  user,
  problems,
  preferences,
  showToast,
  onSyncComplete,
}: UseCloudSyncParams): UseCloudSyncReturn {
  const [syncStatus, setSyncStatus] = useState<SyncStatus>("idle");
  const hasSyncedRef = useRef(false);

  useEffect(() => {
    if (!user) {
      const reset = () => { hasSyncedRef.current = false; setSyncStatus("idle"); };
      reset();
      return;
    }
    if (hasSyncedRef.current) return;
    hasSyncedRef.current = true;
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setSyncStatus("syncing");

    syncOnSignIn(user.id, problems, loadReviewLog(), preferences).then(
      (result) => {
        if (result.error) {
          setSyncStatus("error");
          showToast("Sync failed — working offline");
          return;
        }
        onSyncComplete(result);
        setSyncStatus("synced");
        if (result.hasChanges) {
          showToast("Data synced");
        }
      }
    );
  }, [user]); // eslint-disable-line react-hooks/exhaustive-deps

  return { syncStatus };
}
