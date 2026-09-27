import { LinearGradient } from "expo-linear-gradient";
import { useCSSVariable } from "uniwind";

import { Text, View } from "~/components/ui";
import { type Chapter } from "~/constants/chapters";
import { type EnglishVerse } from "~/lib/quran/english-edition";

const ASPECT_RATIO = 1.25;
const PADDING = 28;
const BORDER_RADIUS = 24;
const RULE_WIDTH = 36;
const RULE_HEIGHT = 2;

interface VerseImageCaptureCardProps {
  chapter: Chapter;
  verse: EnglishVerse;
  width: number;
}

export function VerseImageCaptureCard({
  chapter,
  verse,
  width,
}: VerseImageCaptureCardProps) {
  const backgroundColor = useCSSVariable("--background") as string;
  const surfaceColor = useCSSVariable("--surface") as string;
  const accentColor = useCSSVariable("--accent") as string;

  return (
    <LinearGradient
      colors={[backgroundColor, surfaceColor]}
      start={{ x: 0, y: 0 }}
      end={{ x: 0.5, y: 1 }}
      style={{
        borderRadius: BORDER_RADIUS,
        minHeight: width * ASPECT_RATIO,
        padding: PADDING,
        width,
      }}
    >
      <View className="flex-1 justify-between">
        <Text className="text-muted text-center text-lg">
          {chapter.arabicName}
        </Text>

        <View className="flex-1 justify-center py-8">
          <Text className="text-foreground w-full text-center text-2xl leading-relaxed">
            {verse.text}
          </Text>
        </View>

        <View className="items-center gap-4">
          <View
            style={{
              backgroundColor: accentColor,
              borderRadius: RULE_HEIGHT,
              height: RULE_HEIGHT,
              width: RULE_WIDTH,
            }}
          />

          <Text className="text-muted text-center text-sm">
            {`Quran ${chapter.chapterNumber}:${verse.verse} · ${chapter.name}`}
          </Text>
        </View>
      </View>
    </LinearGradient>
  );
}
