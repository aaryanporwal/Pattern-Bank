import ReviewCard from "./ReviewCard";
import SectionHeader from "./SectionHeader";
import PatternProgressRow from "./PatternProgressRow";
import StatsBar from "./StatsBar";
import { todayStr } from "../utils/dateHelpers";
import { calculateStreak, countReviewedToday } from "../utils/storage";
import { prioritizeProblems } from "../utils/spacedRepetition";

export default function DashboardView({
  problems,
  dailyGoal,
  onReview,
  onDismiss,
  onUpdateNotes,
  onViewAllDue,
}) {
  const today = todayStr();

  // All problems past their review date
  const allDueProblems = problems.filter((p) => p.nextReviewDate <= today);
  const totalDueCount = allDueProblems.length;

  // How many the user has reviewed today
  const reviewedToday = countReviewedToday(problems);

  // Effective goal: don't show "0 of 5" when only 3 problems exist to review
  const effectiveGoal = Math.min(dailyGoal, totalDueCount + reviewedToday);
  const remainingSlots = Math.max(0, effectiveGoal - reviewedToday);

  // Prioritize and cap to remaining slots
  const todaysReviews = prioritizeProblems(allDueProblems, remainingSlots);

  // Pattern stats
  const patternMap = {};
  problems.forEach((p) => {
    p.patterns.forEach((pat) => {
      if (!patternMap[pat]) patternMap[pat] = { count: 0, totalConf: 0 };
      patternMap[pat].count++;
      patternMap[pat].totalConf += p.confidence;
    });
  });
  const patternStats = Object.entries(patternMap)
    .map(([pattern, data]) => ({
      pattern,
      count: data.count,
      avgConfidence: data.totalConf / data.count,
    }))
    .sort((a, b) => b.count - a.count);

  const streak = calculateStreak();

  // Empty state — no problems at all
  if (problems.length === 0) {
    return (
      <div className="flex flex-col gap-6 p-5">
        <div className="rounded-xl border border-pb-border bg-pb-surface px-6 py-12 text-center">
          <div className="mb-4 text-[28px] font-bold text-pb-accent">⟡</div>
          <h2 className="mb-2.5 text-xl font-semibold text-pb-text">
            Welcome to PatternBank
          </h2>
          <p className="mx-auto max-w-[360px] text-sm leading-relaxed text-pb-text-muted">
            Start by adding your first LeetCode problem. Track patterns, build
            retention, and ace your interviews.
          </p>
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

      {/* Today's Reviews section */}
      <div>
        <div className="mb-3 flex items-center gap-2">
          <h2 className="text-[15px] font-semibold text-pb-text">
            Today's Reviews
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

      {/* Pattern Progress */}
      {patternStats.length > 0 && (
        <div>
          <SectionHeader title="Pattern Progress" />
          <div className="rounded-[10px] border border-pb-border bg-pb-surface px-5 py-3">
            {patternStats.map((ps) => (
              <PatternProgressRow
                key={ps.pattern}
                pattern={ps.pattern}
                count={ps.count}
                avgConfidence={ps.avgConfidence}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
