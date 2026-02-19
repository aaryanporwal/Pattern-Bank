const COLOR_MAP = {
  Easy: "text-pb-easy bg-pb-easy/10",
  Medium: "text-pb-medium bg-pb-medium/10",
  Hard: "text-pb-hard bg-pb-hard/10",
};

export default function DifficultyBadge({ difficulty }) {
  return (
    <span
      className={`rounded px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wide ${
        COLOR_MAP[difficulty] || "text-pb-text-muted"
      }`}
    >
      {difficulty}
    </span>
  );
}
