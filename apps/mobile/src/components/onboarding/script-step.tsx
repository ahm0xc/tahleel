import React from "react";

import { Pressable } from "react-native";

import { Button, ButtonLabel, Image, Text, View } from "~/components/ui";
import { ARABIC_SCRIPTS, getArabicScript } from "~/constants/scripts";
import { ARABIC_LINE_HEIGHT_RATIO } from "~/constants/typography";
import { triggerHaptic } from "~/lib/haptics";
import {
  getEditionSample,
  getEditionSampleWord,
} from "~/lib/quran/edition-data";
import { cn } from "~/lib/utils";
import { usePreferences } from "~/store/preferences-store";

interface ScriptStepProps {
  onContinue: () => void;
}

const PREVIEW_FONT_SIZE = 32;

export function ScriptStep({ onContinue }: ScriptStepProps) {
  const scriptId = usePreferences((state) => state.scriptId);
  const setScriptId = usePreferences((state) => state.setScriptId);

  const previewScript = getArabicScript(scriptId);

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
            Choose your script
          </Text>
          <Text className="text-foreground/70 mt-5 text-lg leading-7">
            Both are the Quran in full. Pick the one you&apos;re used to reading.
          </Text>

          <View className="border-border bg-surface mt-7 rounded-3xl border px-5 py-7">
            <Text
              className="text-foreground text-center"
              style={{
                fontFamily: previewScript.fontFamily,
                fontSize: PREVIEW_FONT_SIZE,
                lineHeight: PREVIEW_FONT_SIZE * ARABIC_LINE_HEIGHT_RATIO,
                writingDirection: previewScript.direction,
              }}
            >
              {getEditionSample(previewScript.editionId)}
            </Text>
            <Text className="text-muted mt-4 text-center text-sm">
              {previewScript.arabicName}
            </Text>
          </View>

          <View className="mt-4 flex-row flex-wrap gap-3">
            {ARABIC_SCRIPTS.map((script) => {
              const isSelected = script.id === scriptId;

              return (
                <Pressable
                  key={script.id}
                  accessibilityRole="radio"
                  accessibilityState={{ selected: isSelected }}
                  accessibilityLabel={script.name}
                  className={cn(
                    "min-h-24 w-[47%] shrink-0 grow items-center justify-center rounded-2xl border px-3 py-4 active:opacity-70",
                    isSelected
                      ? "border-accent bg-accent-soft"
                      : "border-border bg-surface"
                  )}
                  onPress={() => {
                    triggerHaptic();
                    setScriptId(script.id);
                  }}
                >
                  <Text className="text-foreground text-lg font-semibold">
                    {script.name}
                  </Text>
                  <Text
                    className="text-foreground mt-2 text-center text-2xl"
                    style={{
                      fontFamily: script.fontFamily,
                      lineHeight: 32,
                      writingDirection: script.direction,
                    }}
                  >
                    {getEditionSampleWord(script.editionId)}
                  </Text>
                </Pressable>
              );
            })}
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