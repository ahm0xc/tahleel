import { useMemo } from "react";

import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

import { getEnglishVerse } from "~/lib/quran/english-edition";
import { zustandStorage } from "~/lib/storage";

export interface FavoriteVerseRef {
  chapterNumber: number;
  verseNumber: number;
}

export interface FavoriteEntry extends FavoriteVerseRef {
  addedAt: number;
}

export function favoriteKey({ chapterNumber, verseNumber }: FavoriteVerseRef) {
  return `${chapterNumber}:${verseNumber}`;
}

export function isFavoriteRef(
  favorites: FavoriteVerseRef[],
  reference: FavoriteVerseRef
) {
  const key = favoriteKey(reference);

  return favorites.some((entry) => favoriteKey(entry) === key);
}

interface FavoriteStore {
  favorites: FavoriteEntry[];
  addFavorite: (favorite: FavoriteVerseRef) => void;
  removeFavorite: (favorite: FavoriteVerseRef) => void;
  toggleFavorite: (favorite: FavoriteVerseRef) => void;
  clearFavorites: () => void;
}

export const useFavorites = create<FavoriteStore>()(
  persist(
    (set) => ({
      favorites: [],
      addFavorite(favorite) {
        set((state) =>
          isFavoriteRef(state.favorites, favorite)
            ? state
            : {
                favorites: [
                  ...state.favorites,
                  { ...favorite, addedAt: Date.now() },
                ],
              }
        );
      },
      removeFavorite(favorite) {
        set((state) => {
          const key = favoriteKey(favorite);

          return {
            favorites: state.favorites.filter(
              (entry) => favoriteKey(entry) !== key
            ),
          };
        });
      },
      toggleFavorite(favorite) {
        set((state) =>
          isFavoriteRef(state.favorites, favorite)
            ? {
                favorites: state.favorites.filter(
                  (entry) => favoriteKey(entry) !== favoriteKey(favorite)
                ),
              }
            : {
                favorites: [
                  ...state.favorites,
                  { ...favorite, addedAt: Date.now() },
                ],
              }
        );
      },
      clearFavorites() {
        set({ favorites: [] });
      },
    }),
    {
      name: "favorite-store",
      storage: createJSONStorage(() => zustandStorage),
      version: 1,
    }
  )
);

export interface FavoriteVerse extends FavoriteVerseRef {
  verse: number;
  text: string;
}

export function useFavorite(reference: FavoriteVerseRef) {
  const favorites = useFavorites((state) => state.favorites);
  const toggleFavorite = useFavorites((state) => state.toggleFavorite);

  return {
    isFavorite: isFavoriteRef(favorites, reference),
    toggleFavorite() {
      toggleFavorite(reference);
    },
  };
}

export function useFavoriteVerses() {
  const favorites = useFavorites((state) => state.favorites);

  return useMemo(
    () =>
      [...favorites]
        .sort((a, b) => b.addedAt - a.addedAt)
        .map(({ chapterNumber, verseNumber }) => {
          const verse = getEnglishVerse(chapterNumber, verseNumber);

          return verse ? { chapterNumber, verseNumber, ...verse } : null;
        })
        .filter((verse): verse is FavoriteVerse => verse !== null),
    [favorites]
  );
}
