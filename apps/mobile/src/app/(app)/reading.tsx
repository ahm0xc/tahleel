import React from "react";

import { activateKeepAwakeAsync, deactivateKeepAwake } from "expo-keep-awake";
import { useFocusEffect } from "expo-router";

import { FavoritesView, ReadingHeader, ReadingView } from "~/components/quran";
import { View } from "~/components/ui";
import { usePreferences } from "~/store/preferences-store";
import { useReadingState } from "~/store/reading-state-store";

const READING_KEEP_AWAKE_TAG = "reading-screen";

export default function ReadingScreen() {
  const view = useReadingState((state) => state.view);
  const setView = useReadingState((state) => state.setView);
  const keepScreenAwake = usePreferences((state) => state.keepScreenAwake);

  useFocusEffect(
    React.useCallback(() => {
      if (!keepScreenAwake) {
        return;
      }

      void activateKeepAwakeAsync(READING_KEEP_AWAKE_TAG).catch(() => {});

      return () => {
        void deactivateKeepAwake(READING_KEEP_AWAKE_TAG).catch(() => {});
      };
    }, [keepScreenAwake])
  );

  function toggleView() {
    setView(view === "default" ? "favorites" : "default");
  }

  return (
    <View className="bg-background flex-1">
      <ReadingHeader view={view} onToggleView={toggleView} />

      {view === "favorites" ? <FavoritesView /> : <ReadingView />}
    </View>
  );
}
