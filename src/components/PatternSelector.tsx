import { CORE_PATTERNS, EXTRA_PATTERNS, PATTERN_COLORS, getVisiblePatterns } from "../utils/constants";
import InlineError from "./InlineError";

interface Props {
  selected: string[];
  onChange: (patterns: string[]) => void;
  error?: string;
  enabledExtraPatterns?: string[];
}

export default function PatternSelector({ selected, onChange, error, enabledExtraPatterns }: Props) {
  const toggle = (pattern: string) => {
    onChange(
      selected.includes(pattern)
        ? selected.filter((p) => p !== pattern)
        : [...selected, pattern]
    );
  };

  const visiblePatterns = getVisiblePatterns(enabledExtraPatterns ?? []);
  const visibleExtras = visiblePatterns.filter(
    (p) => !(CORE_PATTERNS as readonly string[]).includes(p)
  );
  // Also include any extras already selected on the problem (edit case where user disabled pattern later)
  const extraFromSelection = selected.filter(
    (s) => !(CORE_PATTERNS as readonly string[]).includes(s) && !visibleExtras.includes(s)
  );
  const allExtras = [...visibleExtras, ...extraFromSelection];

  const renderButton = (p: string) => {
    const active = selected.includes(p);
    const pc = PATTERN_COLORS[p] || { text: "#7c6bf5", bg: "rgba(124,107,245,0.12)" };
    return (
      <button
        key={p}
        onClick={() => toggle(p)}
        className="cursor-pointer rounded-md border px-2.5 py-1.5 text-left text-xs font-medium transition-all duration-150"
        style={{
          borderColor: active
            ? pc.text
            : error
              ? "rgba(248,81,73,0.37)"
              : "#30363d",
          backgroundColor: active ? pc.bg : "transparent",
          color: active ? pc.text : "#8b949e",
        }}
      >
        {p}
      </button>
    );
  };

  return (
    <div>
      <label className="mb-1.5 block text-[13px] font-semibold uppercase tracking-wide text-pb-text-muted">
        Patterns * (select at least one)
      </label>
      <div className="grid grid-cols-3 gap-1.5">
        {CORE_PATTERNS.map((p) => renderButton(p))}
      </div>
      {allExtras.length > 0 && (
        <>
          <div className="my-2 border-t border-pb-border" />
          <div className="grid grid-cols-3 gap-1.5">
            {allExtras.map((p) => renderButton(p))}
          </div>
        </>
      )}
      <InlineError message={error} />
    </div>
  );
}
