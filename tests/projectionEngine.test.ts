import { describe, it, expect } from "vitest";
import { simulateProjection } from "../src/utils/projectionEngine";
import type { ProjectionSnapshot } from "../src/utils/projectionEngine";

function totalCount(d: [number, number, number, number, number]): number {
  return d[0] + d[1] + d[2] + d[3] + d[4];
}

describe("simulateProjection", () => {
  it("10 problems at star 1 with 5/day should have 0 at star 1 after 30 days", () => {
    const snapshots = simulateProjection([10, 0, 0, 0, 0], 5, 0, 30);
    const day30 = snapshots.find((s) => s.day === 30)!;
    expect(day30.distribution[0]).toBe(0);
    // All 10 should have advanced
    expect(totalCount(day30.distribution)).toBe(10);
  });

  it("0 daily goal means no change in existing problems", () => {
    const snapshots = simulateProjection([5, 3, 2, 0, 0], 0, 0, 30);
    const day0 = snapshots.find((s) => s.day === 0)!;
    const day30 = snapshots.find((s) => s.day === 30)!;
    expect(day30.distribution).toEqual(day0.distribution);
  });

  it("new problems/week increases total count correctly", () => {
    const snapshots = simulateProjection([0, 0, 0, 0, 0], 5, 3, 30);
    const day30 = snapshots.find((s) => s.day === 30)!;
    // 3 new per week spread across 7 days, 30 days = 4 full weeks + 2 extra days
    // 4 complete weeks × 3 = 12 new problems
    expect(totalCount(day30.distribution)).toBe(12);
  });

  it("confidence caps at 5 stars", () => {
    const snapshots = simulateProjection([0, 0, 0, 0, 20], 5, 0, 30);
    const day30 = snapshots.find((s) => s.day === 30)!;
    expect(day30.distribution[4]).toBe(20); // all still at 5
    expect(totalCount(day30.distribution)).toBe(20);
  });

  it("empty library returns all-zero snapshots when no new problems", () => {
    const snapshots = simulateProjection([0, 0, 0, 0, 0], 5, 0, 30);
    for (const s of snapshots) {
      expect(s.distribution).toEqual([0, 0, 0, 0, 0]);
    }
  });

  it("returns 4 snapshots at days 0, 10, 20, 30", () => {
    const snapshots = simulateProjection([5, 0, 0, 0, 0], 3, 0, 30);
    expect(snapshots).toHaveLength(4);
    expect(snapshots.map((s) => s.day)).toEqual([0, 10, 20, 30]);
  });
});
