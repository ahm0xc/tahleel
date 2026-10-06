export const REMINDER_TIMES = [
  { id: "05:00", label: "5:00 AM", hour: 5, minute: 0 },
  { id: "10:00", label: "10:00 AM", hour: 10, minute: 0 },
  { id: "18:00", label: "6:00 PM", hour: 18, minute: 0 },
  { id: "20:00", label: "8:00 PM", hour: 20, minute: 0 },
] as const;

export type ReminderTime = (typeof REMINDER_TIMES)[number];
export type ReminderTimeId = ReminderTime["id"];

export function getReminderTime(id: ReminderTimeId): ReminderTime {
  return REMINDER_TIMES.find((time) => time.id === id) ?? REMINDER_TIMES[0];
}

export function isReminderTimeId(value: unknown): value is ReminderTimeId {
  return REMINDER_TIMES.some((time) => time.id === value);
}
