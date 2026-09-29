export const DAILY_VERSE_GOALS = [1, 3, 5, 10] as const;

export type DailyVerseGoal = (typeof DAILY_VERSE_GOALS)[number];

export const DEFAULT_DAILY_VERSE_GOAL: DailyVerseGoal = 3;

export function isDailyVerseGoal(value: number): value is DailyVerseGoal {
  return DAILY_VERSE_GOALS.some((goal) => goal === value);
}
