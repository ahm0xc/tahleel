import * as Notifications from "expo-notifications";
import { SchedulableTriggerInputTypes } from "expo-notifications";

import { DAILY_DOSE_VERSES } from "~/constants/daily-dose";
import { type DailyDoseTime } from "~/constants/daily-dose-times";
import {
  getTranslationLanguage,
  type TranslationLanguageId,
} from "~/constants/translations";

import { getEditionVerse } from "../quran/edition-data";
import { scheduleNotification } from "./notification";

const DAILY_DOSE_NOTIFICATION_KIND = "daily-dose";
const DAILY_DOSE_SCHEDULE_DAYS = 30;
const DAILY_DOSE_REFILL_THRESHOLD = 7;

let dailyDoseQueue: Promise<void> = Promise.resolve();

function enqueue(task: () => Promise<void>): Promise<void> {
  const run = dailyDoseQueue.then(task, task);
  dailyDoseQueue = run.catch(() => undefined);
  return dailyDoseQueue;
}

async function cancelScheduledDailyDose() {
  const scheduled = await Notifications.getAllScheduledNotificationsAsync();

  const dailyDoses = scheduled.filter(
    (notification) =>
      notification.content.data?.kind === DAILY_DOSE_NOTIFICATION_KIND
  );

  await Promise.all(
    dailyDoses.map((notification) =>
      Notifications.cancelScheduledNotificationAsync(notification.identifier)
    )
  );
}

function pickVerseIndex(exclude?: number): number {
  let index = Math.floor(Math.random() * DAILY_DOSE_VERSES.length);

  if (exclude !== undefined && DAILY_DOSE_VERSES.length > 1) {
    while (index === exclude) {
      index = Math.floor(Math.random() * DAILY_DOSE_VERSES.length);
    }
  }

  return index;
}

export function scheduleDailyDose({
  time,
  translationLanguageId,
}: {
  time: DailyDoseTime;
  translationLanguageId: TranslationLanguageId;
}): Promise<void> {
  return enqueue(async () => {
    await cancelScheduledDailyDose();

    const editionId = getTranslationLanguage(translationLanguageId).editionId;
    let previousVerseIndex: number | undefined;

    for (let dayOffset = 0; dayOffset < DAILY_DOSE_SCHEDULE_DAYS; dayOffset += 1) {
      const date = new Date();
      date.setDate(date.getDate() + dayOffset);
      date.setHours(time.hour, time.minute, 0, 0);

      if (date.getTime() <= Date.now()) {
        continue;
      }

      const verseIndex = pickVerseIndex(previousVerseIndex);
      previousVerseIndex = verseIndex;

      const verse = DAILY_DOSE_VERSES[verseIndex];
      const text = getEditionVerse(
        editionId,
        verse.chapterNumber,
        verse.verseNumber
      )?.text;

      if (!text) {
        continue;
      }

      await scheduleNotification({
        title: "Daily dose of Quran",
        body: text,
        trigger: {
          type: SchedulableTriggerInputTypes.DATE,
          date,
        },
        data: {
          kind: DAILY_DOSE_NOTIFICATION_KIND,
          deepLink: `/daily-dose?chapter=${verse.chapterNumber}&verse=${verse.verseNumber}`,
          chapterNumber: verse.chapterNumber,
          verseNumber: verse.verseNumber,
        },
      });
    }
  });
}

export async function sendTestDailyDose({
  translationLanguageId,
}: {
  translationLanguageId: TranslationLanguageId;
}): Promise<void> {
  const scheduled = await Notifications.getAllScheduledNotificationsAsync();
  const now = Date.now();

  const upcoming = scheduled
    .filter(
      (notification) =>
        notification.content.data?.kind === DAILY_DOSE_NOTIFICATION_KIND
    )
    .map((notification) => notification)
    .filter((notification) => {
      const trigger = notification.trigger as { date?: number | string };
      const time = trigger?.date ? new Date(trigger.date).getTime() : NaN;

      return !Number.isNaN(time) && time >= now;
    })
    .sort((a, b) => {
      const aTime = new Date(
        (a.trigger as { date?: number | string }).date ?? 0
      ).getTime();
      const bTime = new Date(
        (b.trigger as { date?: number | string }).date ?? 0
      ).getTime();

      return aTime - bTime;
    });

  const nextToday = upcoming[0];

  if (nextToday) {
    await scheduleNotification({
      title: nextToday.content.title ?? "Daily dose of Quran",
      body: nextToday.content.body ?? "",
      trigger: {
        type: SchedulableTriggerInputTypes.TIME_INTERVAL,
        seconds: 1,
        repeats: false,
      },
      data: { ...nextToday.content.data, kind: "daily-dose-test" },
    });

    return;
  }

  await enqueue(async () => {
    const editionId = getTranslationLanguage(translationLanguageId).editionId;
    const verse =
      DAILY_DOSE_VERSES[Math.floor(Math.random() * DAILY_DOSE_VERSES.length)];
    const text = getEditionVerse(
      editionId,
      verse.chapterNumber,
      verse.verseNumber
    )?.text;

    if (!text) {
      return;
    }

    await scheduleNotification({
      title: "Daily dose of Quran",
      body: text,
      trigger: {
        type: SchedulableTriggerInputTypes.TIME_INTERVAL,
        seconds: 1,
        repeats: false,
      },
      data: {
        kind: "daily-dose-test",
        deepLink: `/daily-dose?chapter=${verse.chapterNumber}&verse=${verse.verseNumber}`,
        chapterNumber: verse.chapterNumber,
        verseNumber: verse.verseNumber,
      },
    });
  });
}

export function cancelDailyDose(): Promise<void> {
  return enqueue(cancelScheduledDailyDose);
}

export async function refreshDailyDoseIfNeeded({
  enabled,
  time,
  translationLanguageId,
}: {
  enabled: boolean;
  time: DailyDoseTime;
  translationLanguageId: TranslationLanguageId;
}): Promise<void> {
  if (!enabled) {
    return;
  }

  const scheduled = await Notifications.getAllScheduledNotificationsAsync();
  const remaining = scheduled.filter(
    (notification) =>
      notification.content.data?.kind === DAILY_DOSE_NOTIFICATION_KIND
  );

  if (remaining.length < DAILY_DOSE_REFILL_THRESHOLD) {
    await scheduleDailyDose({ time, translationLanguageId });
  }
}
