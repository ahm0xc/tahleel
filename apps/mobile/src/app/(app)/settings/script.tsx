import { ScrollView } from "react-native";

import {
  SettingsList,
  SettingsRadioRow,
  VersePreviewCard,
} from "~/components/settings";
import { Text, View } from "~/components/ui";
import { ARABIC_SCRIPTS, getArabicScript } from "~/constants/scripts";
import { ARABIC_LINE_HEIGHT_RATIO } from "~/constants/typography";
import {
  getEditionSample,
  getEditionSampleWord,
} from "~/lib/quran/edition-data";
import { usePreferences } from "~/store/preferences-store";

const SAMPLE_WORD_SIZE = 26;

export default function ScriptScreen() {
  const scriptId = usePreferences((state) => state.scriptId);
  const arabicFontSize = usePreferences((state) => state.arabicFontSize);
  const setScriptId = usePreferences((state) => state.setScriptId);

  const script = getArabicScript(scriptId);

  return (
    <ScrollView
      className="bg-background flex-1"
      contentContainerClassName="pb-safe-offset-6"
    >
      {/* Shows the choice at the size it will actually be read at, so picking a
          script is a comparison rather than a guess. */}
      <View className="px-safe-offset-4 pt-4">
        <VersePreviewCard
          caption={script.arabicName}
          direction={script.direction}
          fontFamily={script.fontFamily}
          fontSize={arabicFontSize}
          lineHeightRatio={ARABIC_LINE_HEIGHT_RATIO}
          text={getEditionSample(script.editionId)}
        />
      </View>

      <SettingsList title="Script">
        {ARABIC_SCRIPTS.map((option, index) => (
          <SettingsRadioRow
            key={option.id}
            description={option.arabicName}
            isSelected={option.id === scriptId}
            label={option.name}
            preview={
              <Text
                className="text-muted"
                style={{
                  fontFamily: option.fontFamily,
                  fontSize: SAMPLE_WORD_SIZE,
                  writingDirection: option.direction,
                }}
              >
                {getEditionSampleWord(option.editionId)}
              </Text>
            }
            showDivider={index < ARABIC_SCRIPTS.length - 1}
            onPress={() => setScriptId(option.id)}
          />
        ))}
      </SettingsList>
    </ScrollView>
  );
}
