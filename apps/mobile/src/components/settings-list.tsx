import type { ComponentProps, ReactNode } from "react";

import { Pressable } from "react-native";

import { Ionicons } from "@expo/vector-icons";
import { useCSSVariable } from "uniwind";

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
      <View className="border-border bg-surface overflow-hidden rounded-3xl border">
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
  const mutedColor = useCSSVariable("--muted") as string;
  const dangerColor = useCSSVariable("--danger") as string;
  const color = destructive ? dangerColor : mutedColor;

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      className={cn(
        "active:bg-surface-hover min-h-14 flex-row items-center px-4",
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
          destructive ? "text-danger" : "text-foreground"
        )}
      >
        {label}
      </Text>
    </Pressable>
  );
}
