import { LinearGradient } from "expo-linear-gradient";
import { useCSSVariable } from "uniwind";

import { Text, View } from "~/components/ui";
import { type Chapter } from "~/constants/chapters";
import { type ArabicScript } from "~/constants/scripts";
import {
  ARABIC_LINE_HEIGHT_RATIO,
  getLineHeight,
} from "~/constants/typography";
import { type QuranVerse } from "~/lib/quran/edition-data";

const ASPECT_RATIO = 1.25;
const PADDING = 28;
const BORDER_RADIUS = 24;
const RULE_WIDTH = 36;
const RULE_HEIGHT = 2;
const CHAPTER_NAME_RATIO = 0.8;

interface VerseImageCaptureCardProps {
  chapter: Chapter;
  fontSize: number;
  script: ArabicScript;
  verse: QuranVerse;
  width: number;
}

export function VerseImageCaptureCard({
  chapter,
  fontSize,
  script,
  verse,
  width,
}: VerseImageCaptureCardProps) {
  const backgroundColor = useCSSVariable("--background") as string;
  const surfaceColor = useCSSVariable("--surface") as string;
  const accentColor = useCSSVariable("--accent") as string;

  const chapterNameSize = Math.round(fontSize * CHAPTER_NAME_RATIO);

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
        <Text
          className="text-muted text-center"
          style={{
            fontFamily: script.fontFamily,
            fontSize: chapterNameSize,
            lineHeight: getLineHeight(
              chapterNameSize,
              ARABIC_LINE_HEIGHT_RATIO
            ),
            writingDirection: script.direction,
          }}
        >
          {chapter.arabicName}
        </Text>

        <View className="flex-1 justify-center py-8">
          <Text
            className="text-foreground w-full text-center"
            style={{
              fontFamily: script.fontFamily,
              fontSize,
              lineHeight: getLineHeight(fontSize, ARABIC_LINE_HEIGHT_RATIO),
              writingDirection: script.direction,
            }}
          >
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
