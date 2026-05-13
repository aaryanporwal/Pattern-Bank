import { THEME_OPTIONS, type Theme } from "../utils/theme";

interface Props {
  value: Theme;
  onChange: (theme: Theme) => void;
}

export default function ThemePicker({ value, onChange }: Props) {
  return (
    <div className="grid grid-cols-3 gap-3 max-[380px]:grid-cols-2">
      {THEME_OPTIONS.map((theme) => {
        const selected = value === theme.id;
        return (
          <button
            key={theme.id}
            type="button"
            aria-pressed={selected}
            onClick={() => onChange(theme.id)}
            className={`group cursor-pointer border-none bg-transparent p-0 text-left transition-transform duration-150 hover:-translate-y-0.5 focus:outline-none focus-visible:ring-2 focus-visible:ring-pb-accent focus-visible:ring-offset-2 focus-visible:ring-offset-pb-surface ${
              selected ? "text-pb-text" : "text-pb-text-muted hover:text-pb-text"
            }`}
          >
            <span
              className={`relative block aspect-[1.18] overflow-hidden rounded-lg border transition-all duration-150 ${
                selected
                  ? "border-pb-accent shadow-[0_0_0_3px_var(--color-pb-accent-subtle)]"
                  : "border-pb-border group-hover:border-pb-text-muted"
              }`}
              style={{ backgroundColor: theme.preview.bg }}
            >
              <span
                className="absolute left-3 right-3 top-3 h-4 rounded-md opacity-90"
                style={{ backgroundColor: theme.preview.surface }}
              />
              <span
                className="absolute bottom-0 left-0 right-0 flex h-3"
                aria-hidden="true"
              >
                {theme.preview.accents.map((color) => (
                  <span
                    key={color}
                    className="h-full flex-1"
                    style={{ backgroundColor: color }}
                  />
                ))}
              </span>
              {selected && (
                <span className="absolute inset-0 flex items-center justify-center">
                  <span className="grid h-7 w-7 place-items-center rounded-full bg-black/25 text-white shadow-sm backdrop-blur-sm">
                    <svg
                      width="16"
                      height="16"
                      viewBox="0 0 16 16"
                      fill="none"
                      aria-hidden="true"
                    >
                      <path
                        d="M3.5 8.2 6.5 11 12.5 5"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </span>
                </span>
              )}
            </span>
            <span className="mt-1.5 block truncate text-center text-xs font-semibold">
              {theme.label}
            </span>
          </button>
        );
      })}
    </div>
  );
}
