// Curated problem lists for PatternBank
// Verified against leetcodeProblems.js (3,846 problems) on March 2, 2026
// Pattern assignments use PatternBank's 18 patterns from constants.js

import { getProblemByNumber } from "./leetcodeProblems";

// ============================================================
// SHARED PATTERN MAP
// Each LC problem number → its primary PatternBank pattern
// One source of truth — shared across all lists
// ============================================================

const PATTERN_MAP = {
  // Hash Table
  1: "Hash Table",     // Two Sum
  7: "Hash Table",     // Reverse Integer
  8: "Hash Table",     // String to Integer (atoi)
  9: "Hash Table",     // Palindrome Number
  13: "Hash Table",    // Roman to Integer
  14: "Hash Table",    // Longest Common Prefix
  31: "Hash Table",    // Next Permutation
  36: "Hash Table",    // Valid Sudoku
  41: "Hash Table",    // First Missing Positive
  49: "Hash Table",    // Group Anagrams
  67: "Hash Table",    // Add Binary
  128: "Hash Table",   // Longest Consecutive Sequence
  136: "Hash Table",   // Single Number
  169: "Hash Table",   // Majority Element
  189: "Hash Table",   // Rotate Array
  190: "Hash Table",   // Reverse Bits
  191: "Hash Table",   // Number of 1 Bits
  217: "Hash Table",   // Contains Duplicate
  238: "Hash Table",   // Product of Array Except Self
  242: "Hash Table",   // Valid Anagram
  268: "Hash Table",   // Missing Number
  271: "Hash Table",   // Encode and Decode Strings
  338: "Hash Table",   // Counting Bits
  347: "Hash Table",   // Top K Frequent Elements
  380: "Hash Table",   // Insert Delete GetRandom O(1)
  383: "Hash Table",   // Ransom Note
  409: "Hash Table",   // Longest Palindrome
  525: "Hash Table",   // Contiguous Array
  560: "Hash Table",   // Subarray Sum Equals K

  // Two Pointers
  11: "Two Pointers",  // Container With Most Water
  15: "Two Pointers",  // 3Sum
  16: "Two Pointers",  // 3Sum Closest
  42: "Two Pointers",  // Trapping Rain Water
  75: "Two Pointers",  // Sort Colors
  125: "Two Pointers", // Valid Palindrome
  167: "Two Pointers", // Two Sum II
  283: "Two Pointers", // Move Zeroes
  287: "Two Pointers", // Find the Duplicate Number
  977: "Two Pointers", // Squares of a Sorted Array

  // Sliding Window
  3: "Sliding Window",   // Longest Substring Without Repeating Characters
  76: "Sliding Window",  // Minimum Window Substring
  239: "Sliding Window",  // Sliding Window Maximum
  424: "Sliding Window", // Longest Repeating Character Replacement
  438: "Sliding Window", // Find All Anagrams in a String
  567: "Sliding Window", // Permutation in String

  // Binary Search
  4: "Binary Search",    // Median of Two Sorted Arrays
  33: "Binary Search",   // Search in Rotated Sorted Array
  34: "Binary Search",   // Find First and Last Position
  35: "Binary Search",   // Search Insert Position
  50: "Binary Search",   // Pow(x, n)
  74: "Binary Search",   // Search a 2D Matrix
  153: "Binary Search",  // Find Minimum in Rotated Sorted Array
  240: "Binary Search",  // Search a 2D Matrix II
  278: "Binary Search",  // First Bad Version
  528: "Binary Search",  // Random Pick with Weight
  658: "Binary Search",  // Find K Closest Elements
  704: "Binary Search",  // Binary Search
  875: "Binary Search",  // Koko Eating Bananas
  981: "Binary Search",  // Time Based Key-Value Store

  // Sorting
  48: "Sorting",   // Rotate Image
  54: "Sorting",   // Spiral Matrix
  56: "Sorting",   // Merge Intervals
  57: "Sorting",   // Insert Interval
  73: "Sorting",   // Set Matrix Zeroes
  179: "Sorting",  // Largest Number
  252: "Sorting",  // Meeting Rooms
  253: "Sorting",  // Meeting Rooms II
  435: "Sorting",  // Non-overlapping Intervals
  759: "Sorting",  // Employee Free Time

  // Linked List
  2: "Linked List",    // Add Two Numbers
  19: "Linked List",   // Remove Nth Node From End of List
  21: "Linked List",   // Merge Two Sorted Lists
  24: "Linked List",   // Swap Nodes in Pairs
  25: "Linked List",   // Reverse Nodes in k-Group
  61: "Linked List",   // Rotate List
  138: "Linked List",  // Copy List with Random Pointer
  141: "Linked List",  // Linked List Cycle
  142: "Linked List",  // Linked List Cycle II
  143: "Linked List",  // Reorder List
  146: "Linked List",  // LRU Cache
  148: "Linked List",  // Sort List
  160: "Linked List",  // Intersection of Two Linked Lists
  206: "Linked List",  // Reverse Linked List
  234: "Linked List",  // Palindrome Linked List
  328: "Linked List",  // Odd Even Linked List
  876: "Linked List",  // Middle of the Linked List

  // Stack
  20: "Stack",   // Valid Parentheses
  84: "Stack",   // Largest Rectangle in Histogram
  150: "Stack",  // Evaluate Reverse Polish Notation
  155: "Stack",  // Min Stack
  224: "Stack",  // Basic Calculator
  227: "Stack",  // Basic Calculator II
  232: "Stack",  // Implement Queue using Stacks
  394: "Stack",  // Decode String
  735: "Stack",  // Asteroid Collision
  739: "Stack",  // Daily Temperatures
  844: "Stack",  // Backspace String Compare
  895: "Stack",  // Maximum Frequency Stack

  // Tree
  94: "Tree",    // Binary Tree Inorder Traversal
  98: "Tree",    // Validate Binary Search Tree
  100: "Tree",   // Same Tree
  101: "Tree",   // Symmetric Tree
  104: "Tree",   // Maximum Depth of Binary Tree
  105: "Tree",   // Construct Binary Tree from Preorder and Inorder
  108: "Tree",   // Convert Sorted Array to Binary Search Tree
  110: "Tree",   // Balanced Binary Tree
  113: "Tree",   // Path Sum II
  114: "Tree",   // Flatten Binary Tree to Linked List
  124: "Tree",   // Binary Tree Maximum Path Sum
  226: "Tree",   // Invert Binary Tree
  230: "Tree",   // Kth Smallest Element in a BST
  235: "Tree",   // Lowest Common Ancestor of a BST
  236: "Tree",   // Lowest Common Ancestor of a Binary Tree
  285: "Tree",   // Inorder Successor in BST
  297: "Tree",   // Serialize and Deserialize Binary Tree
  437: "Tree",   // Path Sum III
  543: "Tree",   // Diameter of Binary Tree
  572: "Tree",   // Subtree of Another Tree

  // BFS
  102: "BFS",    // Binary Tree Level Order Traversal
  103: "BFS",    // Binary Tree Zigzag Level Order Traversal
  127: "BFS",    // Word Ladder
  199: "BFS",    // Binary Tree Right Side View
  200: "BFS",    // Number of Islands
  310: "BFS",    // Minimum Height Trees
  417: "BFS",    // Pacific Atlantic Water Flow
  542: "BFS",    // 01 Matrix
  662: "BFS",    // Maximum Width of Binary Tree
  733: "BFS",    // Flood Fill
  815: "BFS",    // Bus Routes
  863: "BFS",    // All Nodes Distance K in Binary Tree
  994: "BFS",    // Rotting Oranges
  1197: "BFS",   // Minimum Knight Moves
  1730: "BFS",   // Shortest Path to Get Food

  // DFS
  329: "DFS",    // Longest Increasing Path in a Matrix

  // Heap
  23: "Heap",    // Merge k Sorted Lists
  215: "Heap",   // Kth Largest Element in an Array
  295: "Heap",   // Find Median from Data Stream
  362: "Heap",   // Design Hit Counter
  621: "Heap",   // Task Scheduler
  632: "Heap",   // Smallest Range Covering Elements from K Lists
  692: "Heap",   // Top K Frequent Words
  973: "Heap",   // K Closest Points to Origin

  // Greedy
  45: "Greedy",    // Jump Game II
  55: "Greedy",    // Jump Game
  121: "Greedy",   // Best Time to Buy and Sell Stock
  134: "Greedy",   // Gas Station
  763: "Greedy",   // Partition Labels

  // Backtracking
  17: "Backtracking",  // Letter Combinations of a Phone Number
  22: "Backtracking",  // Generate Parentheses
  37: "Backtracking",  // Sudoku Solver
  39: "Backtracking",  // Combination Sum
  46: "Backtracking",  // Permutations
  51: "Backtracking",  // N-Queens
  78: "Backtracking",  // Subsets
  79: "Backtracking",  // Word Search
  131: "Backtracking", // Palindrome Partitioning

  // Graph
  133: "Graph",  // Clone Graph
  207: "Graph",  // Course Schedule
  210: "Graph",  // Course Schedule II
  261: "Graph",  // Graph Valid Tree
  269: "Graph",  // Alien Dictionary
  323: "Graph",  // Number of Connected Components
  336: "Graph",  // Palindrome Pairs
  721: "Graph",  // Accounts Merge
  787: "Graph",  // Cheapest Flights Within K Stops

  // Union Find
  // (none exclusively in these lists)

  // Trie
  208: "Trie",   // Implement Trie (Prefix Tree)
  211: "Trie",   // Design Add and Search Words
  212: "Trie",   // Word Search II
  588: "Trie",   // Design In-Memory File System

  // DP
  5: "DP",       // Longest Palindromic Substring
  32: "DP",      // Longest Valid Parentheses
  53: "DP",      // Maximum Subarray
  62: "DP",      // Unique Paths
  64: "DP",      // Minimum Path Sum
  70: "DP",      // Climbing Stairs
  72: "DP",      // Edit Distance
  91: "DP",      // Decode Ways
  118: "DP",     // Pascal's Triangle
  139: "DP",     // Word Break
  152: "DP",     // Maximum Product Subarray
  198: "DP",     // House Robber
  213: "DP",     // House Robber II
  221: "DP",     // Maximal Square
  279: "DP",     // Perfect Squares
  300: "DP",     // Longest Increasing Subsequence
  322: "DP",     // Coin Change
  377: "DP",     // Combination Sum IV
  416: "DP",     // Partition Equal Subset Sum
  1143: "DP",    // Longest Common Subsequence
  1235: "DP",    // Maximum Profit in Job Scheduling
};

// ============================================================
// LIST DEFINITIONS
// ============================================================

const PROBLEM_LISTS = [
  {
    id: "blind75",
    name: "Blind 75",
    nameZh: "Blind 75",
    description: "The original curated interview prep list. 75 essential problems covering all core patterns.",
    source: "https://leetcode.com/list/oizxjoit",
    numbers: [
      1, 3, 5, 11, 15, 19, 20, 21, 23, 33, 39, 42, 48, 49, 53, 54, 55,
      56, 57, 62, 70, 73, 76, 79, 91, 98, 100, 102, 104, 105, 121, 124,
      125, 128, 133, 139, 141, 143, 152, 153, 155, 169, 190, 191, 198,
      200, 206, 207, 208, 211, 212, 213, 217, 226, 230, 235, 238, 242,
      252, 261, 268, 269, 271, 295, 297, 300, 322, 323, 338, 347, 416,
      417, 424, 435, 572,
    ],
  },
  {
    id: "grind75",
    name: "Grind 75",
    nameZh: "Grind 75",
    description: "Modernized Blind 75 by the same author, with a structured weekly study plan.",
    source: "https://www.techinterviewhandbook.org/grind75/",
    numbers: [
      1, 3, 5, 8, 9, 13, 14, 15, 20, 21, 33, 39, 46, 53, 54, 56, 57,
      62, 67, 70, 75, 78, 98, 100, 101, 102, 104, 105, 108, 110, 121,
      125, 133, 136, 139, 141, 150, 155, 169, 190, 191, 199, 200, 206,
      207, 208, 217, 226, 232, 234, 235, 236, 238, 242, 252, 268, 278,
      283, 322, 338, 383, 409, 416, 542, 543, 572, 704, 721, 733, 844,
      876, 973, 977, 981, 994,
    ],
  },
  {
    id: "grind169",
    name: "Grind 169",
    nameZh: "Grind 169",
    description: "Extended Grind 75 with 94 additional problems for thorough interview coverage.",
    source: "https://www.techinterviewhandbook.org/grind75/",
    numbers: [
      1, 2, 3, 4, 5, 7, 8, 9, 11, 13, 14, 15, 16, 17, 19, 20, 21, 22,
      23, 24, 25, 31, 32, 33, 36, 37, 39, 41, 42, 46, 48, 49, 50, 51,
      53, 54, 55, 56, 57, 61, 62, 67, 70, 73, 74, 75, 76, 78, 79, 84,
      91, 98, 100, 101, 102, 103, 104, 105, 108, 110, 113, 121, 124, 125,
      127, 128, 133, 134, 136, 139, 141, 143, 146, 148, 150, 152, 153,
      155, 169, 179, 189, 190, 191, 198, 199, 200, 206, 207, 208, 210,
      211, 212, 215, 217, 221, 224, 226, 227, 230, 232, 234, 235, 236,
      238, 239, 242, 252, 253, 261, 268, 269, 271, 278, 283, 285, 287,
      295, 297, 300, 310, 322, 323, 328, 329, 336, 338, 362, 377, 380,
      383, 394, 409, 416, 417, 424, 435, 437, 438, 525, 528, 542, 543,
      560, 572, 588, 621, 632, 658, 662, 692, 704, 721, 733, 735, 739,
      759, 787, 815, 844, 863, 876, 895, 973, 977, 981, 994, 1197, 1235,
      1730,
    ],
  },
  {
    id: "hot100",
    name: "LeetCode Hot 100",
    nameZh: "力扣热题 100",
    description: "The 100 most popular problems on LeetCode — a must-do list in the Chinese tech community.",
    source: "https://leetcode.cn/studyplan/top-100-liked/",
    numbers: [
      1, 2, 3, 4, 5, 11, 15, 17, 19, 20, 21, 22, 23, 24, 25, 31, 32,
      33, 34, 35, 39, 41, 42, 45, 46, 48, 49, 51, 53, 54, 55, 56, 62,
      64, 70, 72, 73, 74, 75, 76, 78, 79, 84, 94, 98, 101, 102, 104,
      105, 108, 114, 118, 121, 124, 128, 131, 136, 138, 139, 141, 142,
      146, 148, 152, 153, 155, 160, 169, 189, 198, 199, 200, 206, 207,
      208, 215, 226, 230, 234, 236, 238, 239, 240, 279, 283, 287, 295,
      300, 322, 347, 394, 416, 437, 438, 543, 560, 739, 763, 994, 1143,
    ],
  },
];

// ============================================================
// PUBLIC API
// ============================================================

/**
 * Get all available lists with computed counts.
 * @param {Set<number>} existingNumbers - LC numbers already in user's library
 * @returns {Array<{ id, name, nameZh, description, total, existing, newCount }>}
 */
export function getListSummaries(existingNumbers) {
  return PROBLEM_LISTS.map((list) => {
    const validNumbers = list.numbers.filter((n) => getProblemByNumber(n));
    const existing = validNumbers.filter((n) => existingNumbers.has(n)).length;
    return {
      id: list.id,
      name: list.name,
      nameZh: list.nameZh,
      description: list.description,
      total: validNumbers.length,
      existing,
      newCount: validNumbers.length - existing,
    };
  });
}

/**
 * Get the problems to add for a specific list.
 * Returns only problems NOT already in the user's library.
 * Each problem gets its pattern from PATTERN_MAP.
 * @param {string} listId
 * @param {Set<number>} existingNumbers - LC numbers already in user's library
 * @returns {{ lcProblems: Array, patternMap: Map<number, string[]> }}
 */
export function getListProblems(listId, existingNumbers) {
  const list = PROBLEM_LISTS.find((l) => l.id === listId);
  if (!list) return { lcProblems: [], patternMap: new Map() };

  const lcProblems = [];
  const patternMap = new Map();

  for (const num of list.numbers) {
    // Skip if already in library
    if (existingNumbers.has(num)) continue;

    // Look up in our LC database
    const problem = getProblemByNumber(num);
    if (!problem) continue; // Safety: skip if not in DB

    lcProblems.push(problem);

    // Assign pattern if we have one
    const pattern = PATTERN_MAP[num];
    if (pattern) {
      patternMap.set(num, [pattern]);
    }
  }

  return { lcProblems, patternMap };
}
