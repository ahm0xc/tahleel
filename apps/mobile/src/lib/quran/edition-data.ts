const EDITION_SOURCES = {
  "ara-quranuthmanihaf": require("~/../assets/quran/editions/ara-quranuthmanihaf.json"),
  "ara-quranindopak": require("~/../assets/quran/editions/ara-quranindopak.json"),
  "eng-mustafakhattaba": require("~/../assets/quran/editions/eng-mustafakhattaba.json"),
  "ben-abubakrzakaria": require("~/../assets/quran/editions/ben-abubakrzakaria.json"),
} as const;

export interface QuranVerse {
  verse: number;
  text: string;
}

interface EditionVerse {
  chapter: number;
  verse: number;
  text: string;
}

const indexCache = new Map<string, Map<number, QuranVerse[]>>();

function getIndex(editionId: string): Map<number, QuranVerse[]> {
  const cached = indexCache.get(editionId);

  if (cached) {
    return cached;
  }

  const source = EDITION_SOURCES[editionId as keyof typeof EDITION_SOURCES] as
    { quran: EditionVerse[] } | undefined;

  const index = new Map<number, QuranVerse[]>();

  for (const { chapter, verse, text } of source?.quran ?? []) {
    const verses = index.get(chapter);

    if (verses) {
      verses.push({ verse, text });
      continue;
    }

    index.set(chapter, [{ verse, text }]);
  }

  indexCache.set(editionId, index);

  return index;
}

export function getEditionChapter(
  editionId: string,
  chapterNumber: number
): QuranVerse[] {
  return getIndex(editionId).get(chapterNumber) ?? [];
}

export function getEditionVerse(
  editionId: string,
  chapterNumber: number,
  verseNumber: number
): QuranVerse | undefined {
  return getEditionChapter(editionId, chapterNumber).find(
    (entry) => entry.verse === verseNumber
  );
}

const SAMPLE_CHAPTER = 1;
const SAMPLE_VERSE = 1;

export function getEditionSample(editionId: string): string {
  return getEditionVerse(editionId, SAMPLE_CHAPTER, SAMPLE_VERSE)?.text ?? "";
}

export function getEditionSampleWord(editionId: string): string {
  return getEditionSample(editionId).split(" ")[0] ?? "";
}
