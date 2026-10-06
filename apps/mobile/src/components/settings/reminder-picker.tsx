import type { ComponentProps } from "react";
import React from "react";

import { Pressable } from "react-native";

import { Ionicons } from "@expo/vector-icons";
import { BottomSheet } from "heroui-native";

import { Text, View } from "~/components/ui";
import {
  REMINDER_TIMES,
  type ReminderTimeId,
  getReminderTime,
} from "~/constants/reminders";
import { triggerHaptic } from "~/lib/haptics";
import { cn } from "~/lib/utils";

import { SettingsListItem } from "./settings-list";

type IconName = ComponentProps<typeof Ionicons>["name"];

interface SettingsReminderPickerProps {
  label: string;
  icon: IconName;
  value: ReminderTimeId | null;
  onChange: (value: ReminderTimeId | null) => void;
  showDivider?: boolean;
}

export function SettingsReminderPicker({
  label,
  icon,
  value,
  onChange,
  showDivider = true,
}: SettingsReminderPickerProps) {
  const [isOpen, setIsOpen] = React.useState(false);
  const selected = value ? getReminderTime(value) : null;

  function handleSelect(next: ReminderTimeId | null) {
    triggerHaptic();
    onChange(next);
    setIsOpen(false);
  }

  return (
    <BottomSheet isOpen={isOpen} onOpenChange={setIsOpen}>
      <SettingsListItem
        icon={icon}
        label={label}
        showDivider={showDivider}
        value={selected?.label ?? "No reminder"}
        onPress={() => setIsOpen(true)}
      />

      <BottomSheet.Portal>
        <BottomSheet.Overlay />

        <BottomSheet.Content
          snapPoints={["60%"]}
          enableOverDrag={false}
          enableDynamicSizing={false}
        >
          <Text className="text-foreground px-safe-offset-4 pb-3 text-lg font-semibold">
            {label}
          </Text>

          <View className="px-safe-offset-4 flex-row flex-wrap gap-3">
            {REMINDER_TIMES.map((time) => (
              <ReminderOptionCard
                key={time.id}
                label={time.label}
                isSelected={value === time.id}
                onPress={() => handleSelect(time.id)}
              />
            ))}

            <NoReminderCard
              isSelected={value === null}
              onPress={() => handleSelect(null)}
            />
          </View>
        </BottomSheet.Content>
      </BottomSheet.Portal>
    </BottomSheet>
  );
}

function ReminderOptionCard({
  label,
  isSelected,
  onPress,
}: {
  label: string;
  isSelected: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable
      accessibilityRole="radio"
      accessibilityState={{ selected: isSelected }}
      accessibilityLabel={label}
      className={cn(
        "min-h-20 w-[47%] shrink-0 grow items-center justify-center rounded-2xl border px-3 py-4 active:opacity-70",
        isSelected ? "border-accent bg-accent-soft" : "border-border bg-surface"
      )}
      onPress={onPress}
    >
      <Text className="text-foreground text-xl font-semibold">{label}</Text>
    </Pressable>
  );
}

function NoReminderCard({
  isSelected,
  onPress,
}: {
  isSelected: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable
      accessibilityRole="radio"
      accessibilityState={{ selected: isSelected }}
      accessibilityLabel="No reminder"
      className={cn(
        "min-h-14 w-full shrink-0 flex-row items-center justify-center gap-2 rounded-2xl border px-3 py-4 active:opacity-70",
        isSelected ? "border-accent bg-accent-soft" : "border-border bg-surface"
      )}
      onPress={onPress}
    >
      <Text className="text-foreground text-lg font-semibold">No reminder</Text>
    </Pressable>
  );
}
