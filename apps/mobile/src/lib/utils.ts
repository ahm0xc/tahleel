import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const isDev = __DEV__;

export function withOpacity(color: string, opacity: number) {
  const hex = color.trim().replace("#", "");

  if (!/^(?:[\da-f]{3,4}|[\da-f]{6}|[\da-f]{8})$/i.test(hex)) {
    return color;
  }

  const expanded =
    hex.length <= 4
      ? hex
          .split("")
          .map((char) => char + char)
          .join("")
      : hex;
  const alpha = Math.round(Math.min(Math.max(opacity, 0), 1) * 255)
    .toString(16)
    .padStart(2, "0");

  return `#${expanded}${alpha}`;
}

export interface TruncateStringOptions {
  maxLength: number;
  ellipsis?: string;
  phase?: "start" | "middle" | "end";
}

export function truncateString(
  string: string,
  options: TruncateStringOptions = { maxLength: 10, phase: "end" }
) {
  const { maxLength, ellipsis = "...", phase } = options;

  if (string.length <= maxLength) {
    return string;
  }

  const ellipsisLength = ellipsis.length;
  const availableLength = maxLength - ellipsisLength;

  if (availableLength <= 0) {
    return ellipsis.slice(0, maxLength);
  }

  if (phase === "start") {
    return ellipsis + string.slice(-availableLength);
  }

  if (phase === "middle") {
    const halfLength = Math.floor(availableLength / 2);
    const firstHalf = string.slice(0, halfLength);
    const secondHalf = string.slice(-(availableLength - halfLength));
    return firstHalf + ellipsis + secondHalf;
  }

  return string.slice(0, availableLength) + ellipsis;
}
