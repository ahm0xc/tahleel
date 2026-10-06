import type { ComponentProps } from "react";
import React from "react";

import { Pressable } from "react-native";

import { Ionicons } from "@expo/vector-icons";
import { BottomSheet } from "heroui-native";

import { Text, View } from "~/components/ui";
import {
  DAILY_DOSE_TIMES,
  type DailyDoseTimeId,
  getDailyDoseTime,
} from "~/constants/daily-dose-times";
import { triggerHaptic } from "~/lib/haptics";
import { cn } from "~/lib/utils";

import { SettingsListItem } from "./settings-list";

type IconName = ComponentProps<typeof Ionicons>["name"];

interface SettingsDailyDoseTimePickerProps {
  label: string;
  icon: IconName;
  value: DailyDoseTimeId;
  onChange: (value: DailyDoseTimeId) => void;
  showDivider?: boolean;
  disabled?: boolean;
}

export function SettingsDailyDoseTimePicker({
  label,
  icon,
  value,
  onChange,
  showDivider = true,
  disabled = false,
}: SettingsDailyDoseTimePickerProps) {
  const [isOpen, setIsOpen] = React.useState(false);
  const selected = getDailyDoseTime(value);

  function handleSelect(next: DailyDoseTimeId) {
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
        value={selected.label}
        disabled={disabled}
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
            {DAILY_DOSE_TIMES.map((time) => (
              <DailyDoseTimeOptionCard
                key={time.id}
                label={time.label}
                isSelected={value === time.id}
                onPress={() => handleSelect(time.id)}
              />
            ))}
          </View>
        </BottomSheet.Content>
      </BottomSheet.Portal>
    </BottomSheet>
  );
}

function DailyDoseTimeOptionCard({
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
