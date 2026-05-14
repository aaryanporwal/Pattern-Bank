import ReviewCard from "./ReviewCard";
import SectionHeader from "./SectionHeader";
import PatternHeatmap from "./PatternHeatmap";
import StatsBar from "./StatsBar";
import ProblemListPicker from "./ProblemListPicker";
import PatternTag from "./PatternTag";
import DifficultyBadge from "./DifficultyBadge";
import { todayStr } from "../utils/dateHelpers";
import { calculateStreak } from "../utils/storage";
import { prioritizeProblems, INTERVALS } from "../utils/spacedRepetition";
import { computeReviewProgress } from "../utils/problemTransforms";
import type { Problem, Confidence, LeetCodeProblem } from "../types";

interface Props {
  problems: Problem[];
  dailyGoal: number;
  hidePatterns?: boolean;
  enabledExtraPatterns?: string[];
  onReview: (id: string, confidence: Confidence) => void;
  onDismiss: (id: string) => void;
  onUpdateNotes: (id: string, notes: string) => void;
  onViewAllDue: () => void;
  onPatternClick: (pattern: string) => void;
  onAddClick: () => void;
  onBulkAdd: (problems: LeetCodeProblem[], patternMap?: Map<number, string[]> | null) => void;
  existingProblemNumbers: Set<number>;
}

export default function DashboardView({
  problems,
  dailyGoal,
  hidePatterns,
  enabledExtraPatterns,
  onReview,
  onDismiss,
  onUpdateNotes,
  onViewAllDue,
  onPatternClick,
  onAddClick,
  onBulkAdd,
  existingProblemNumbers,
}: Props) {
  const today = todayStr();

  // All problems past their review date (excluding excluded ones)
  const allDueProblems = problems.filter((p) => p.nextReviewDate <= today && !p.excludeFromReview);

  const { currentReviewed: reviewedToday, totalDue: totalDueCount, effectiveGoal } =
    computeReviewProgress(problems, dailyGoal);
  const remainingSlots = Math.max(0, effectiveGoal - reviewedToday);

  // Prioritize and cap to remaining slots
  const todaysReviews = prioritizeProblems(allDueProblems, remainingSlots);

  const streak = calculateStreak();

  // Empty state — Quick Start card
  if (problems.length === 0) {
    return (
      <div className="flex flex-col gap-6 p-5">
        <div className="overflow-hidden rounded-xl border border-pb-border bg-pb-surface">
          {/* Top accent line */}
          <div className="h-0.5" style={{ background: "linear-gradient(90deg, transparent, var(--color-pb-accent), transparent)" }} />

          <div className="px-6 py-6">
            {/* ---- Section 1: Welcome + Action paths ---- */}
            <h2 className="mb-1.5 text-lg font-semibold text-pb-text">Welcome to PatternBank</h2>
            <p className="mb-5 text-sm text-pb-text-muted">Add your first problem to get started with spaced repetition.</p>

            <div className="flex flex-wrap gap-3">
              {/* Add a problem */}
              <div className="flex-[1_1_240px] rounded-[10px] border border-pb-border bg-pb-bg p-5">
                <h3 className="mb-1.5 text-[13px] font-semibold text-pb-text">Add a problem</h3>
                <p className="mb-4 text-xs leading-relaxed text-pb-text-muted">Search from 3,800+ LeetCode problems or create your own.</p>
                <button
                  onClick={onAddClick}
                  className="cursor-pointer rounded-lg border-none bg-pb-accent px-4 py-2 text-[13px] font-semibold text-white transition-opacity hover:opacity-85"
                >
                  + Add problem
                </button>
              </div>

              {/* Import curated list */}
              <div className="flex-[1_1_240px] rounded-[10px] border border-pb-border bg-pb-bg p-5">
                <h3 className="mb-1.5 text-[13px] font-semibold text-pb-text">Import a curated list</h3>
                <p className="mb-4 text-xs leading-relaxed text-pb-text-muted">Start with a popular set, already tagged by pattern.</p>
                <ProblemListPicker existingIds={existingProblemNumbers} onBulkAdd={onBulkAdd} />
              </div>
            </div>

            {/* ---- Section 2: How reviews work ---- */}
            <div className="mt-6 border-t border-pb-border pt-6">
              <h3 className="mb-1 text-[13px] font-semibold tracking-wide text-pb-text-muted">How reviews work</h3>
              <p className="mb-4 text-[13px] leading-relaxed text-pb-text-muted">Rate your confidence after each review. Higher confidence means longer intervals.</p>

              <div className="flex flex-col gap-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium tracking-wide text-pb-text-dim">Confidence</span>
                  <span className="text-xs font-medium tracking-wide text-pb-text-dim">Next review in...</span>
                </div>
                {([1, 2, 3, 4, 5] as Confidence[]).map((stars) => {
                  const days = INTERVALS[stars];
                  const color = stars <= 2 ? "text-pb-hard" : stars === 3 ? "text-pb-medium" : "text-pb-easy";
                  return (
                    <div key={stars} className="flex items-center justify-between">
                      <span className="text-sm tracking-wide">
                        {[1, 2, 3, 4, 5].map((i) => (
                          <span key={i} style={{ color: i <= stars ? "var(--color-pb-star)" : "var(--color-pb-star-empty)" }}>★</span>
                        ))}
                      </span>
                      <span className={`font-mono text-[13px] tabular-nums ${color}`}>
                        <span className="inline-block w-[18px] text-right">{days}</span> day{days !== 1 ? "s" : ""}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* ---- Section 3: Good to know ---- */}
            <div className="mt-6 border-t border-pb-border pt-6">
              <ul className="m-0 flex list-inside list-disc flex-col gap-2 pl-0 text-[13px] text-pb-text-muted">
                <li>Tap ◎ on any problem to exclude it from reviews</li>
                <li>Enable 6 advanced patterns in settings</li>
              </ul>
            </div>

            {/* ---- Section 4: Review history preview ---- */}
            <div className="mt-6 border-t border-pb-border pt-6">
              <div className="rounded-[10px] border border-dashed border-pb-border bg-pb-bg/50 p-5" style={{ opacity: 0.75 }}>
                {/* Mini problem card */}
                <div className="mb-3 flex flex-wrap items-start justify-between gap-2">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-[13px] font-semibold text-pb-text">Rotting Oranges</span>
                    <span className="text-xs text-pb-text-muted">#994</span>
                  </div>
                  <DifficultyBadge difficulty="Medium" />
                </div>
                <div className="mb-4 flex flex-wrap gap-1.5">
                  <PatternTag name="BFS" />
                  <PatternTag name="Graph" />
                </div>

                {/* Mock review timeline */}
                <div className="mb-3 flex flex-col gap-2 rounded-lg bg-pb-bg p-3">
                  {[
                    { date: "Today", stars: 4 },
                    { date: "3 days ago", stars: 3 },
                    { date: "1 week ago", stars: 2 },
                  ].map((entry) => (
                    <div key={entry.date} className="flex items-center gap-3">
                      <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-pb-text-dim" />
                      <span className="min-w-[72px] text-[13px] text-pb-text-muted">{entry.date}</span>
                      <span className="ml-auto text-sm tracking-wide">
                        {[1, 2, 3, 4, 5].map((i) => (
                          <span key={i} style={{ color: i <= entry.stars ? "var(--color-pb-star)" : "var(--color-pb-star-empty)" }}>★</span>
                        ))}
                      </span>
                    </div>
                  ))}
                </div>

                {/* Sign-in nudge */}
                <p className="m-0 text-[13px] text-pb-text-muted">
                  Sign in to track review history and sync across devices.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6 p-5">
      <StatsBar
        total={problems.length}
        due={totalDueCount}
        reviewedToday={reviewedToday}
        streak={streak}
      />

      {/* Pattern Confidence Heatmap */}
      {problems.length > 0 && (
        <div>
          <SectionHeader title="Pattern confidence" />
          <PatternHeatmap problems={problems} onPatternClick={onPatternClick} enabledExtraPatterns={enabledExtraPatterns} />
        </div>
      )}

      {/* Today's Reviews section */}
      <div>
        <div className="mb-3 flex items-center gap-2">
          <h2 className="text-[15px] font-semibold text-pb-text">
            Today's reviews
          </h2>
          <span className="rounded-[10px] bg-pb-bg px-2 py-px text-xs font-semibold text-pb-text-muted">
            {reviewedToday} of {effectiveGoal}
          </span>
        </div>

        {todaysReviews.length === 0 ? (
          <div className="rounded-[10px] border border-pb-border bg-pb-surface px-5 py-8 text-center">
            {reviewedToday >= effectiveGoal && totalDueCount > 0 ? (
              <>
                <div className="mb-2 text-xl font-semibold text-pb-success">✓</div>
                <div className="mb-1 text-sm font-medium text-pb-text">
                  You're all caught up today!
                </div>
                <div className="text-[13px] text-pb-text-muted">
                  You completed your daily goal of {effectiveGoal} review{effectiveGoal !== 1 ? "s" : ""}.
                </div>
              </>
            ) : (
              <>
                <div className="mb-2 text-xl font-semibold text-pb-success">✓</div>
                <div className="mb-1 text-sm font-medium text-pb-text">
                  No reviews for today
                </div>
                <div className="text-[13px] text-pb-text-muted">
                  All your problems are scheduled for later. Nice work.
                </div>
              </>
            )}
          </div>
        ) : (
          <div className="flex flex-col gap-2.5">
            {todaysReviews.map((p) => (
              <ReviewCard
                key={p.id}
                problem={p}
                hidePatterns={hidePatterns}
                onReview={onReview}
                onDismiss={onDismiss}
                onUpdateNotes={onUpdateNotes}
              />
            ))}
          </div>
        )}

        {/* Show link when more due problems exist beyond the daily cap */}
        {totalDueCount > todaysReviews.length && totalDueCount > 0 && (
          <button
            onClick={onViewAllDue}
            className="mt-2 w-full cursor-pointer border-none bg-transparent py-2 text-center text-[13px] font-medium text-pb-text-dim transition-colors duration-150 hover:text-pb-accent"
          >
            See all {totalDueCount} due &rarr;
          </button>
        )}
      </div>

    </div>
  );
}
