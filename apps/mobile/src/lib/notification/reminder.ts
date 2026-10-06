import * as Notifications from "expo-notifications";
import { SchedulableTriggerInputTypes } from "expo-notifications";

import { type ReminderTime } from "~/constants/reminders";

import { scheduleNotification } from "./notification";

const REMINDER_NOTIFICATION_KIND = "daily-reminder";

let reminderQueue: Promise<void> = Promise.resolve();

function enqueue(task: () => Promise<void>): Promise<void> {
  const run = reminderQueue.then(task, task);
  reminderQueue = run.catch(() => undefined);
  return reminderQueue;
}

async function cancelScheduledReminders() {
  const scheduled = await Notifications.getAllScheduledNotificationsAsync();

  const reminders = scheduled.filter(
    (notification) =>
      notification.content.data?.kind === REMINDER_NOTIFICATION_KIND
  );

  await Promise.all(
    reminders.map((notification) =>
      Notifications.cancelScheduledNotificationAsync(notification.identifier)
    )
  );
}

export function scheduleDailyReminder(time: ReminderTime): Promise<void> {
  return enqueue(async () => {
    await cancelScheduledReminders();

    await scheduleNotification({
      title: "Time to read your Quran",
      body: "A few verses a day goes a long way. Keep your streak going.",
      trigger: {
        type: SchedulableTriggerInputTypes.DAILY,
        hour: time.hour,
        minute: time.minute,
      },
      data: { kind: REMINDER_NOTIFICATION_KIND, deepLink: "/reading" },
    });
  });
}

export function cancelDailyReminder(): Promise<void> {
  return enqueue(cancelScheduledReminders);
}
