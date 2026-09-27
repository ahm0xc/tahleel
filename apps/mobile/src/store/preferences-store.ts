import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

import {
  DEFAULT_LANGUAGE,
  type EditionLanguage,
  getEditionsByLanguage,
} from "~/constants/editions";
import { zustandStorage } from "~/lib/storage";

interface PreferencesStateStore {
  language: EditionLanguage;
  editionId: string;
  setLanguage: (language: EditionLanguage) => void;
  setEditionId: (editionId: string) => void;
}

function defaultEditionId(language: EditionLanguage): string {
  return getEditionsByLanguage(language)[0]?.id ?? "";
}

export const usePreferences = create<PreferencesStateStore>()(
  persist(
    (set) => ({
      language: DEFAULT_LANGUAGE,
      editionId: defaultEditionId(DEFAULT_LANGUAGE),
      setLanguage(language) {
        set({ language, editionId: defaultEditionId(language) });
      },
      setEditionId(editionId) {
        set({ editionId });
      },
    }),
    {
      name: "preferences-store",
      storage: createJSONStorage(() => zustandStorage),
      version: 1,
    }
  )
);
