import { ScrollView } from "react-native";

import { FontSizeSlider, VersePreviewCard } from "~/components/settings";
import { View } from "~/components/ui";
import { getTranslationLanguage } from "~/constants/translations";
import {
  DEFAULT_TRANSLATION_FONT_SIZE,
  TRANSLATION_LINE_HEIGHT_RATIO,
} from "~/constants/typography";
import { getEditionSample } from "~/lib/quran/edition-data";
import { usePreferences } from "~/store/preferences-store";

export default function TranslationFontSizeScreen() {
  const translationLanguageId = usePreferences(
    (state) => state.translationLanguageId
  );
  const translationFontSize = usePreferences(
    (state) => state.translationFontSize
  );
  const setTranslationFontSize = usePreferences(
    (state) => state.setTranslationFontSize
  );

  const language = getTranslationLanguage(translationLanguageId);

  return (
    <ScrollView
      className="bg-background flex-1"
      contentContainerClassName="pb-safe-offset-6"
    >
      <View className="px-safe-offset-4 pt-4">
        <VersePreviewCard
          caption={`Al-Fatiha 1:1 · ${language.name} · ${language.author}`}
          direction={language.direction}
          fontFamily={language.fontFamily}
          fontSize={translationFontSize}
          lineHeightRatio={TRANSLATION_LINE_HEIGHT_RATIO}
          text={getEditionSample(language.editionId)}
        />
      </View>

      <FontSizeSlider
        defaultValue={DEFAULT_TRANSLATION_FONT_SIZE}
        title="Translation"
        value={translationFontSize}
        onCommit={setTranslationFontSize}
      />
    </ScrollView>
  );
}
