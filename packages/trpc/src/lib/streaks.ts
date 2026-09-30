import { diffInDays } from "./days.js";

export interface StreakState {
  currentStreak: number;
  longestStreak: number;
  lastCompletedDay: string | null;
}

export const EMPTY_STREAK: StreakState = {
  currentStreak: 0,
  longestStreak: 0,
  lastCompletedDay: null,
};

export function isStreakAlive(streak: StreakState, today: string): boolean {
  if (!streak.lastCompletedDay) return false;
  return diffInDays(streak.lastCompletedDay, today) <= 1;
}

export function readStreak(streak: StreakState, today: string): StreakState {
  return isStreakAlive(streak, today)
    ? streak
    : { ...streak, currentStreak: 0 };
}

export function advanceStreak(streak: StreakState, day: string): StreakState {
  if (!streak.lastCompletedDay) {
    return { currentStreak: 1, longestStreak: 1, lastCompletedDay: day };
  }

  const gap = diffInDays(streak.lastCompletedDay, day);

  if (gap === 0 || gap < 0) {
    return streak;
  }

  const currentStreak = gap === 1 ? streak.currentStreak + 1 : 1;

  return {
    currentStreak,
    longestStreak: Math.max(streak.longestStreak, currentStreak),
    lastCompletedDay: day,
  };
}
