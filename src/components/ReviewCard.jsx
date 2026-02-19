import { useState } from "react";
import StarRating from "./StarRating";
import DifficultyBadge from "./DifficultyBadge";
import PatternTag from "./PatternTag";
import { formatRelativeDate } from "../utils/dateHelpers";

export default function ReviewCard({ problem, onReview, onDismiss }) {
  const [reviewing, setReviewing] = useState(false);
  const [newConfidence, setNewConfidence] = useState(problem.confidence);

  const handleStartReview = () => {
    if (problem.url) window.open(problem.url, "_blank", "noopener,noreferrer");
    setReviewing(true);
  };

  const handleDone = () => {
    onReview(problem.id, newConfidence);
    setReviewing(false);
  };

  const lastReviewedText = problem.lastReviewed
    ? `Last reviewed: ${formatRelativeDate(problem.lastReviewed)}`
    : "Never reviewed";

  return (
    <div className="rounded-[10px] border border-pb-border border-l-[3px] border-l-pb-star bg-pb-surface px-5 py-4">
      {/* Title row */}
      <div className="mb-2 flex flex-wrap items-start justify-between">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-[15px] font-semibold text-pb-text">
            {problem.title}
          </span>
          {problem.leetcodeNumber && (
            <span className="text-xs text-pb-text-muted">
              #{problem.leetcodeNumber}
            </span>
          )}
        </div>
        <DifficultyBadge difficulty={problem.difficulty} />
      </div>

      {/* Pattern tags */}
      <div className="mb-2 flex flex-wrap gap-1.5">
        {problem.patterns.map((p) => (
          <PatternTag key={p} name={p} />
        ))}
      </div>

      {/* Confidence and last reviewed */}
      <div className="mb-3 flex items-center justify-between">
        <StarRating value={problem.confidence} size={16} />
        <span className="text-xs text-pb-text-muted">{lastReviewedText}</span>
      </div>

      {/* Review flow or action buttons */}
      {reviewing ? (
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-lg bg-pb-bg px-4 py-3.5">
          <div>
            <div className="mb-1.5 text-xs text-pb-text-muted">
              Rate your confidence:
            </div>
            <StarRating value={newConfidence} onChange={setNewConfidence} size={22} />
          </div>
          <button
            onClick={handleDone}
            className="cursor-pointer rounded-lg border-none bg-pb-success px-5 py-2 text-[13px] font-semibold text-white hover:opacity-85"
          >
            Done
          </button>
        </div>
      ) : (
        <div className="flex gap-2">
          <button
            onClick={handleStartReview}
            className="flex-1 cursor-pointer rounded-lg border-none bg-pb-accent-subtle py-2 text-[13px] font-semibold text-pb-accent transition-all duration-150 hover:bg-pb-accent hover:text-white"
          >
            Review Now
          </button>
          <button
            onClick={() => onDismiss(problem.id)}
            className="cursor-pointer rounded-lg border border-pb-border bg-transparent px-4 py-2 text-[13px] font-medium text-pb-text-muted transition-colors duration-150 hover:border-pb-text-muted"
          >
            Dismiss
          </button>
        </div>
      )}
    </div>
  );
}
