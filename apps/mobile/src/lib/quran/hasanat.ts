export interface Verse {
  chapter: number;
  verse: number;
  text: string;
}

export const HASANAT_PER_LETTER = 10;

/**
 * Base Arabic letters only. Everything else is ignored:
 * harakat, shadda, sukun, dagger alif (U+0670), small waw/yeh (U+06E5/6),
 * tatweel (U+0640), pause marks, verse-end symbols, spaces.
 * Works for both Uthmani and Indo-Pak scripts.
 */
const BASE_LETTERS = new RegExp(
  "[" +
    "\\u0621-\\u063A" + // hamza … ghain (all alif/hamza forms)
    "\\u0641-\\u064A" + // fa … ya (includes alif maqsura)
    "\\u0671" + // alif wasla (ٱ), Uthmani
    "\\u066E\\u066F" + // dotless beh/qaf variants
    "\\u06A9" + // ک (Urdu kaf)
    "\\u06BA\\u06BE" + // ں ھ
    "\\u06C0-\\u06C3" + // ۀ ہ ۂ ۃ
    "\\u06CC\\u06D2\\u06D3" + // ی ے ۓ
    "]",
  "g"
);

export function countLetters(verse: string): number {
  return (verse.match(BASE_LETTERS) ?? []).length;
}

export function calculateHasanat(verse: string): number {
  return countLetters(verse) * HASANAT_PER_LETTER;
}
