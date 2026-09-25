import { Ionicons } from "@expo/vector-icons";

import { Button, ButtonLabel, Image, Text, View } from "~/components/ui";

interface ConvenienceStepProps {
  onContinue: () => void;
}

const BENEFITS = [
  [
    "swap-horizontal-outline",
    "Swipe to decide",
    "Make a keep-or-delete choice instantly.",
  ],
  [
    "heart-outline",
    "Keep the good stuff",
    "Hold on to the photos and videos worth saving.",
  ],
  [
    "trash-outline",
    "Clear space faster",
    "Remove the clutter without second-guessing.",
  ],
] as const;

export function ConvenienceStep({ onContinue }: ConvenienceStepProps) {
  return (
    <View className="pt-safe-offset-4 flex-1 px-6">
      <View className="items-start">
        <Image
          source={require("~/../assets/images/app-logo-long.png")}
          style={{ height: 24, width: (434 / 100) * 24 }}
        />
      </View>

      <View className="pb-safe-offset-4 mt-8 flex-1 justify-between gap-8">
        <View>
          <Text className="text-4xl font-bold tracking-[-1.5px]">
            Your camera roll, under control.
          </Text>
          <Text className="text-foreground/70 mt-5 text-lg leading-7">
            Stop scrolling through thousands of photos. Swipe to keep the ones
            you love and clear out the rest — fast.
          </Text>

          <View className="mt-7 gap-4">
            {BENEFITS.map(([icon, title, description]) => (
              <View key={title} className="flex-row items-center gap-3">
                <View className="bg-foreground/5 h-10 w-10 items-center justify-center rounded-2xl">
                  <Ionicons name={icon} size={19} color="#555555" />
                </View>
                <View className="flex-1">
                  <Text className="text-sm font-semibold">{title}</Text>
                  <Text className="text-muted mt-0.5 text-xs">
                    {description}
                  </Text>
                </View>
              </View>
            ))}
          </View>
        </View>

        <View>
          <Button className="h-14 w-full" haptics="Medium" onPress={onContinue}>
            <ButtonLabel className="text-base font-semibold">
              Start sorting
            </ButtonLabel>
          </Button>
        </View>
      </View>
    </View>
  );
}
