export const FONT_SIZE_MIN = 16;
export const FONT_SIZE_MAX = 40;
export const FONT_SIZE_STEP = 2;

export const DEFAULT_ARABIC_FONT_SIZE = 28;
export const DEFAULT_TRANSLATION_FONT_SIZE = 18;

export const ARABIC_LINE_HEIGHT_RATIO = 1.9;
export const TRANSLATION_LINE_HEIGHT_RATIO = 1.6;

export function clampFontSize(fontSize: number): number {
  if (!Number.isFinite(fontSize)) {
    return DEFAULT_ARABIC_FONT_SIZE;
  }

  return Math.min(
    FONT_SIZE_MAX,
    Math.max(
      FONT_SIZE_MIN,
      Math.round(fontSize / FONT_SIZE_STEP) * FONT_SIZE_STEP
    )
  );
}

export function getLineHeight(fontSize: number, ratio: number): number {
  return Math.round(fontSize * ratio);
}
