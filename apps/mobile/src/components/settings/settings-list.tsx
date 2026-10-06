import type { ComponentProps, ReactNode } from "react";
import React from "react";

import { Pressable } from "react-native";

import { Ionicons } from "@expo/vector-icons";
import { BottomSheet, Switch } from "heroui-native";
import { useCSSVariable } from "uniwind";

import { triggerHaptic } from "~/lib/haptics";
import { cn } from "~/lib/utils";

import { Text, View } from "../ui";

type IconName = ComponentProps<typeof Ionicons>["name"];

interface SettingsListProps {
  title: string;
  children: ReactNode;
}

interface SettingsListItemProps {
  label: string;
  icon: IconName;
  onPress: () => void;
  value?: string;
  destructive?: boolean;
  showDivider?: boolean;
  /** Trailing affordance for rows that open another page. */
  chevron?: boolean;
}

interface SettingsSwitchRowProps {
  label: string;
  icon: IconName;
  value: boolean;
  onChange: (value: boolean) => void;
  showDivider?: boolean;
}

export interface SettingsPickerOption<Value extends string = string> {
  value: Value;
  label: string;
  description?: string;
}

interface SettingsPickerProps<Value extends string> {
  label: string;
  icon: IconName;
  options: SettingsPickerOption<Value>[];
  value: Value;
  onChange: (value: Value) => void;
  showDivider?: boolean;
}

export function SettingsList({ title, children }: SettingsListProps) {
  return (
    <View className="px-safe-offset-4 mt-6">
      <Text className="text-foreground/60 mb-2 px-4 text-xs font-medium tracking-wider uppercase">
        {title}
      </Text>
      <SettingsCard>{children}</SettingsCard>
    </View>
  );
}

export function SettingsCard({ children }: { children: ReactNode }) {
  return (
    <View className="border-border bg-surface overflow-hidden rounded-3xl border">
      {children}
    </View>
  );
}

export function SettingsListItem({
  label,
  icon,
  onPress,
  value,
  destructive = false,
  showDivider = true,
  chevron = false,
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
          "text-[16px] font-medium",
          destructive ? "text-danger" : "text-foreground",
          (value ?? chevron) && "flex-1"
        )}
      >
        {label}
      </Text>
      {value ? (
        <Text className="text-muted text-[16px]" numberOfLines={1}>
          {value}
        </Text>
      ) : null}
      {chevron ? (
        <Ionicons
          className="ml-1"
          color={color}
          name="chevron-forward"
          size={18}
        />
      ) : null}
    </Pressable>
  );
}

export function SettingsSwitchRow({
  label,
  icon,
  value,
  onChange,
  showDivider = true,
}: SettingsSwitchRowProps) {
  const mutedColor = useCSSVariable("--muted") as string;

  return (
    <View
      className={cn(
        "min-h-14 flex-row items-center px-4",
        showDivider && "border-border border-b"
      )}
    >
      <View className="mr-3 w-7 items-center">
        <Ionicons color={mutedColor} name={icon} size={20} />
      </View>
      <Text className="text-foreground flex-1 text-[16px] font-medium">
        {label}
      </Text>
      <Switch
        isSelected={value}
        onSelectedChange={(next) => {
          triggerHaptic();
          onChange(next);
        }}
      />
    </View>
  );
}

export function SettingsRadioRow({
  description,
  isSelected,
  onPress,
  preview,
  showDivider = true,
  label,
}: {
  label: string;
  description?: string;
  isSelected: boolean;
  onPress: () => void;
  preview?: ReactNode;
  showDivider?: boolean;
}) {
  const accentColor = useCSSVariable("--accent") as string;
  const mutedColor = useCSSVariable("--muted") as string;

  return (
    <Pressable
      accessibilityRole="radio"
      accessibilityState={{ selected: isSelected }}
      accessibilityLabel={label}
      className={cn(
        "active:bg-surface-hover min-h-16 flex-row items-center gap-3 px-4 py-3",
        showDivider && "border-border border-b"
      )}
      onPress={() => {
        triggerHaptic();
        onPress();
      }}
    >
      <View className="flex-1">
        <Text className="text-foreground text-[16px] font-medium">{label}</Text>

        {description ? (
          <Text className="text-muted mt-0.5 text-sm">{description}</Text>
        ) : null}
      </View>

      {preview}

      {isSelected ? (
        <Ionicons color={accentColor} name="checkmark" size={20} />
      ) : (
        <Ionicons color={mutedColor} name="ellipse-outline" size={20} />
      )}
    </Pressable>
  );
}

export function SettingsPicker<Value extends string>({
  label,
  icon,
  options,
  value,
  onChange,
  showDivider = true,
}: SettingsPickerProps<Value>) {
  const [isOpen, setIsOpen] = React.useState(false);
  const selected = options.find((option) => option.value === value);

  function handleSelect(nextValue: Value) {
    triggerHaptic();
    onChange(nextValue);
    setIsOpen(false);
  }

  return (
    <BottomSheet isOpen={isOpen} onOpenChange={setIsOpen}>
      <SettingsListItem
        icon={icon}
        label={label}
        showDivider={showDivider}
        value={selected?.label}
        onPress={() => setIsOpen(true)}
      />

      <BottomSheet.Portal>
        <BottomSheet.Overlay />

        <BottomSheet.Content
          snapPoints={["40%"]}
          enableOverDrag={false}
          enableDynamicSizing={false}
        >
          <Text className="text-foreground px-safe-offset-4 pb-2 text-lg font-semibold">
            {label}
          </Text>

          {options.map((option) => (
            <SettingsPickerRow
              key={option.value}
              option={option}
              isSelected={option.value === value}
              onPress={() => handleSelect(option.value)}
            />
          ))}
        </BottomSheet.Content>
      </BottomSheet.Portal>
    </BottomSheet>
  );
}

function SettingsPickerRow<Value extends string>({
  option,
  isSelected,
  onPress,
}: {
  option: SettingsPickerOption<Value>;
  isSelected: boolean;
  onPress: () => void;
}) {
  const accentColor = useCSSVariable("--accent") as string;

  return (
    <Pressable
      accessibilityRole="radio"
      accessibilityState={{ selected: isSelected }}
      accessibilityLabel={option.label}
      className="active:bg-default px-safe-offset-4 min-h-14 flex-row items-center"
      onPress={onPress}
    >
      <View className="flex-1">
        <Text className="text-foreground text-[16px]">{option.label}</Text>

        {option.description ? (
          <Text className="text-muted mt-0.5 text-sm">
            {option.description}
          </Text>
        ) : null}
      </View>

      {isSelected ? (
        <Ionicons color={accentColor} name="checkmark" size={20} />
      ) : null}
    </Pressable>
  );
}
