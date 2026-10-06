import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

import {
  DEFAULT_DAILY_VERSE_GOAL,
  type DailyVerseGoal,
  isDailyVerseGoal,
} from "~/constants/goals";
import {
  DEFAULT_DAILY_DOSE_TIME_ID,
  type DailyDoseTimeId,
  isDailyDoseTimeId,
} from "~/constants/daily-dose-times";
import { type ReminderTimeId, isReminderTimeId } from "~/constants/reminders";
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
  dailyVerseGoal: DailyVerseGoal;
  reminderTimeId: ReminderTimeId | null;
  dailyDoseEnabled: boolean;
  dailyDoseTimeId: DailyDoseTimeId;
  dailyDoseTranslationId: TranslationLanguageId;
  setScriptId: (scriptId: ArabicScriptId) => void;
  setTranslationLanguageId: (id: TranslationLanguageId) => void;
  setArabicFontSize: (fontSize: number) => void;
  setTranslationFontSize: (fontSize: number) => void;
  setDailyVerseGoal: (goal: DailyVerseGoal) => void;
  setReminderTimeId: (id: ReminderTimeId | null) => void;
  setDailyDoseEnabled: (enabled: boolean) => void;
  setDailyDoseTimeId: (id: DailyDoseTimeId) => void;
  setDailyDoseTranslationId: (id: TranslationLanguageId) => void;
}

export const usePreferences = create<PreferencesStore>()(
  persist(
    (set) => ({
      scriptId: DEFAULT_ARABIC_SCRIPT,
      translationLanguageId: DEFAULT_TRANSLATION_LANGUAGE,
      arabicFontSize: DEFAULT_ARABIC_FONT_SIZE,
      translationFontSize: DEFAULT_TRANSLATION_FONT_SIZE,
      dailyVerseGoal: DEFAULT_DAILY_VERSE_GOAL,
      reminderTimeId: null,
      dailyDoseEnabled: false,
      dailyDoseTimeId: DEFAULT_DAILY_DOSE_TIME_ID,
      dailyDoseTranslationId: DEFAULT_TRANSLATION_LANGUAGE,
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
      setDailyVerseGoal(dailyVerseGoal) {
        set({
          dailyVerseGoal: isDailyVerseGoal(dailyVerseGoal)
            ? dailyVerseGoal
            : DEFAULT_DAILY_VERSE_GOAL,
        });
      },
      setReminderTimeId(reminderTimeId) {
        set({
          reminderTimeId:
            reminderTimeId === null || isReminderTimeId(reminderTimeId)
              ? reminderTimeId
              : null,
        });
      },
      setDailyDoseEnabled(dailyDoseEnabled) {
        set({ dailyDoseEnabled });
      },
      setDailyDoseTimeId(dailyDoseTimeId) {
        set({
          dailyDoseTimeId: isDailyDoseTimeId(dailyDoseTimeId)
            ? dailyDoseTimeId
            : DEFAULT_DAILY_DOSE_TIME_ID,
        });
      },
      setDailyDoseTranslationId(dailyDoseTranslationId) {
        set({ dailyDoseTranslationId });
      },
    }),
    {
      name: "preferences-store",
      storage: createJSONStorage(() => zustandStorage),
      version: 1,
    }
  )
);
