import { Platform } from "react-native";

import { ExtensionStorage } from "@bacons/apple-targets";

const APP_GROUP = "group.io.somossa.tahleel";
const WIDGET_KIND = "StreaksWidget";
const CURRENT_STREAK_KEY = "currentStreak";
const LAST_COMPLETED_DAY_KEY = "lastCompletedDay";

const storage = Platform.OS === "ios" ? new ExtensionStorage(APP_GROUP) : null;

export function updateStreaksWidget(
  currentStreak: number,
  lastCompletedDay: string | null
) {
  if (!storage) return;

  storage.set(CURRENT_STREAK_KEY, currentStreak);
  if (lastCompletedDay) {
    storage.set(LAST_COMPLETED_DAY_KEY, lastCompletedDay);
  } else {
    storage.remove(LAST_COMPLETED_DAY_KEY);
  }
  ExtensionStorage.reloadWidget(WIDGET_KIND);
}

export function clearStreaksWidget() {
  if (!storage) return;

  storage.remove(CURRENT_STREAK_KEY);
  storage.remove(LAST_COMPLETED_DAY_KEY);
  ExtensionStorage.reloadWidget(WIDGET_KIND);
}
