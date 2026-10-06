import React from "react";

import { Pressable } from "react-native";

import { Button, ButtonLabel, Image, Text, View } from "~/components/ui";
import {
  REMINDER_TIMES,
  type ReminderTimeId,
  getReminderTime,
} from "~/constants/reminders";
import { triggerHaptic } from "~/lib/haptics";
import {
  requestNotificationPermission,
  scheduleDailyReminder,
} from "~/lib/notification";
import { cn } from "~/lib/utils";
import { usePreferences } from "~/store/preferences-store";

interface ReminderStepProps {
  onContinue: () => void;
  onSkip: () => void;
}

export function ReminderStep({ onContinue, onSkip }: ReminderStepProps) {
  const [selected, setSelected] = React.useState<ReminderTimeId | null>(null);
  const setReminderTimeId = usePreferences((state) => state.setReminderTimeId);

  async function handleContinue() {
    if (!selected) return;

    const granted = await requestNotificationPermission();

    if (!granted) {
      onSkip();
      return;
    }

    setReminderTimeId(selected);
    void scheduleDailyReminder(getReminderTime(selected));
    onContinue();
  }

  return (
    <View className="pt-safe-offset-4 flex-1 px-6">
      <View className="w-full flex-row items-center justify-center">
        <Image
          source={{
            light: require("~/../assets/images/logo-long.png"),
            dark: require("~/../assets/images/logo-long-dark.png"),
          }}
          height={34}
        />

        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Skip daily reminder"
          className="absolute right-0 py-2 active:opacity-60"
          hitSlop={12}
          onPress={() => {
            triggerHaptic();
            onSkip();
          }}
        >
          <Text className="text-muted text-base font-medium">Skip</Text>
        </Pressable>
      </View>

      <View className="pb-safe-offset-4 mt-8 flex-1 justify-between gap-8">
        <View>
          <Text className="text-4xl font-bold tracking-[-1.5px]">
            Want a daily reminder?
          </Text>
          <Text className="text-foreground/70 mt-5 text-lg leading-7">
            Pick a time and we&apos;ll nudge you to read your verses every day.
          </Text>

          <View className="mt-8 flex-row flex-wrap gap-3">
            {REMINDER_TIMES.map((time) => {
              const isSelected = time.id === selected;

              return (
                <Pressable
                  key={time.id}
                  accessibilityRole="radio"
                  accessibilityState={{ selected: isSelected }}
                  accessibilityLabel={time.label}
                  className={cn(
                    "min-h-24 w-[47%] shrink-0 grow items-center justify-center rounded-2xl border px-3 py-4 active:opacity-70",
                    isSelected
                      ? "border-accent bg-accent-soft"
                      : "border-border bg-surface"
                  )}
                  onPress={() => {
                    triggerHaptic();
                    setSelected(time.id);
                  }}
                >
                  <Text className="text-foreground text-2xl font-semibold">
                    {time.label}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        </View>

        <View>
          <Button
            className="h-14 w-full"
            haptics="Medium"
            isDisabled={selected === null}
            onPress={handleContinue}
          >
            <ButtonLabel className="text-base font-semibold">
              Continue
            </ButtonLabel>
          </Button>
        </View>
      </View>
    </View>
  );
}
