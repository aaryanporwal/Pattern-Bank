import { useState, useCallback, useEffect } from "react";
import { getTheme, setTheme as persistTheme, applyTheme, type Theme } from "../utils/theme";

interface UseThemeReturn {
  theme: Theme;
  toggleTheme: () => void;
}

export default function useTheme(): UseThemeReturn {
  const [theme, setThemeState] = useState<Theme>(getTheme);

  useEffect(() => {
    applyTheme(theme);
  }, [theme]);

  const toggleTheme = useCallback(() => {
    const next: Theme = theme === "dark" ? "light" : "dark";
    persistTheme(next);
    applyTheme(next);
    setThemeState(next);
  }, [theme]);

  return { theme, toggleTheme };
}
