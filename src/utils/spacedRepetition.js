// Simplified SM-2 intervals based on confidence rating
// confidence 1 → 1 day, 2 → 1 day, 3 → 3 days, 4 → 7 days, 5 → 14 days
const INTERVALS = { 1: 1, 2: 1, 3: 3, 4: 7, 5: 14 };

export function getIntervalDays(confidence) {
  return INTERVALS[confidence] || 1;
}
