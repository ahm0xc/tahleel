import type { ComponentProps, ReactNode } from "react";

import { Pressable } from "react-native";

import { Ionicons } from "@expo/vector-icons";

import { triggerHaptic } from "~/lib/haptics";
import { cn } from "~/lib/utils";

import { Text, View } from "./ui";

type IconName = ComponentProps<typeof Ionicons>["name"];

interface SettingsListProps {
  title: string;
  children: ReactNode;
}

interface SettingsListItemProps {
  label: string;
  icon: IconName;
  onPress: () => void;
  destructive?: boolean;
  showDivider?: boolean;
}

export function SettingsList({ title, children }: SettingsListProps) {
  return (
    <View className="px-safe-offset-4 mt-6">
      <Text className="text-foreground/60 mb-2 px-4 text-xs font-medium tracking-wider uppercase">
        {title}
      </Text>
      <View className="overflow-hidden rounded-3xl border border-[#E5E5E0] bg-[#FAFAF8]">
        {children}
      </View>
    </View>
  );
}

export function SettingsListItem({
  label,
  icon,
  onPress,
  destructive = false,
  showDivider = true,
}: SettingsListItemProps) {
  const color = destructive ? "#D92D20" : "#6B6B66";

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      className={cn(
        "min-h-14 flex-row items-center px-4 active:bg-[#F0F0ED]",
        showDivider && "border-border border-b"
      )}
      onPress={() => {
        triggerHaptic();
        onPress();
      }}
    >
      <View className="mr-3 w-7 items-center">
        <Ionicons color={color} name={icon} size={20} />
      </View>
      <Text
        className={cn(
          "font-sans-medium text-[16px]",
          destructive ? "text-[#D92D20]" : "text-foreground"
        )}
      >
        {label}
      </Text>
    </Pressable>
  );
}
