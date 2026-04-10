import { useState, useMemo } from "react";
import { todayStr, addDays } from "../utils/dateHelpers";
import { getConfidenceDistribution, CONFIDENCE_BAR_COLORS } from "../utils/progressUtils";
import { simulateProjection } from "../utils/projectionEngine";
import { INTERVALS } from "../utils/spacedRepetition";
import type { Problem, ReviewEvent, Confidence } from "../types";

interface Props {
  problems: Problem[];
  reviewEvents: ReviewEvent[];
}

const SNAPSHOT_LABELS = ["Now", "Day 10", "Day 20", "Day 30"];
const BAR_HEIGHT = 180;

function computeDefaultDailyGoal(reviewEvents: ReviewEvent[]): number {
  if (reviewEvents.length === 0) return 5;
  const today = todayStr();
  const cutoff = addDays(today, -14);
  const recent = reviewEvents.filter((e) => e.date >= cutoff);
  if (recent.length === 0) return 5;
  const activeDays = new Set(recent.map((e) => e.date)).size;
  if (activeDays === 0) return 5;
  return Math.min(Math.round(recent.length / activeDays), 15);
}

function computeDefaultNewPerWeek(problems: Problem[]): number {
  if (problems.length === 0) return 2;
  const today = todayStr();
  const cutoff = addDays(today, -28);
  const recentCount = problems.filter((p) => p.dateAdded >= cutoff).length;
  if (recentCount === 0) return 2;
  return Math.min(Math.round(recentCount / 4), 10);
}

export default function ProjectionCalculator({ problems, reviewEvents }: Props) {
  const reviewable = useMemo(
    () => problems.filter((p) => !p.excludeFromReview),
    [problems],
  );
  const excludedCount = problems.length - reviewable.length;

  const defaultDaily = useMemo(() => computeDefaultDailyGoal(reviewEvents), [reviewEvents]);
  const defaultNewPerWeek = useMemo(() => computeDefaultNewPerWeek(reviewable), [reviewable]);

  const [dailyGoal, setDailyGoal] = useState<number | null>(null);
  const [newPerWeek, setNewPerWeek] = useState<number | null>(null);

  const effectiveDaily = dailyGoal ?? defaultDaily;
  const effectiveNew = newPerWeek ?? defaultNewPerWeek;

  const startDistribution = useMemo(
    () => getConfidenceDistribution(reviewable.map((p) => p.confidence)),
    [reviewable],
  );

  const snapshots = useMemo(
    () => simulateProjection(startDistribution, effectiveDaily, effectiveNew, 30),
    [startDistribution, effectiveDaily, effectiveNew],
  );

  // Check mastery edge case
  const highConfCount = startDistribution[3] + startDistribution[4];
  const totalReviewable = reviewable.length;
  const isMastered = totalReviewable > 0 && highConfCount / totalReviewable >= 0.85;

  // Summary stats
  const day0 = snapshots[0];
  const day30 = snapshots[snapshots.length - 1];
  const day0High = day0.distribution[3] + day0.distribution[4];
  const day30High = day30.distribution[3] + day30.distribution[4];
  const day30Total = day30.distribution.reduce((a, b) => a + b, 0);
  const masteryPct = day30Total > 0 ? Math.round((day30High / day30Total) * 100) : 0;
  const highDelta = day30High - day0High;

  const maxTotal = Math.max(...snapshots.map((s) => s.distribution.reduce((a, b) => a + b, 0)), 1);

  return (
    <div className="rounded-xl border border-pb-border bg-pb-surface p-5">
      <h3 className="mb-4 text-[15px] font-semibold text-pb-text">
        30-Day Projection
      </h3>

      {isMastered ? (
        <div className="flex flex-col items-center gap-2 py-8 text-center">
          <span className="text-2xl">🏆</span>
          <p className="text-[15px] font-semibold text-pb-text">
            You've mastered most of your library
          </p>
          <p className="text-[13px] text-pb-text-muted">
            {highConfCount} of {totalReviewable} reviewable problems are at 4–5 stars.
            Keep reviewing to maintain your edge.
          </p>
        </div>
      ) : (
        <>
          {/* Sliders */}
          <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:gap-6">
            <SliderControl
              label="Daily reviews"
              value={effectiveDaily}
              min={1}
              max={15}
              isDefault={dailyGoal === null || dailyGoal === defaultDaily}
              onChange={(v) => setDailyGoal(v)}
            />
            <SliderControl
              label="New / week"
              value={effectiveNew}
              min={0}
              max={10}
              isDefault={newPerWeek === null || newPerWeek === defaultNewPerWeek}
              onChange={(v) => setNewPerWeek(v)}
            />
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
                  style={{ maxWidth: 72 }}
                >
                  {/* Stacked bar */}
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
                  {/* Label */}
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
              {highDelta > 0 && (
                <span className="ml-1 text-pb-success">(+{highDelta})</span>
              )}
            </span>
            <span className="text-pb-text-muted">
              Total:{" "}
              <span className="font-semibold text-pb-text">{day30Total}</span>
            </span>
            <span className="text-pb-text-muted">
              Mastery:{" "}
              <span className="font-semibold text-pb-text">{masteryPct}%</span>
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
        </>
      )}

      {/* Footnote */}
      <p className="mt-3 text-[10px] leading-relaxed text-pb-text-dim">
        Projection assumes each review advances confidence by one star (optimistic).
        Actual results depend on review quality.
        {excludedCount > 0 && (
          <> {excludedCount} excluded problem{excludedCount !== 1 ? "s" : ""} not shown.</>
        )}
      </p>
    </div>
  );
}

function SliderControl({
  label,
  value,
  min,
  max,
  isDefault,
  onChange,
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  isDefault: boolean;
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
      {isDefault && (
        <span className="shrink-0 rounded-full bg-pb-accent-subtle px-1.5 py-0.5 text-[9px] font-medium text-pb-accent">
          your pace
        </span>
      )}
    </div>
  );
}
