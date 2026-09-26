import React from "react";

import { getEnglishChapter } from "~/lib/quran/english-edition";
import { useReadingState } from "~/store/reading-state-store";

import { type PagedVerse, VersePager } from "./verse-pager";

export function ReadingView() {
  const chapterNumber = useReadingState((state) => state.chapterNumber);
  const verseNumber = useReadingState((state) => state.verseNumber);
  const setVerseNumber = useReadingState((state) => state.setVerseNumber);

  const verses = React.useMemo<PagedVerse[]>(
    () =>
      getEnglishChapter(chapterNumber).map((verse) => ({
        key: `${chapterNumber}:${verse.verse}`,
        chapterNumber,
        verse,
      })),
    [chapterNumber]
  );

  const initialIndex = React.useMemo(
    () =>
      Math.min(Math.max(verseNumber - 1, 0), Math.max(verses.length - 1, 0)),
    [verseNumber, verses.length]
  );

  const handlePageChange = React.useCallback(
    (index: number) => {
      setVerseNumber(index + 1);
    },
    [setVerseNumber]
  );

  return (
    <VersePager
      listKey={String(chapterNumber)}
      initialIndex={initialIndex}
      onPageChange={handlePageChange}
      verses={verses}
    />
  );
}
