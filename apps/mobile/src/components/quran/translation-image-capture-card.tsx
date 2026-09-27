import { Text, View } from "~/components/ui";
import { type Chapter } from "~/constants/chapters";
import { type TranslationLanguage } from "~/constants/translations";
import {
  TRANSLATION_LINE_HEIGHT_RATIO,
  getLineHeight,
} from "~/constants/typography";

import {
  CardRule,
  ShareImageCard,
  getCardHeadingSize,
} from "./share-image-card";

interface TranslationImageCaptureCardProps {
  chapter: Chapter;
  fontSize: number;
  language: TranslationLanguage;
  text: string;
  verseNumber: number;
  width: number;
}

/**
 * The counterpart of the verse card for a translation: same chrome, but the
 * quote is set in the language's own face and direction, and the author it is
 * quoted from is credited on the card -- a translation shared without one is
 * not much use to whoever receives it.
 */
export function TranslationImageCaptureCard({
  chapter,
  fontSize,
  language,
  text,
  verseNumber,
  width,
}: TranslationImageCaptureCardProps) {
  const headingSize = getCardHeadingSize(fontSize);

  return (
    <ShareImageCard width={width}>
      <Text
        className="text-muted text-center"
        style={{
          fontFamily: language.fontFamily,
          fontSize: headingSize,
          lineHeight: getLineHeight(headingSize, TRANSLATION_LINE_HEIGHT_RATIO),
          writingDirection: language.direction,
        }}
      >
        {chapter.name}
      </Text>

      <View className="flex-1 justify-center py-8">
        <Text
          className="text-foreground w-full text-center"
          style={{
            fontFamily: language.fontFamily,
            fontSize,
            lineHeight: getLineHeight(fontSize, TRANSLATION_LINE_HEIGHT_RATIO),
            writingDirection: language.direction,
          }}
        >
          {text}
        </Text>
      </View>

      <View className="items-center gap-4">
        <Text className="text-muted text-center text-sm">
          {`— ${language.author}`}
        </Text>

        <CardRule />

        <Text className="text-muted text-center text-sm">
          {`Quran ${chapter.chapterNumber}:${verseNumber} · ${chapter.englishName}`}
        </Text>
      </View>
    </ShareImageCard>
  );
}
