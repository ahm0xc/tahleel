import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

import { IconName } from "~/components/icon";
import { zustandStorage } from "~/lib/storage";
import type { ProductV4QueryData } from "~/store/history-store";

export interface LoggedMeal {
  id: string;
  timestamp: number;
  barcode: string;
  quantity: number; // multiplier for serving size, default 1
}

interface MealStore {
  meals: LoggedMeal[];
  addMeal: (barcode: string, quantity?: number) => void;
  removeMeal: (id: string) => void;
  clearAllMeals: () => void;
  getTodayTotals: (historyProducts: ProductV4QueryData[]) => {
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
  };
  getTodayAverageScore: (historyProducts: ProductV4QueryData[]) => number;
  getTodayRisks: (historyProducts: ProductV4QueryData[]) => {
    label: string;
    level: "high" | "medium" | "low";
    icon: IconName;
  }[];
}

export const useMealStore = create<MealStore>()(
  persist(
    (set, get) => ({
      meals: [],
      addMeal(barcode, quantity = 1) {
        const newMeal: LoggedMeal = {
          id: Math.random().toString(36).substring(7),
          timestamp: Date.now(),
          barcode,
          quantity,
        };
        set((state) => ({ meals: [newMeal, ...state.meals] }));
      },
      removeMeal(id) {
        set((state) => ({
          meals: state.meals.filter((m) => m.id !== id),
        }));
      },
      clearAllMeals() {
        set({ meals: [] });
      },
      getTodayTotals(historyProducts) {
        const today = new Date().setHours(0, 0, 0, 0);
        const todayMeals = get().meals.filter(
          (m) => new Date(m.timestamp).setHours(0, 0, 0, 0) === today
        );

        return todayMeals.reduce(
          (acc, meal) => {
            const product = historyProducts.find(
              (p) => p.productDetails.barcode === meal.barcode
            );
            if (!product) return acc;

            const n = product.nutrition;
            acc.calories += (n.calory.amount || 0) * meal.quantity;
            acc.protein += (n.protein.amount || 0) * meal.quantity;
            acc.carbs += (n.carbohydrates.amount || 0) * meal.quantity;
            acc.fat += (n.fat.amount || 0) * meal.quantity;
            return acc;
          },
          { calories: 0, protein: 0, carbs: 0, fat: 0 }
        );
      },
      getTodayAverageScore(historyProducts) {
        const today = new Date().setHours(0, 0, 0, 0);
        const todayMeals = get().meals.filter(
          (m) => new Date(m.timestamp).setHours(0, 0, 0, 0) === today
        );

        if (todayMeals.length === 0) return 0;

        let totalScore = 0;
        let totalQuantity = 0;

        for (const meal of todayMeals) {
          const product = historyProducts.find(
            (p) => p.productDetails.barcode === meal.barcode
          );
          if (product) {
            totalScore += product.score * meal.quantity;
            totalQuantity += meal.quantity;
          }
        }

        if (totalQuantity === 0) return 0;
        return Math.round(totalScore / totalQuantity);
      },
      getTodayRisks(historyProducts) {
        const today = new Date().setHours(0, 0, 0, 0);
        const todayMeals = get().meals.filter(
          (m) => new Date(m.timestamp).setHours(0, 0, 0, 0) === today
        );

        const risks: {
          label: string;
          level: "high" | "medium" | "low";
          icon: IconName;
        }[] = [];
        const seenRisks = new Set<string>();

        for (const meal of todayMeals) {
          const product = historyProducts.find(
            (p) => p.productDetails.barcode === meal.barcode
          );
          if (!product) continue;

          const n = product.nutrition;

          if (n.sugar.amountPer100g > 20 && !seenRisks.has("High sugar")) {
            risks.push({ label: "High sugar", level: "high", icon: "leaf" });
            seenRisks.add("High sugar");
          }
          if (n.fat.amountPer100g > 20 && !seenRisks.has("High fat")) {
            risks.push({ label: "High fat", level: "medium", icon: "leaf" });
            seenRisks.add("High fat");
          }
          if (n.salt.amountPer100g > 1.5 && !seenRisks.has("High salt")) {
            risks.push({ label: "High salt", level: "high", icon: "leaf" });
            seenRisks.add("High salt");
          }
          if (product.score < 40 && !seenRisks.has("Low score")) {
            risks.push({
              label: "Processed food",
              level: "medium",
              icon: "alert",
            });
            seenRisks.add("Low score");
          }
          if (
            product.additives.length > 5 &&
            !seenRisks.has("Many additives")
          ) {
            risks.push({
              label: "Many additives",
              level: "medium",
              icon: "factory",
            });
            seenRisks.add("Many additives");
          }
        }

        return risks.slice(0, 4);
      },
    }),
    {
      name: "meal-store",
      storage: createJSONStorage(() => zustandStorage),
    }
  )
);
