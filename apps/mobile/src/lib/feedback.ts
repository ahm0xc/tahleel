import { Platform } from "react-native";

import Constants from "expo-constants";
import * as Device from "expo-device";

interface FeedbackUser {
  id?: string | null;
  firstName?: string | null;
  lastName?: string | null;
  primaryEmailAddress?: { emailAddress: string } | null;
}

export function createFeedbackUrl(user: FeedbackUser | null | undefined) {
  const entries: [string, string][] = [];

  if (user?.id) entries.push(["userId", user.id]);
  if (user?.firstName || user?.lastName) {
    entries.push([
      "name",
      [user.firstName, user.lastName].filter(Boolean).join(" "),
    ]);
  }
  if (user?.primaryEmailAddress?.emailAddress) {
    entries.push(["email", user.primaryEmailAddress.emailAddress]);
  }
  if (Platform.OS) entries.push(["platform", Platform.OS]);
  if (Device.osVersion) entries.push(["osVersion", Device.osVersion]);
  if (Device.modelName) entries.push(["deviceModel", Device.modelName]);
  if (Constants.expoConfig?.version) {
    entries.push(["appVersion", Constants.expoConfig.version]);
  }

  const query = entries
    .map(
      ([key, value]) =>
        `${encodeURIComponent(key)}=${encodeURIComponent(value)}`
    )
    .join("&");

  return `${process.env.EXPO_PUBLIC_APP_URL}/feedback?${query}`;
}
