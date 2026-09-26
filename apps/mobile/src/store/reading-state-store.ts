import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

import { zustandStorage } from "~/lib/storage";

export type ReadingView = "default" | "favorites";

interface ReadingStateStore {
  chapterNumber: number;
  verseNumber: number;
  view: ReadingView;
  setChapterNumber: (chapterNumber: number) => void;
  setVerseNumber: (verseNumber: number) => void;
  setView: (view: ReadingView) => void;
}

export const useReadingState = create<ReadingStateStore>()(
  persist(
    (set) => ({
      chapterNumber: 1,
      verseNumber: 1,
      view: "default",
      setChapterNumber(chapterNumber) {
        set({ chapterNumber, verseNumber: 1 });
      },
      setVerseNumber(verseNumber) {
        set({ verseNumber: Math.max(1, verseNumber) });
      },
      setView(view) {
        set({ view });
      },
    }),
    {
      name: "reading-state-store",
      storage: createJSONStorage(() => zustandStorage),
      version: 1,
    }
  )
);
