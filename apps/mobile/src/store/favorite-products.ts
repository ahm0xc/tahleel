import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

import { zustandStorage } from "~/lib/storage";

interface FavoriteProductsStore {
  productBarcodes: string[];
  isFavorite: (barcode: string) => boolean;
  addProduct: (barcode: string) => void;
  removeProduct: (barcode: string) => void;
  toggleFavorite: (barcode: string) => void;
}

export const useFavoriteProducts = create<FavoriteProductsStore>()(
  persist(
    (set, get) => ({
      productBarcodes: [],
      isFavorite: (b) => get().productBarcodes.includes(b),
      addProduct: (b) => {
        if (get().isFavorite(b)) return;

        set((prev) => ({ productBarcodes: [b, ...prev.productBarcodes] }));
      },
      removeProduct: (b) => {
        if (!get().isFavorite(b)) return;

        set((prev) => ({
          productBarcodes: prev.productBarcodes.filter((x) => x !== b),
        }));
      },
      toggleFavorite: (b) => {
        if (get().isFavorite(b)) {
          get().removeProduct(b);
        } else {
          get().addProduct(b);
        }
      },
    }),
    {
      name: "favorite-products-store",
      storage: createJSONStorage(() => zustandStorage),
      version: 1,
    }
  )
);
