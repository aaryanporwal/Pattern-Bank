export type Theme =
  | "default"
  | "light"
  | "gruvbox"
  | "everforest"
  | "nature"
  | "rose-pine";

export interface ThemeOption {
  id: Theme;
  label: string;
  preview: {
    bg: string;
    surface: string;
    border: string;
    accents: string[];
  };
}

export const THEME_OPTIONS: ThemeOption[] = [
  {
    id: "default",
    label: "Default",
    preview: {
      bg: "#0d1117",
      surface: "#161b22",
      border: "#30363d",
      accents: ["#7c6bf5", "#3fb950", "#d29922", "#f85149"],
    },
  },
  {
    id: "light",
    label: "Light",
    preview: {
      bg: "#ffffff",
      surface: "#f6f8fa",
      border: "#d0d7de",
      accents: ["#7c6bf5", "#1a7f37", "#9a6700", "#cf222e"],
    },
  },
  {
    id: "gruvbox",
    label: "Gruvbox",
    preview: {
      bg: "#282828",
      surface: "#32302f",
      border: "#504945",
      accents: [
        "#fabd2f",
        "#b8bb26",
        "#8ec07c",
        "#d3869b",
      ],
    },
  },
  {
    id: "everforest",
    label: "Everforest",
    preview: {
      bg: "#2d353b",
      surface: "#343f44",
      border: "#4f585e",
      accents: ["#a7c080", "#7fbbb3", "#e69875", "#d699b6"],
    },
  },
  {
    id: "nature",
    label: "Nature",
    preview: {
      bg: "#101914",
      surface: "#17231c",
      border: "#314638",
      accents: ["#95c561", "#83c092", "#d8a657", "#7aa89f"],
    },
  },
  {
    id: "rose-pine",
    label: "Rose Pine",
    preview: {
      bg: "#191724",
      surface: "#1f1d2e",
      border: "#403d52",
      accents: [
        "#ebbcba",
        "#9ccfd8",
        "#c4a7e7",
        "#f6c177",
      ],
    },
  },
];

const STORAGE_KEY = "patternbank-theme";

function isTheme(value: string | null): value is Theme {
  return THEME_OPTIONS.some((theme) => theme.id === value);
}

export function getTheme(): Theme {
  const stored = localStorage.getItem(STORAGE_KEY);
  if (stored === "dark") return "default";
  return isTheme(stored) ? stored : "default";
}

export function setTheme(theme: Theme): void {
  localStorage.setItem(STORAGE_KEY, theme);
}

export function applyTheme(theme: Theme): void {
  document.documentElement.classList.remove("light");
  document.documentElement.dataset.theme = theme;
}
