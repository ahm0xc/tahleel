import { Pressable } from "react-native";

import { Text, View } from "~/components/ui";
import { triggerHaptic } from "~/lib/haptics";
import { cn } from "~/lib/utils";

export interface SettingsOptionGridOption<Value extends string | number> {
  value: Value;
  label: string;
  description?: string;
}

interface SettingsOptionGridProps<Value extends string | number> {
  title: string;
  options: SettingsOptionGridOption<Value>[];
  value: Value;
  onChange: (value: Value) => void;
}

export function SettingsOptionGrid<Value extends string | number>({
  title,
  options,
  value,
  onChange,
}: SettingsOptionGridProps<Value>) {
  return (
    <View className="px-safe-offset-4 mt-6">
      <Text className="text-foreground/60 mb-2 text-xs font-medium tracking-wider uppercase">
        {title}
      </Text>

      <View className="flex-row flex-wrap gap-3">
        {options.map((option) => (
          <SettingsOptionCard
            key={option.value}
            description={option.description}
            isSelected={option.value === value}
            label={option.label}
            onPress={() => {
              triggerHaptic();
              onChange(option.value);
            }}
          />
        ))}
      </View>
    </View>
  );
}

function SettingsOptionCard({
  description,
  isSelected,
  label,
  onPress,
}: {
  description?: string;
  isSelected: boolean;
  label: string;
  onPress: () => void;
}) {
  return (
    <Pressable
      accessibilityRole="radio"
      accessibilityState={{ selected: isSelected }}
      accessibilityLabel={label}
      className={cn(
        "min-h-24 w-[47%] shrink-0 grow items-center justify-center rounded-2xl border px-3 py-4 active:opacity-70",
        isSelected ? "border-accent bg-accent-soft" : "border-border bg-surface"
      )}
      onPress={onPress}
    >
      <Text className="text-foreground text-2xl font-semibold">{label}</Text>

      {description ? (
        <Text className="text-muted mt-0.5 text-center text-sm">
          {description}
        </Text>
      ) : null}
    </Pressable>
  );
}
