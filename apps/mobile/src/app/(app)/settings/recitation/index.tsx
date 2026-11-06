import { useEffect } from "react";

import { ScrollView } from "react-native";

import { router } from "expo-router";

import {
  SettingsCard,
  SettingsListItem,
  SettingsSwitchRow,
} from "~/components/settings";
import { Text, View } from "~/components/ui";
import { RECITERS, getReciter } from "~/constants/reciters";
import { preloadReciterPreviews } from "~/lib/quran/reciter-preview";
import { usePreferences } from "~/store/preferences-store";

export default function RecitationScreen() {
  const reciterId = usePreferences((state) => state.reciterId);
  const recitationMode = usePreferences((state) => state.recitationMode);
  const setRecitationMode = usePreferences((state) => state.setRecitationMode);

  const reciter = getReciter(reciterId);
  const isContinuous = recitationMode === "continuous";

  useEffect(() => {
    preloadReciterPreviews(RECITERS.map((entry) => entry.id));
  }, []);

  return (
    <ScrollView
      className="bg-background flex-1"
      contentContainerClassName="pb-safe-offset-6"
    >
      <View className="px-safe-offset-4 mt-6">
        <SettingsCard>
          <SettingsListItem
            chevron
            icon="mic-outline"
            label="Reciter"
            value={reciter.name}
            onPress={() => router.push("/settings/recitation/reciter")}
          />
          <SettingsSwitchRow
            icon="repeat-outline"
            label="Continuous recitation"
            showDivider={false}
            value={isContinuous}
            onChange={(value) =>
              setRecitationMode(value ? "continuous" : "once")
            }
          />
        </SettingsCard>

        <Text className="text-muted mt-2 px-4 text-sm">
          When enabled, it will automatically scroll and read the next verse
        </Text>
      </View>
    </ScrollView>
  );
}
