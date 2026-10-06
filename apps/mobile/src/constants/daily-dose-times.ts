export const DAILY_DOSE_TIMES = [
  { id: "06:00", label: "6:00 AM", hour: 6, minute: 0 },
  { id: "09:00", label: "9:00 AM", hour: 9, minute: 0 },
  { id: "12:00", label: "12:00 PM", hour: 12, minute: 0 },
  { id: "15:00", label: "3:00 PM", hour: 15, minute: 0 },
  { id: "18:00", label: "6:00 PM", hour: 18, minute: 0 },
  { id: "20:00", label: "8:00 PM", hour: 20, minute: 0 },
] as const;

export type DailyDoseTime = (typeof DAILY_DOSE_TIMES)[number];
export type DailyDoseTimeId = DailyDoseTime["id"];

export const DEFAULT_DAILY_DOSE_TIME_ID: DailyDoseTimeId = "15:00";

export function getDailyDoseTime(id: DailyDoseTimeId): DailyDoseTime {
  return DAILY_DOSE_TIMES.find((time) => time.id === id) ?? DAILY_DOSE_TIMES[5];
}

export function isDailyDoseTimeId(value: unknown): value is DailyDoseTimeId {
  return DAILY_DOSE_TIMES.some((time) => time.id === value);
}
