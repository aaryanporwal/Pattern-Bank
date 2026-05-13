import { useEffect } from "react";
import useTheme from "../hooks/useTheme";
import ThemePicker from "./ThemePicker";

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

export default function ThemeMenu({ isOpen, onClose }: Props) {
  const { theme, setTheme } = useTheme();

  useEffect(() => {
    if (!isOpen) return;
    const handleEsc = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", handleEsc);
    return () => document.removeEventListener("keydown", handleEsc);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-[1000] flex items-end justify-center bg-black/55 px-4 pb-[88px] pt-4 sm:items-center sm:pb-4"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="theme-menu-title"
        className="w-full max-w-[420px] rounded-[14px] border border-pb-border bg-pb-surface shadow-2xl"
      >
        <div className="flex items-center justify-between border-b border-pb-border px-5 py-4">
          <h2 id="theme-menu-title" className="text-base font-semibold text-pb-text">
            Theme
          </h2>
          <button
            onClick={onClose}
            aria-label="Close theme menu"
            className="cursor-pointer rounded-md border-none bg-transparent px-2 py-1 text-xl leading-none text-pb-text-muted hover:text-pb-text"
          >
            ✕
          </button>
        </div>
        <div className="px-5 py-5">
          <ThemePicker value={theme} onChange={setTheme} />
        </div>
      </div>
    </div>
  );
}
