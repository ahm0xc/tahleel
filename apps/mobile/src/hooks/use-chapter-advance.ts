import React from "react";

import { type Chapter, getChapter } from "~/constants/chapters";
import { triggerHaptic } from "~/lib/haptics";
import { useReadingState } from "~/store/reading-state-store";

const ADVANCE_DELAY_MS = 3000;

export interface ChapterAdvance {
  chapter: Chapter | null;
  isRevealing: boolean;
}

export function useChapterAdvance() {
  const setChapterNumber = useReadingState((state) => state.setChapterNumber);
  const [advance, setAdvance] = React.useState<ChapterAdvance | null>(null);
  const timerRef = React.useRef<ReturnType<typeof setTimeout> | null>(null);
  const isPendingRef = React.useRef(false);

  const startAdvance = React.useCallback(
    (chapterNumber: number) => {
      if (isPendingRef.current) {
        return;
      }

      const chapter = getChapter(chapterNumber + 1) ?? null;

      isPendingRef.current = true;
      setAdvance({ chapter, isRevealing: false });

      timerRef.current = setTimeout(() => {
        timerRef.current = null;

        if (chapter !== null) {
          triggerHaptic("Light");
          setChapterNumber(chapter.chapterNumber);
        }

        setAdvance((current) => current && { ...current, isRevealing: true });
      }, ADVANCE_DELAY_MS);
    },
    [setChapterNumber]
  );

  const dismissAdvance = React.useCallback(() => {
    if (timerRef.current !== null) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }

    isPendingRef.current = false;
    setAdvance(null);
  }, []);

  React.useEffect(() => {
    return () => {
      isPendingRef.current = false;

      if (timerRef.current !== null) {
        clearTimeout(timerRef.current);
      }
    };
  }, []);

  return { advance, dismissAdvance, startAdvance };
}
