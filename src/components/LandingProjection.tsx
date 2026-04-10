import { useState, useMemo } from "react";
import { CONFIDENCE_BAR_COLORS } from "../utils/progressUtils";
import { simulateProjection } from "../utils/projectionEngine";
import { INTERVALS } from "../utils/spacedRepetition";
import type { Confidence } from "../types";

const SNAPSHOT_LABELS = ["Now", "Day 10", "Day 20", "Day 30"];
const BAR_HEIGHT = 180;

export default function LandingProjection() {
  const [problemCount, setProblemCount] = useState(50);
  const [dailyGoal, setDailyGoal] = useState(5);
  const [newPerWeek, setNewPerWeek] = useState(2);

  const snapshots = useMemo(
    () => simulateProjection([problemCount, 0, 0, 0, 0], dailyGoal, newPerWeek, 30),
    [problemCount, dailyGoal, newPerWeek],
  );

  const day30 = snapshots[snapshots.length - 1];
  const day30High = day30.distribution[3] + day30.distribution[4];
  const day30Total = day30.distribution.reduce((a, b) => a + b, 0);
  const masteryPct = day30Total > 0 ? Math.round((day30High / day30Total) * 100) : 0;
  const timeEstimate = dailyGoal * 8;

  const maxTotal = Math.max(...snapshots.map((s) => s.distribution.reduce((a, b) => a + b, 0)), 1);

  return (
    <div className="relative overflow-hidden rounded-xl border border-pb-border bg-pb-surface p-6 md:p-8">
      {/* Top glow line */}
      <div
        className="absolute left-[15%] right-[15%] top-0 h-px"
        style={{ background: "linear-gradient(90deg, transparent, rgba(124,107,245,0.15), transparent)" }}
      />

      {/* Sliders */}
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:gap-6">
        <SliderControl label="Problems in library" value={problemCount} min={10} max={150} onChange={setProblemCount} />
        <SliderControl label="Daily reviews" value={dailyGoal} min={1} max={15} onChange={setDailyGoal} />
        <SliderControl label="New / week" value={newPerWeek} min={0} max={10} onChange={setNewPerWeek} />
      </div>

      {/* Stacked bar chart */}
      <div className="flex items-end justify-around gap-2" style={{ height: BAR_HEIGHT + 40 }}>
        {snapshots.map((snapshot, idx) => {
          const total = snapshot.distribution.reduce((a, b) => a + b, 0);
          const isHighlight = idx === 0 || idx === snapshots.length - 1;
          return (
            <div
              key={snapshot.day}
              className="flex flex-1 flex-col items-center gap-1"
              style={{ maxWidth: 80 }}
            >
              <div
                className={`flex w-full flex-col-reverse overflow-hidden rounded-md ${
                  isHighlight ? "ring-2 ring-pb-accent" : ""
                }`}
                style={{ height: BAR_HEIGHT }}
              >
                {snapshot.distribution.map((count, star) => {
                  const height = total > 0 ? (count / maxTotal) * BAR_HEIGHT : 0;
                  return (
                    <div
                      key={star}
                      className="relative flex items-center justify-center"
                      style={{
                        height,
                        backgroundColor: CONFIDENCE_BAR_COLORS[star],
                        transition: "height 0.3s ease",
                      }}
                    >
                      {count > 2 && height > 16 && (
                        <span className="text-[10px] font-bold text-white/90">
                          {count}
                        </span>
                      )}
                    </div>
                  );
                })}
              </div>
              <span className={`text-[11px] font-medium ${
                isHighlight ? "text-pb-text" : "text-pb-text-dim"
              }`}>
                {SNAPSHOT_LABELS[idx]}
              </span>
            </div>
          );
        })}
      </div>

      {/* Legend */}
      <div className="mt-3 flex flex-wrap items-center justify-center gap-x-3 gap-y-1">
        {CONFIDENCE_BAR_COLORS.map((color, i) => (
          <div key={i} className="flex items-center gap-1">
            <div
              className="rounded-sm"
              style={{ width: 10, height: 10, backgroundColor: color }}
            />
            <span className="text-[10px] text-pb-text-dim">
              {i + 1}★ {INTERVALS[(i + 1) as Confidence]}d
            </span>
          </div>
        ))}
      </div>

      {/* Summary */}
      <div className="mt-4 flex flex-wrap items-center justify-center gap-x-5 gap-y-1 border-t border-pb-border-light pt-3 text-[12px]">
        <span className="text-pb-text-muted">
          4–5 ★:{" "}
          <span className="font-semibold text-pb-text">{day30High}</span>
        </span>
        <span className="text-pb-text-muted">
          Total:{" "}
          <span className="font-semibold text-pb-text">{day30Total}</span>
        </span>
        <span className="text-pb-text-muted">
          Mastery:{" "}
          <span className="font-semibold text-pb-text">{masteryPct}%</span>
        </span>
        <span className="text-pb-text-muted">
          ~<span className="font-semibold text-pb-text">{timeEstimate} min</span>/day (estimated)
        </span>
      </div>

      {/* Contextual message */}
      <p className="mt-2 text-center text-[11px] text-pb-text-dim">
        {masteryPct >= 70
          ? "Great pace — you're on track to master most of your library."
          : masteryPct >= 40
            ? "Steady progress. Consider increasing daily reviews to accelerate."
            : "Consistent daily practice will compound. Start small and build up."}
      </p>

      {/* Footnote */}
      <p className="mt-3 text-[10px] leading-relaxed text-pb-text-dim">
        Projection assumes each review advances confidence by one star (optimistic).
        Actual results depend on review quality.
      </p>
    </div>
  );
}

function SliderControl({
  label,
  value,
  min,
  max,
  onChange,
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  onChange: (v: number) => void;
}) {
  return (
    <div className="flex flex-1 items-center gap-2">
      <span className="shrink-0 text-[12px] text-pb-text-muted">{label}</span>
      <input
        type="range"
        min={min}
        max={max}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="h-1.5 flex-1 cursor-pointer appearance-none rounded-full bg-pb-border accent-pb-accent"
      />
      <span className="w-6 text-right text-[13px] font-semibold tabular-nums text-pb-text">
        {value}
      </span>
    </div>
  );
}
