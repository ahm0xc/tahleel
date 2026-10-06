import React from "react";

import { AppState, Linking, ScrollView } from "react-native";

import { Alert } from "heroui-native";

import {
  SettingsDailyDoseTimePicker,
  SettingsList,
  SettingsListItem,
  SettingsPicker,
  SettingsReminderPicker,
  SettingsSwitchRow,
} from "~/components/settings";
import { Button, ButtonLabel } from "~/components/ui";
import {
  type DailyDoseTimeId,
  getDailyDoseTime,
} from "~/constants/daily-dose-times";
import { type ReminderTimeId, getReminderTime } from "~/constants/reminders";
import {
  TRANSLATION_LANGUAGES,
  type TranslationLanguageId,
} from "~/constants/translations";
import {
  cancelDailyDose,
  cancelDailyReminder,
  getNotificationPermissionStatus,
  requestNotificationPermission,
  scheduleDailyDose,
  scheduleDailyReminder,
  sendTestDailyDose,
} from "~/lib/notification";
import { isDev } from "~/lib/utils";
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
  const dailyDoseTimeId = usePreferences((state) => state.dailyDoseTimeId);
  const dailyDoseTranslationId = usePreferences(
    (state) => state.dailyDoseTranslationId
  );
  const setDailyDoseTimeId = usePreferences(
    (state) => state.setDailyDoseTimeId
  );
  const setDailyDoseTranslationId = usePreferences(
    (state) => state.setDailyDoseTranslationId
  );

  function handleDailyDoseToggle(enabled: boolean) {
    setDailyDoseEnabled(enabled);

    if (enabled) {
      void scheduleDailyDose({
        time: getDailyDoseTime(dailyDoseTimeId),
        translationLanguageId: dailyDoseTranslationId,
      });
    } else {
      void cancelDailyDose();
    }
  }

  function handleDailyDoseTimeChange(next: DailyDoseTimeId) {
    setDailyDoseTimeId(next);

    if (dailyDoseEnabled) {
      void scheduleDailyDose({
        time: getDailyDoseTime(next),
        translationLanguageId: dailyDoseTranslationId,
      });
    }
  }

  function handleDailyDoseTranslationChange(next: TranslationLanguageId) {
    setDailyDoseTranslationId(next);

    if (dailyDoseEnabled) {
      void scheduleDailyDose({
        time: getDailyDoseTime(dailyDoseTimeId),
        translationLanguageId: next,
      });
    }
  }

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

    if (granted && !dailyDoseEnabled) {
      setDailyDoseEnabled(true);
      void scheduleDailyDose({
        time: getDailyDoseTime(dailyDoseTimeId),
        translationLanguageId: dailyDoseTranslationId,
      });
    }
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
          onChange={handleDailyDoseToggle}
        />

        <SettingsDailyDoseTimePicker
          icon="time-outline"
          label="Daily dose time"
          value={dailyDoseTimeId}
          onChange={handleDailyDoseTimeChange}
          disabled={!dailyDoseEnabled}
        />

        <SettingsPicker
          icon="language-outline"
          label="Daily dose translation"
          options={TRANSLATION_LANGUAGES.map((option) => ({
            value: option.id,
            label:
              option.nativeName === option.name
                ? option.name
                : `${option.name} (${option.nativeName})`,
            description: option.author,
          }))}
          value={dailyDoseTranslationId}
          onChange={handleDailyDoseTranslationChange}
          disabled={!dailyDoseEnabled}
        />

        <SettingsReminderPicker
          icon="alarm-outline"
          label="Daily reminder"
          showDivider={isDev}
          value={reminderTimeId}
          onChange={handleReminderChange}
        />

        {isDev ? (
          <SettingsListItem
            icon="paper-plane-outline"
            label="Send today's daily dose now"
            showDivider={false}
            disabled={!dailyDoseEnabled}
            onPress={() =>
              void sendTestDailyDose({
                translationLanguageId: dailyDoseTranslationId,
              })
            }
          />
        ) : null}
      </SettingsList>
    </ScrollView>
  );
}
