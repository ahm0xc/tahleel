import { create } from "zustand";

import { type ReciterId } from "~/constants/reciters";

export interface RecitationTarget {
  chapterNumber: number;
  verseNumber: number;
}

export interface RecitationPreview {
  reciterId: ReciterId;
  phase: "loading" | "playing";
}

interface RecitationStore {
  current: RecitationTarget | null;
  isLoading: boolean;
  followTarget: RecitationTarget | null;
  followToken: number;
  preview: RecitationPreview | null;
  setCurrent: (target: RecitationTarget | null) => void;
  setLoading: (isLoading: boolean) => void;
  setPreview: (preview: RecitationPreview | null) => void;
  follow: (target: RecitationTarget) => void;
  reset: () => void;
}

export const useRecitation = create<RecitationStore>()((set) => ({
  current: null,
  isLoading: false,
  followTarget: null,
  followToken: 0,
  preview: null,
  setCurrent(current) {
    set({ current, isLoading: current !== null });
  },
  setLoading(isLoading) {
    set({ isLoading });
  },
  setPreview(preview) {
    set({ preview });
  },
  follow(followTarget) {
    set((state) => ({ followTarget, followToken: state.followToken + 1 }));
  },
  reset() {
    set((state) => ({
      current: null,
      isLoading: false,
      followTarget: null,
      preview: null,
      followToken: state.followToken,
    }));
  },
}));

export function isSameTarget(
  a: RecitationTarget | null,
  b: RecitationTarget
): boolean {
  return (
    a !== null &&
    a.chapterNumber === b.chapterNumber &&
    a.verseNumber === b.verseNumber
  );
}
