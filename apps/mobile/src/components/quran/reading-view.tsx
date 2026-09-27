import React from "react";

import { getArabicScript } from "~/constants/scripts";
import { getEditionChapter } from "~/lib/quran/edition-data";
import { usePreferences } from "~/store/preferences-store";
import { useReadingState } from "~/store/reading-state-store";

import { type PagedVerse, VersePager } from "./verse-pager";

export function ReadingView() {
  const chapterNumber = useReadingState((state) => state.chapterNumber);
  const verseNumber = useReadingState((state) => state.verseNumber);
  const setVerseNumber = useReadingState((state) => state.setVerseNumber);
  const scriptId = usePreferences((state) => state.scriptId);
  const fontSize = usePreferences((state) => state.arabicFontSize);
  const script = getArabicScript(scriptId);

  const verses = React.useMemo<PagedVerse[]>(
    () =>
      getEditionChapter(script.editionId, chapterNumber).map((verse) => ({
        key: `${script.editionId}:${chapterNumber}:${verse.verse}`,
        chapterNumber,
        verse,
      })),
    [chapterNumber, script.editionId]
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
      fontSize={fontSize}
      listKey={`${script.editionId}:${chapterNumber}`}
      initialIndex={initialIndex}
      onPageChange={handlePageChange}
      script={script}
      verses={verses}
    />
  );
}
