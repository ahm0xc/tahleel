import React from "react";

import { ScrollView } from "react-native";

import { FontSizeSlider, VersePreviewCard } from "~/components/settings";
import { View } from "~/components/ui";
import { getArabicScript } from "~/constants/scripts";
import {
  ARABIC_LINE_HEIGHT_RATIO,
  DEFAULT_ARABIC_FONT_SIZE,
} from "~/constants/typography";
import { getEditionSample } from "~/lib/quran/edition-data";
import { usePreferences } from "~/store/preferences-store";

export default function FontSizeScreen() {
  const scriptId = usePreferences((state) => state.scriptId);
  const savedFontSize = usePreferences((state) => state.arabicFontSize);
  const setArabicFontSize = usePreferences((state) => state.setArabicFontSize);

  const [fontSize, setFontSize] = React.useState(savedFontSize);

  const script = getArabicScript(scriptId);

  return (
    <ScrollView
      className="bg-background flex-1"
      contentContainerClassName="pb-safe-offset-6"
    >
      <View className="px-safe-offset-4 pt-4">
        <VersePreviewCard
          caption="Al-Fatiha 1:1"
          direction={script.direction}
          fontFamily={script.fontFamily}
          fontSize={fontSize}
          lineHeightRatio={ARABIC_LINE_HEIGHT_RATIO}
          text={getEditionSample(script.editionId)}
        />
      </View>

      <FontSizeSlider
        defaultValue={DEFAULT_ARABIC_FONT_SIZE}
        title="Arabic"
        value={fontSize}
        onChange={setFontSize}
        onCommit={setArabicFontSize}
      />
    </ScrollView>
  );
}
