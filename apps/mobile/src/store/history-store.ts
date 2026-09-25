import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

import { zustandStorage } from "~/lib/storage";

export interface ProductV4QueryData {
  productDetails: {
    barcode: string;
  };
  nutrition: {
    calory: { amount: number };
    protein: { amount: number };
    carbohydrates: { amount: number };
    fat: { amount: number; amountPer100g: number };
    sugar: { amountPer100g: number };
    salt: { amountPer100g: number };
  };
  score: number;
  additives: unknown[];
}

export type HistoryProduct = ProductV4QueryData;

interface HistoryStore {
  products: HistoryProduct[];
  exists: (barcode: string) => boolean;
  addProduct: (product: HistoryProduct) => void;
  removeProduct: (barcode: string) => void;
  clearAllProduct: () => void;
}

export const useHistory = create<HistoryStore>()(
  persist(
    (set, get) => ({
      products: [],
      exists(barcode) {
        return Boolean(
          get().products.find((x) => x.productDetails.barcode === barcode)
        );
      },
      addProduct(product) {
        if (get().exists(product.productDetails.barcode)) return;

        set((prev) => ({ products: [product, ...prev.products] }));
      },
      removeProduct(barcode) {
        set((prev) => ({
          products: prev.products.filter(
            (x) => x.productDetails.barcode !== barcode
          ),
        }));
      },
      clearAllProduct() {
        set({ products: [] });
      },
    }),
    {
      name: "history-store",
      storage: createJSONStorage(() => zustandStorage),
      version: 2,
      migrate: (persistedState: any, version: number) => {
        if (version === 1) {
          return {
            ...persistedState,
            products: [],
          };
        }

        return persistedState;
      },
    }
  )
);
