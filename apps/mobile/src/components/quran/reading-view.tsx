import React from "react";

import { getArabicScript } from "~/constants/scripts";
import { getEditionChapter } from "~/lib/quran/edition-data";
import { usePreferences } from "~/store/preferences-store";
import { useReadingState } from "~/store/reading-state-store";
import { useStreaks } from "~/store/streaks-context";

import { type PagedVerse, VersePager } from "./verse-pager";

export function ReadingView() {
  const chapterNumber = useReadingState((state) => state.chapterNumber);
  const verseNumber = useReadingState((state) => state.verseNumber);
  const setVerseNumber = useReadingState((state) => state.setVerseNumber);
  const scriptId = usePreferences((state) => state.scriptId);
  const fontSize = usePreferences((state) => state.arabicFontSize);
  const script = getArabicScript(scriptId);
  const { recordVerseRead } = useStreaks();

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

  const activeIndexRef = React.useRef(initialIndex);
  const activeSinceRef = React.useRef(Date.now());
  const chapterNumberRef = React.useRef(chapterNumber);
  const versesRef = React.useRef(verses);
  const recordVerseReadRef = React.useRef(recordVerseRead);

  versesRef.current = verses;
  chapterNumberRef.current = chapterNumber;
  recordVerseReadRef.current = recordVerseRead;

  const handlePageChange = React.useCallback(
    (index: number) => {
      const previous = activeIndexRef.current;

      if (index !== previous) {
        const now = Date.now();
        const left = versesRef.current[previous];

        if (left) {
          recordVerseReadRef.current({
            chapterNumber: chapterNumberRef.current,
            verseNumber: left.verse.verse,
            text: left.verse.text,
            timeSpentMs: now - activeSinceRef.current,
          });
        }

        // A fast swipe can skip whole pages; every verse scrolled past still
        // counts as read, though the skipped ones spent no time on screen.
        for (
          let skippedIndex = previous + 1;
          skippedIndex < index;
          skippedIndex++
        ) {
          const skipped = versesRef.current[skippedIndex];
          if (!skipped) continue;

          recordVerseReadRef.current({
            chapterNumber: chapterNumberRef.current,
            verseNumber: skipped.verse.verse,
            text: skipped.verse.text,
            timeSpentMs: 0,
          });
        }

        activeIndexRef.current = index;
        activeSinceRef.current = now;
      }

      setVerseNumber(index + 1);
    },
    [setVerseNumber]
  );

  // Reset the tracking bookkeeping for a new chapter list.
  React.useEffect(() => {
    activeIndexRef.current = initialIndex;
    activeSinceRef.current = Date.now();
  }, [chapterNumber, initialIndex]);

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
