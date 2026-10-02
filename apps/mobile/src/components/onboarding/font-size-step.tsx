import React from "react";

import { Slider, type SliderValue } from "heroui-native";

import { Button, ButtonLabel, Image, Text, View } from "~/components/ui";
import { getArabicScript } from "~/constants/scripts";
import {
  ARABIC_LINE_HEIGHT_RATIO,
  FONT_SIZE_MAX,
  FONT_SIZE_MIN,
  FONT_SIZE_STEP,
  getLineHeight,
} from "~/constants/typography";
import { getEditionSample } from "~/lib/quran/edition-data";
import { usePreferences } from "~/store/preferences-store";

interface FontSizeStepProps {
  onContinue: () => void;
}

function toSingleValue(value: SliderValue): number {
  return Array.isArray(value) ? value[0] : value;
}

export function FontSizeStep({ onContinue }: FontSizeStepProps) {
  const scriptId = usePreferences((state) => state.scriptId);
  const arabicFontSize = usePreferences((state) => state.arabicFontSize);
  const setArabicFontSize = usePreferences((state) => state.setArabicFontSize);

  const script = getArabicScript(scriptId);

  return (
    <View className="pt-safe-offset-4 flex-1 px-6">
      <View className="w-full flex-row justify-center">
        <Image
          source={{
            light: require("~/../assets/images/logo-long.png"),
            dark: require("~/../assets/images/logo-long-dark.png"),
          }}
          height={34}
        />
      </View>

      <View className="pb-safe-offset-4 mt-8 flex-1 justify-between gap-8">
        <View>
          <Text className="text-4xl font-bold tracking-[-1.5px]">
            Make it easy to read
          </Text>
          <Text className="text-foreground/70 mt-5 text-lg leading-7">
            Drag until the ayah feels comfortable. You can change this anytime.
          </Text>

          <View className="border-border bg-surface mt-7 justify-center rounded-3xl border px-5 py-7">
            <Text
              className="text-foreground text-center"
              style={{
                fontFamily: script.fontFamily,
                fontSize: arabicFontSize,
                lineHeight: getLineHeight(
                  arabicFontSize,
                  ARABIC_LINE_HEIGHT_RATIO
                ),
                writingDirection: script.direction,
              }}
            >
              {getEditionSample(script.editionId)}
            </Text>
          </View>

          <View className="mt-6 px-1">
            <Slider
              accessibilityLabel="Arabic text size"
              maxValue={FONT_SIZE_MAX}
              minValue={FONT_SIZE_MIN}
              step={FONT_SIZE_STEP}
              value={arabicFontSize}
              onChange={(next) => setArabicFontSize(toSingleValue(next))}
              onChangeEnd={(next) => setArabicFontSize(toSingleValue(next))}
            >
              <Slider.Track>
                <Slider.Fill />
                <Slider.Thumb />
              </Slider.Track>
            </Slider>

            <View className="mt-3 flex-row items-center justify-between">
              <Text className="text-muted text-xs">A</Text>
              <Text className="text-muted text-lg">A</Text>
            </View>
          </View>
        </View>

        <View>
          <Button className="h-14 w-full" haptics="Medium" onPress={onContinue}>
            <ButtonLabel className="text-base font-semibold">
              Start reading
            </ButtonLabel>
          </Button>
        </View>
      </View>
    </View>
  );
}
