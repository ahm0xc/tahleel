import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

import { zustandStorage } from "~/lib/storage";

interface DietStore {
  dietIds: string[];
  setDietIds: (ids: string[]) => void;
  dietExists: (id: string) => boolean;
  addDiet: (id: string) => void;
  removeDiet: (id: string) => void;
}

export const useDiet = create<DietStore>()(
  persist(
    (set, get) => ({
      dietIds: [] as string[],

      setDietIds: (ids) => set({ dietIds: ids }),

      dietExists: (id) => get().dietIds.includes(id),

      addDiet: (id) =>
        get().dietExists(id)
          ? null
          : set((state) => ({ dietIds: [id, ...state.dietIds] })),

      removeDiet: (id) =>
        set((state) => ({
          dietIds: state.dietIds.filter((a) => a !== id),
        })),
    }),
    {
      name: "diet-store",
      storage: createJSONStorage(() => zustandStorage),
      version: 1,
    }
  )
);
