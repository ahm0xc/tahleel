import { z } from "zod";

const DAY_PATTERN = /^\d{4}-\d{2}-\d{2}$/;
const MILLISECONDS_PER_DAY = 86_400_000;

function toEpochDay(day: string): number {
  const date = new Date(0);
  date.setUTCFullYear(
    Number(day.slice(0, 4)),
    Number(day.slice(5, 7)) - 1,
    Number(day.slice(8, 10))
  );
  return date.getTime() / MILLISECONDS_PER_DAY;
}

function fromEpochDay(epochDay: number): string {
  const date = new Date(epochDay * MILLISECONDS_PER_DAY);
  return [
    String(date.getUTCFullYear()).padStart(4, "0"),
    String(date.getUTCMonth() + 1).padStart(2, "0"),
    String(date.getUTCDate()).padStart(2, "0"),
  ].join("-");
}

function isRealCalendarDate(day: string): boolean {
  const year = Number(day.slice(0, 4));
  const month = Number(day.slice(5, 7));
  const dayOfMonth = Number(day.slice(8, 10));
  const date = new Date(0);
  date.setUTCFullYear(year, month - 1, dayOfMonth);
  return (
    date.getUTCFullYear() === year &&
    date.getUTCMonth() === month - 1 &&
    date.getUTCDate() === dayOfMonth
  );
}

export const daySchema = z
  .string()
  .regex(DAY_PATTERN, "Expected a YYYY-MM-DD day")
  .refine(isRealCalendarDate, "Not a real calendar date");

export function addDays(day: string, amount: number): string {
  return fromEpochDay(toEpochDay(day) + amount);
}

export function diffInDays(from: string, to: string): number {
  return toEpochDay(to) - toEpochDay(from);
}

export function todayInUTC(): string {
  return new Date().toISOString().slice(0, 10);
}
