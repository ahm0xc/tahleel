import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

import { zustandStorage } from "~/lib/storage";

interface AllergensStore {
  allergensIds: string[];
  setAllergensIds: (ids: string[]) => void;
  allergensExists: (id: string) => boolean;
  addAllergens: (id: string) => void;
  removeAllergens: (id: string) => void;
}

export const useAllergens = create<AllergensStore>()(
  persist(
    (set, get) => ({
      allergensIds: [] as string[],

      setAllergensIds(ids) {
        set({ allergensIds: ids });
      },

      allergensExists: (id) => get().allergensIds.includes(id),

      addAllergens: (id) =>
        get().allergensExists(id)
          ? null
          : set((state) => ({ allergensIds: [id, ...state.allergensIds] })),

      removeAllergens: (id) =>
        set((state) => ({
          allergensIds: state.allergensIds.filter((a) => a !== id),
        })),
    }),
    {
      name: "allergens-store",
      storage: createJSONStorage(() => zustandStorage),
      version: 1,
    }
  )
);
