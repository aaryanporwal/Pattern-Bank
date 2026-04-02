import type { PatternColor, Preferences } from "../types";

export const CORE_PATTERNS = [
  "Two Pointers", "Hash Table", "Sliding Window",
  "Binary Search", "Sorting", "Linked List",
  "Stack", "Queue", "Tree",
  "BFS", "DFS", "Heap",
  "Greedy", "Backtracking", "Graph",
  "Union Find", "Trie", "DP",
] as const;

export const EXTRA_PATTERNS = [
  "Intervals", "Mono Stack", "Prefix Sum",
  "Bit", "System Design", "OOD",
] as const;

export const PATTERN_COLORS: Record<string, PatternColor> = {
  "Two Pointers":       { text: "#7ee8c7", bg: "rgba(126,232,199,0.12)" },
  "Hash Table":         { text: "#e8a87e", bg: "rgba(232,168,126,0.12)" },
  "Sliding Window":     { text: "#7ecbe8", bg: "rgba(126,203,232,0.12)" },
  "Binary Search":      { text: "#e8c77e", bg: "rgba(232,199,126,0.12)" },
  "Sorting":            { text: "#a0a8e8", bg: "rgba(160,168,232,0.12)" },
  "Linked List":        { text: "#48d4b8", bg: "rgba(72,212,184,0.12)" },
  "Stack":              { text: "#7ea8e8", bg: "rgba(126,168,232,0.12)" },
  "Queue":              { text: "#8eaee8", bg: "rgba(142,174,232,0.12)" },
  "Tree":               { text: "#7ee89c", bg: "rgba(126,232,156,0.12)" },
  "BFS":                { text: "#e87e7e", bg: "rgba(232,126,126,0.12)" },
  "DFS":                { text: "#e8607e", bg: "rgba(232,96,126,0.12)" },
  "Heap":               { text: "#e8987e", bg: "rgba(232,152,126,0.12)" },
  "Greedy":             { text: "#b8e87e", bg: "rgba(184,232,126,0.12)" },
  "Backtracking":       { text: "#e8e07e", bg: "rgba(232,224,126,0.12)" },
  "Graph":              { text: "#e87eb8", bg: "rgba(232,126,184,0.12)" },
  "Union Find":         { text: "#d4a8e8", bg: "rgba(212,168,232,0.12)" },
  "Trie":               { text: "#8ce87e", bg: "rgba(140,232,126,0.12)" },
  "DP":                  { text: "#c57ee8", bg: "rgba(197,126,232,0.12)" },
  "Intervals":          { text: "#e88ea8", bg: "rgba(232,142,168,0.12)" },
  "Mono Stack":         { text: "#8b8ee8", bg: "rgba(139,142,232,0.12)" },
  "Prefix Sum":         { text: "#e87ed8", bg: "rgba(232,126,216,0.12)" },
  "Bit":                { text: "#d8e87e", bg: "rgba(216,232,126,0.12)" },
  "System Design":      { text: "#78b8a8", bg: "rgba(120,184,168,0.12)" },
  "OOD":                { text: "#c89078", bg: "rgba(200,144,120,0.12)" },
};

export function getVisiblePatterns(enabledExtras: string[]): string[] {
  return [
    ...CORE_PATTERNS,
    ...EXTRA_PATTERNS.filter((p) => enabledExtras.includes(p)),
  ];
}

export const DIFFICULTIES = ["Easy", "Medium", "Hard"] as const;

export const STORAGE_KEY = "patternbank-problems";
export const REVIEW_LOG_KEY = "patternbank-review-log";
export const REVIEW_EVENTS_KEY = "patternbank-review-events";
export const PREFERENCES_KEY = "patternbank-preferences";

export const DEFAULT_PREFERENCES: Preferences = {
  dailyReviewGoal: 5,
  hidePatternsDuringReview: false,
  enabledExtraPatterns: [],
};
