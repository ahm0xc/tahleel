import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

import {
  type ArabicScriptId,
  DEFAULT_ARABIC_SCRIPT,
} from "~/constants/scripts";
import {
  DEFAULT_TRANSLATION_LANGUAGE,
  type TranslationLanguageId,
} from "~/constants/translations";
import {
  DEFAULT_ARABIC_FONT_SIZE,
  DEFAULT_TRANSLATION_FONT_SIZE,
  clampFontSize,
} from "~/constants/typography";
import { zustandStorage } from "~/lib/storage";

interface PreferencesStore {
  scriptId: ArabicScriptId;
  translationLanguageId: TranslationLanguageId;
  arabicFontSize: number;
  translationFontSize: number;
  setScriptId: (scriptId: ArabicScriptId) => void;
  setTranslationLanguageId: (id: TranslationLanguageId) => void;
  setArabicFontSize: (fontSize: number) => void;
  setTranslationFontSize: (fontSize: number) => void;
}

export const usePreferences = create<PreferencesStore>()(
  persist(
    (set) => ({
      scriptId: DEFAULT_ARABIC_SCRIPT,
      translationLanguageId: DEFAULT_TRANSLATION_LANGUAGE,
      arabicFontSize: DEFAULT_ARABIC_FONT_SIZE,
      translationFontSize: DEFAULT_TRANSLATION_FONT_SIZE,
      setScriptId(scriptId) {
        set({ scriptId });
      },
      setTranslationLanguageId(translationLanguageId) {
        set({ translationLanguageId });
      },
      setArabicFontSize(arabicFontSize) {
        set({ arabicFontSize: clampFontSize(arabicFontSize) });
      },
      setTranslationFontSize(translationFontSize) {
        set({ translationFontSize: clampFontSize(translationFontSize) });
      },
    }),
    {
      name: "preferences-store",
      storage: createJSONStorage(() => zustandStorage),
      version: 1,
    }
  )
);
