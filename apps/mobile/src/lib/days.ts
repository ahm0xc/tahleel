const MILLISECONDS_PER_DAY = 86_400_000;

function toEpochDay(day: string): number {
  return (
    Date.UTC(
      Number(day.slice(0, 4)),
      Number(day.slice(5, 7)) - 1,
      Number(day.slice(8, 10))
    ) / MILLISECONDS_PER_DAY
  );
}

function fromEpochDay(epochDay: number): string {
  const date = new Date(epochDay * MILLISECONDS_PER_DAY);
  return [
    String(date.getUTCFullYear()).padStart(4, "0"),
    String(date.getUTCMonth() + 1).padStart(2, "0"),
    String(date.getUTCDate()).padStart(2, "0"),
  ].join("-");
}

export function toUTCDay(date: Date): string {
  return date.toISOString().slice(0, 10);
}

export function todayInUTC(): string {
  return toUTCDay(new Date());
}

export function addDays(day: string, amount: number): string {
  return fromEpochDay(toEpochDay(day) + amount);
}

export function diffInDays(from: string, to: string): number {
  return toEpochDay(to) - toEpochDay(from);
}
