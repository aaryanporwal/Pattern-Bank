import { useState, useEffect, useCallback } from "react";
import { User } from "@supabase/supabase-js";
import { loadPreferences, savePreferences } from "../utils/storage";
import { pushPreferencesToCloud } from "../utils/sync";
import type { Preferences } from "../types";

interface UsePreferencesParams {
  user: User | null;
}

interface UsePreferencesReturn {
  preferences: Preferences;
  handleUpdatePreferences: (updates: Partial<Preferences>) => void;
  replacePreferences: (prefs: Preferences) => void;
}

export default function usePreferences({ user }: UsePreferencesParams): UsePreferencesReturn {
  const [preferences, setPreferences] = useState<Preferences>(() => loadPreferences());

  useEffect(() => { savePreferences(preferences); }, [preferences]);

  const handleUpdatePreferences = useCallback((updates: Partial<Preferences>) => {
    setPreferences((prev) => {
      const next = { ...prev, ...updates };
      if (user) pushPreferencesToCloud(user.id, next);
      return next;
    });
  }, [user]);

  const replacePreferences = useCallback((prefs: Preferences) => {
    setPreferences(prefs);
  }, []);

  return { preferences, handleUpdatePreferences, replacePreferences };
}
