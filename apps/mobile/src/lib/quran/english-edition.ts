import englishEdition from "~/../assets/quran/editions/eng-mustafakhattaba.json";

export interface EnglishVerse {
  verse: number;
  text: string;
}

interface EditionVerse {
  chapter: number;
  verse: number;
  text: string;
}

const versesByChapter = buildIndex();

function buildIndex() {
  const index = new Map<number, EnglishVerse[]>();

  for (const { chapter, verse, text } of (
    englishEdition as { quran: EditionVerse[] }
  ).quran) {
    const verses = index.get(chapter);

    if (verses) {
      verses.push({ verse, text });
      continue;
    }

    index.set(chapter, [{ verse, text }]);
  }

  return index;
}

export function getEnglishChapter(chapterNumber: number): EnglishVerse[] {
  return versesByChapter.get(chapterNumber) ?? [];
}

export function getEnglishVerseCount(chapterNumber: number): number {
  return versesByChapter.get(chapterNumber)?.length ?? 0;
}

export function getEnglishVerse(
  chapterNumber: number,
  verseNumber: number
): EnglishVerse | undefined {
  return getEnglishChapter(chapterNumber).find(
    (entry) => entry.verse === verseNumber
  );
}
