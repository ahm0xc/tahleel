import { SchedulableTriggerInputTypes } from "expo-notifications";

import { localStorage } from "../storage";
import { scheduleNotification } from "./notification";

export async function scheduleInitialNotifications() {
  const hasScheduledNotification = localStorage.getBoolean(
    "scheduled-initial-notification"
  );
  if (hasScheduledNotification) return;

  await scheduleNotification({
    title: "What's really in your food?",
    body: "One scan reveals hidden sugars, additives, and allergens most labels don't explain.",
    trigger: {
      type: SchedulableTriggerInputTypes.TIME_INTERVAL,
      seconds: 60 * 60,
      repeats: false,
    },
  });

  await scheduleNotification({
    title: "Zero sugar doesn't mean healthy",
    body: "Marketing claims hide more than they reveal. Our health score shows the full picture.",
    trigger: {
      type: SchedulableTriggerInputTypes.TIME_INTERVAL,
      seconds: 60 * 60 * 24,
      repeats: false,
    },
  });

  await scheduleNotification({
    title: "Ingredients shouldn't be confusing",
    body: "Get clear ingredient breakdowns, allergen flags, and diet fit in seconds.",
    trigger: {
      type: SchedulableTriggerInputTypes.TIME_INTERVAL,
      seconds: 60 * 60 * 24 * 3,
      repeats: false,
    },
  });

  await scheduleNotification({
    title: "Eat with clarity",
    body: "Unlock full scans anytime and know exactly what you're putting in your body.",
    trigger: {
      type: SchedulableTriggerInputTypes.TIME_INTERVAL,
      seconds: 60 * 60 * 24 * 7,
      repeats: false,
    },
  });

  localStorage.set("scheduled-initial-notification", true);
}
