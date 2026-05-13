import { useState, useCallback, useEffect } from "react";
import { getTheme, setTheme as persistTheme, applyTheme, type Theme } from "../utils/theme";

interface UseThemeReturn {
  theme: Theme;
  setTheme: (theme: Theme) => void;
}

export default function useTheme(): UseThemeReturn {
  const [theme, setThemeState] = useState<Theme>(getTheme);

  useEffect(() => {
    applyTheme(theme);
  }, [theme]);

  const setTheme = useCallback((next: Theme) => {
    persistTheme(next);
    applyTheme(next);
    setThemeState(next);
  }, []);

  return { theme, setTheme };
}
