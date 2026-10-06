import { Pressable } from "react-native";

import Feather from "@expo/vector-icons/Feather";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useCSSVariable } from "uniwind";

import { Image, Text, View } from "~/components/ui";
import { CHAPTERS, getChapter } from "~/constants/chapters";
import { getTranslationLanguage } from "~/constants/translations";
import { triggerHaptic } from "~/lib/haptics";
import { getEditionVerse } from "~/lib/quran/edition-data";
import { usePreferences } from "~/store/preferences-store";

export default function DailyDoseScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ chapter?: string; verse?: string }>();
  const foregroundColor = useCSSVariable("--foreground") as string;

  const chapterNumber = Number.parseInt(params.chapter ?? "", 10);
  const verseNumber = Number.parseInt(params.verse ?? "", 10);
  const chapter = getChapter(chapterNumber) ?? CHAPTERS[0];

  const dailyDoseTranslationId = usePreferences(
    (state) => state.dailyDoseTranslationId
  );
  const translationFontSize = usePreferences(
    (state) => state.translationFontSize
  );
  const language = getTranslationLanguage(dailyDoseTranslationId);
  const translation = getEditionVerse(
    language.editionId,
    chapter.chapterNumber,
    Number.isNaN(verseNumber) ? 1 : verseNumber
  );

  return (
    <View className="bg-background pt-safe-offset-4 flex-1">
      <View className="flex-row items-center justify-center px-6">
        <Image
          source={{
            light: require("~/../assets/images/logo-long.png"),
            dark: require("~/../assets/images/logo-long-dark.png"),
          }}
          height={34}
        />

        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Close daily dose"
          className="absolute right-6 active:opacity-60"
          hitSlop={12}
          onPress={() => {
            triggerHaptic();
            router.push("/");
          }}
        >
          <Feather color={foregroundColor} name="x" size={26} />
        </Pressable>
      </View>

      <View className="flex-1 items-center justify-center px-8">
        {translation ? (
          <>
            <Text
              className="text-foreground text-center"
              style={{
                fontFamily: language.fontFamily,
                fontSize: translationFontSize,
              }}
            >
              {translation.text}
            </Text>

            <Text className="text-muted mt-6 text-center text-sm">
              {`Verse ${translation.verse} of ${chapter.name}`}
            </Text>
          </>
        ) : (
          <Text className="text-muted text-center text-base">
            This verse is no longer available in your daily dose.
          </Text>
        )}
      </View>
    </View>
  );
}
