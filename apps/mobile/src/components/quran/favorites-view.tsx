import React from "react";

import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { useCSSVariable } from "uniwind";

import { Text, View } from "~/components/ui";
import { useFavoriteVerses } from "~/store/favorite-store";

import { type PagedVerse, VersePager } from "./verse-pager";

const FAVORITES_LIST_KEY = "favorites";

export function FavoritesView() {
  const favorites = useFavoriteVerses();

  const verses = React.useMemo<PagedVerse[]>(
    () =>
      favorites.map(({ chapterNumber, verseNumber, verse, text }) => ({
        key: `${chapterNumber}:${verseNumber}`,
        chapterNumber,
        verse: { verse, text },
      })),
    [favorites]
  );

  if (verses.length === 0) {
    return <EmptyFavorites />;
  }

  return (
    <VersePager listKey={FAVORITES_LIST_KEY} initialIndex={0} verses={verses} />
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
