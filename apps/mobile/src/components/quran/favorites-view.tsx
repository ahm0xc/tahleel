import React from "react";

import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { useCSSVariable } from "uniwind";

import { Text, View } from "~/components/ui";
import { getArabicScript } from "~/constants/scripts";
import { useFavoriteVerses } from "~/store/favorite-store";
import { usePreferences } from "~/store/preferences-store";

import { type PagedVerse, VersePager } from "./verse-pager";

const FAVORITES_LIST_KEY = "favorites";

export function FavoritesView() {
  const favorites = useFavoriteVerses();
  const scriptId = usePreferences((state) => state.scriptId);
  const fontSize = usePreferences((state) => state.arabicFontSize);
  const script = getArabicScript(scriptId);

  const verses = React.useMemo<PagedVerse[]>(
    () =>
      favorites.map(({ chapterNumber, verseNumber, verse, text }) => ({
        key: `${script.editionId}:${chapterNumber}:${verseNumber}`,
        chapterNumber,
        verse: { verse, text },
      })),
    [favorites, script.editionId]
  );

  if (verses.length === 0) {
    return <EmptyFavorites />;
  }

  return (
    <VersePager
      fontSize={fontSize}
      listKey={FAVORITES_LIST_KEY}
      initialIndex={0}
      script={script}
      verses={verses}
    />
  );
}

function EmptyFavorites() {
  const mutedColor = useCSSVariable("--muted") as string;

  return (
    <View className="px-safe-offset-8 flex-1 items-center justify-center gap-2">
      <MaterialIcons name="favorite-outline" size={32} color={mutedColor} />

      <Text className="text-center">No favorite verses yet</Text>

      <Text className="text-muted text-center text-sm">
        Tap the heart on any verse to keep it here.
      </Text>
    </View>
  );
}
