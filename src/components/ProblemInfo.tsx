import type { Difficulty } from "../types";

interface ProblemInfoForm {
  leetcodeNumber: string | number;
  title: string;
  difficulty: Difficulty;
  url?: string;
}

interface Props {
  form: ProblemInfoForm;
  isEdit: boolean;
  onClear: () => void;
  isDuplicate?: boolean;
}

export default function ProblemInfo({ form, isEdit, onClear, isDuplicate }: Props) {
  return (
    <div className="flex items-center gap-3 rounded-lg border border-pb-border bg-pb-bg px-3 py-2.5">
      <span className={`text-xs font-semibold ${isDuplicate ? "text-pb-text-dim" : "text-pb-text-muted"}`}>
        #{form.leetcodeNumber}
      </span>
      <span className={`flex-1 text-sm font-medium ${isDuplicate ? "text-pb-text-dim line-through" : "text-pb-text"}`}>
        {form.title}
      </span>
      <span
        className={`text-[11px] font-semibold ${
          isDuplicate
            ? "text-pb-text-dim"
            : form.difficulty === "Easy"
              ? "text-pb-easy"
              : form.difficulty === "Medium"
                ? "text-pb-medium"
                : "text-pb-hard"
        }`}
      >
        {form.difficulty}
      </span>
      {form.url && (
        <button
          onClick={(e) => { e.stopPropagation(); window.open(form.url, "_blank"); }}
          title="Open problem"
          className="cursor-pointer border-none bg-transparent text-base text-pb-accent transition-colors duration-150 hover:text-pb-accent-hover"
        >
          ↗
        </button>
      )}
      {!isEdit && (
        <button
          onClick={onClear}
          className="cursor-pointer border-none bg-transparent text-xs text-pb-text-dim hover:text-pb-text-muted"
        >
          ✕
        </button>
      )}
    </div>
  );
}
