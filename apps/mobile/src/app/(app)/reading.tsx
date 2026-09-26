import React from "react";

import { FavoritesView, ReadingHeader, ReadingView } from "~/components/quran";
import { View } from "~/components/ui";
import { useReadingState } from "~/store/reading-state-store";

export default function ReadingScreen() {
  const view = useReadingState((state) => state.view);
  const setView = useReadingState((state) => state.setView);

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
