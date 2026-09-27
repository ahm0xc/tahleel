import React from "react";

import { Pressable } from "react-native";

import { Slider, type SliderValue } from "heroui-native";

import { Text, View } from "~/components/ui";
import {
  FONT_SIZE_MAX,
  FONT_SIZE_MIN,
  FONT_SIZE_STEP,
} from "~/constants/typography";

import { SettingsCard } from "./settings-list";

interface FontSizeSliderProps {
  title: string;
  value: number;
  defaultValue: number;
  onChange: (fontSize: number) => void;
  onCommit: (fontSize: number) => void;
}

function toSingleValue(value: SliderValue): number {
  return Array.isArray(value) ? value[0] : value;
}

export function FontSizeSlider({
  title,
  value,
  defaultValue,
  onChange,
  onCommit,
}: FontSizeSliderProps) {
  const [isDefault, setIsDefault] = React.useState(value === defaultValue);

  function commit(next: number) {
    setIsDefault(next === defaultValue);
    onCommit(next);
  }

  return (
    <View className="px-safe-offset-4 mt-6">
      <Text className="text-foreground/60 mb-2 px-4 text-xs font-medium tracking-wider uppercase">
        {title}
      </Text>

      <SettingsCard>
        <View className="px-4 py-4">
          <View className="mb-3 flex-row items-center justify-between">
            <Text className="text-foreground text-[16px] font-medium">
              Text size
            </Text>
            <Text className="text-muted text-[16px]">{value}</Text>
          </View>

          <Slider
            accessibilityLabel={`${title} text size`}
            maxValue={FONT_SIZE_MAX}
            minValue={FONT_SIZE_MIN}
            step={FONT_SIZE_STEP}
            value={value}
            onChange={(next) => onChange(toSingleValue(next))}
            onChangeEnd={(next) => commit(toSingleValue(next))}
          >
            <Slider.Track>
              <Slider.Fill />
              <Slider.Thumb />
            </Slider.Track>
          </Slider>

          <View className="mt-3 flex-row items-center justify-between">
            <Text className="text-muted text-xs">A</Text>

            {isDefault ? (
              <View />
            ) : (
              <Pressable
                accessibilityRole="button"
                accessibilityLabel="Reset to default size"
                className="px-2 py-1 active:opacity-60"
                hitSlop={8}
                onPress={() => {
                  onChange(defaultValue);
                  commit(defaultValue);
                }}
              >
                <Text className="text-link text-sm">Reset</Text>
              </Pressable>
            )}

            <Text className="text-muted text-lg">A</Text>
          </View>
        </View>
      </SettingsCard>
    </View>
  );
}
