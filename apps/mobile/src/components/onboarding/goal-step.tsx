import React from "react";

import { Pressable } from "react-native";

import { Button, ButtonLabel, Image, Text, View } from "~/components/ui";
import { DAILY_VERSE_GOALS } from "~/constants/goals";
import { triggerHaptic } from "~/lib/haptics";
import { cn } from "~/lib/utils";
import { usePreferences } from "~/store/preferences-store";

interface GoalStepProps {
  onContinue: () => void;
}

export function GoalStep({ onContinue }: GoalStepProps) {
  const dailyVerseGoal = usePreferences((state) => state.dailyVerseGoal);
  const setDailyVerseGoal = usePreferences((state) => state.setDailyVerseGoal);

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
            How much can you read daily?
          </Text>
          <Text className="text-foreground/70 mt-5 text-lg leading-7">
            Start small. Consistency matters more than the count.
          </Text>

          <View className="mt-8 flex-row flex-wrap gap-3">
            {DAILY_VERSE_GOALS.map((goal) => {
              const isSelected = goal === dailyVerseGoal;

              return (
                <Pressable
                  key={goal}
                  accessibilityRole="radio"
                  accessibilityState={{ selected: isSelected }}
                  accessibilityLabel={`${goal} verses per day`}
                  className={cn(
                    "min-h-24 w-[47%] shrink-0 grow items-center justify-center rounded-2xl border px-3 py-4 active:opacity-70",
                    isSelected
                      ? "border-accent bg-accent-soft"
                      : "border-border bg-surface"
                  )}
                  onPress={() => {
                    triggerHaptic();
                    setDailyVerseGoal(goal);
                  }}
                >
                  <Text className="text-foreground text-2xl font-semibold">
                    {goal}
                  </Text>
                  <Text className="text-muted mt-0.5 text-center text-sm">
                    {goal === 1 ? "verse" : "verses"}
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
