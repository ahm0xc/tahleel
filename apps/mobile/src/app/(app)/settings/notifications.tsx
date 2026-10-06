import React from "react";

import { AppState, Linking, ScrollView } from "react-native";

import { Alert } from "heroui-native";

import {
  SettingsList,
  SettingsReminderPicker,
  SettingsSwitchRow,
} from "~/components/settings";
import { Button, ButtonLabel } from "~/components/ui";
import { type ReminderTimeId, getReminderTime } from "~/constants/reminders";
import {
  cancelDailyReminder,
  getNotificationPermissionStatus,
  requestNotificationPermission,
  scheduleDailyReminder,
} from "~/lib/notification";
import { usePreferences } from "~/store/preferences-store";

export default function NotificationsSettingsScreen() {
  const dailyDoseEnabled = usePreferences((state) => state.dailyDoseEnabled);
  const reminderTimeId = usePreferences((state) => state.reminderTimeId);
  const [permissionStatus, setPermissionStatus] = React.useState<
    "granted" | "denied" | "undetermined" | null
  >(null);
  const setDailyDoseEnabled = usePreferences(
    (state) => state.setDailyDoseEnabled
  );
  const setReminderTimeId = usePreferences((state) => state.setReminderTimeId);

  function handleReminderChange(next: ReminderTimeId | null) {
    setReminderTimeId(next);

    if (next) {
      void scheduleDailyReminder(getReminderTime(next));
    } else {
      void cancelDailyReminder();
    }
  }

  React.useEffect(() => {
    function refresh() {
      void getNotificationPermissionStatus().then(setPermissionStatus);
    }

    refresh();
    const subscription = AppState.addEventListener("change", (state) => {
      if (state === "active") refresh();
    });

    return () => subscription.remove();
  }, []);

  async function handleAllowNotifications() {
    const granted = await requestNotificationPermission();
    setPermissionStatus(granted ? "granted" : "denied");
  }

  return (
    <ScrollView
      className="bg-background flex-1"
      contentContainerClassName="pb-safe-offset-6"
    >
      {permissionStatus !== null && permissionStatus !== "granted" && (
        <Alert status="warning" className="mx-4 mt-4">
          <Alert.Indicator />
          <Alert.Content>
            <Alert.Title>Notifications are off</Alert.Title>
            <Alert.Description>
              You need to allow notifications to receive daily reminders.
            </Alert.Description>
          </Alert.Content>
          {permissionStatus === "undetermined" ? (
            <Button size="sm" onPress={handleAllowNotifications}>
              <ButtonLabel>Allow notifications</ButtonLabel>
            </Button>
          ) : (
            <Button size="sm" onPress={() => Linking.openSettings()}>
              <ButtonLabel>Open Settings</ButtonLabel>
            </Button>
          )}
        </Alert>
      )}

      <SettingsList title="Notifications">
        <SettingsSwitchRow
          icon="book-outline"
          label="Daily dose of Quran"
          value={dailyDoseEnabled}
          onChange={setDailyDoseEnabled}
        />

        <SettingsReminderPicker
          icon="alarm-outline"
          label="Daily reminder"
          showDivider={false}
          value={reminderTimeId}
          onChange={handleReminderChange}
        />
      </SettingsList>
    </ScrollView>
  );
}
