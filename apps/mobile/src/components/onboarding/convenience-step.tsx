import { Button, ButtonLabel, Image, Text, View } from "~/components/ui";

interface ConvenienceStepProps {
  onContinue: () => void;
}

export function ConvenienceStep({ onContinue }: ConvenienceStepProps) {
  return (
    <View className="pt-safe-offset-4 flex-1 px-6">
      <View className="items-start">
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
            A daily ritual, not a chore.
          </Text>
          <Text className="text-foreground/70 mt-5 text-lg leading-7">
            Set a small goal for the day and let the verses come to you. Show up
            for a few minutes, and Allah multiplies it.
          </Text>

          <View className="bg-foreground/5 mt-7 rounded-3xl p-6">
            <Text className="text-foreground text-xl leading-8 font-medium">
              &ldquo;Indeed, He is with those who are mindful of Him.&rdquo;
            </Text>
            <Text className="text-muted mt-4 text-sm">Surah Al-Hijr 15:9</Text>
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
