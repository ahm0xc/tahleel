import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

import {
  DEFAULT_DAILY_DOSE_TIME_ID,
  type DailyDoseTimeId,
  isDailyDoseTimeId,
} from "~/constants/daily-dose-times";
import {
  DEFAULT_DAILY_VERSE_GOAL,
  type DailyVerseGoal,
  isDailyVerseGoal,
} from "~/constants/goals";
import {
  DEFAULT_RECITATION_MODE,
  type RecitationMode,
  isRecitationMode,
} from "~/constants/recitation";
import {
  DEFAULT_RECITER,
  type ReciterId,
  isReciterId,
} from "~/constants/reciters";
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
  reciterId: ReciterId;
  recitationMode: RecitationMode;
  setScriptId: (scriptId: ArabicScriptId) => void;
  setTranslationLanguageId: (id: TranslationLanguageId) => void;
  setArabicFontSize: (fontSize: number) => void;
  setTranslationFontSize: (fontSize: number) => void;
  setDailyVerseGoal: (goal: DailyVerseGoal) => void;
  setReminderTimeId: (id: ReminderTimeId | null) => void;
  setDailyDoseEnabled: (enabled: boolean) => void;
  setDailyDoseTimeId: (id: DailyDoseTimeId) => void;
  setDailyDoseTranslationId: (id: TranslationLanguageId) => void;
  setReciterId: (id: ReciterId) => void;
  setRecitationMode: (mode: RecitationMode) => void;
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
      reciterId: DEFAULT_RECITER,
      recitationMode: DEFAULT_RECITATION_MODE,
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
      setReciterId(reciterId) {
        set({
          reciterId: isReciterId(reciterId) ? reciterId : DEFAULT_RECITER,
        });
      },
      setRecitationMode(recitationMode) {
        set({
          recitationMode: isRecitationMode(recitationMode)
            ? recitationMode
            : DEFAULT_RECITATION_MODE,
        });
      },
    }),
    {
      name: "preferences-store",
      storage: createJSONStorage(() => zustandStorage),
      version: 1,
    }
  )
);
