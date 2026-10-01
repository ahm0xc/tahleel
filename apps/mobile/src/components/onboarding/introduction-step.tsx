import { Button, ButtonLabel, Image, Text, View } from "~/components/ui";

interface IntroductionStepProps {
  onContinue: () => void;
}

export function IntroductionStep({ onContinue }: IntroductionStepProps) {
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

      <View className="pb-safe-offset-4 mt-8 flex-1 justify-between">
        <View className="flex-1">
          <View className="w-full flex-1 items-center justify-center overflow-hidden rounded-4xl bg-zinc-200">
            <Image
              source={require("~/../assets/images/onboarding/intro.png")}
              style={{ width: "100%", height: "100%" }}
            />
          </View>

          <Text className="mt-8 text-center text-4xl font-semibold tracking-[-1px]">
            Read the Quran, one verse at a time.
          </Text>
          <Text className="text-muted mt-4 px-2 text-center text-lg leading-7">
            Scroll up for the next ayah, down to go back. Read at your own pace.
          </Text>
        </View>

        <View className="mt-8">
          <Button className="h-14 w-full" haptics="Light" onPress={onContinue}>
            <ButtonLabel className="text-base font-semibold">
              Begin reading
            </ButtonLabel>
          </Button>
        </View>
      </View>
    </View>
  );
}
