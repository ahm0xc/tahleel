import { Text, View } from "~/components/ui";
import { type Chapter } from "~/constants/chapters";
import { type ArabicScript } from "~/constants/scripts";
import {
  ARABIC_LINE_HEIGHT_RATIO,
  getLineHeight,
} from "~/constants/typography";
import { type QuranVerse } from "~/lib/quran/edition-data";

import {
  CardRule,
  ShareImageCard,
  getCardHeadingSize,
} from "./share-image-card";

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
  const headingSize = getCardHeadingSize(fontSize);

  return (
    <ShareImageCard width={width}>
      <Text
        className="text-muted text-center"
        style={{
          fontFamily: script.fontFamily,
          fontSize: headingSize,
          lineHeight: getLineHeight(headingSize, ARABIC_LINE_HEIGHT_RATIO),
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
        <CardRule />

        <Text className="text-muted text-center text-sm">
          {`Quran ${chapter.chapterNumber}:${verse.verse} · ${chapter.name}`}
        </Text>
      </View>
    </ShareImageCard>
  );
}
