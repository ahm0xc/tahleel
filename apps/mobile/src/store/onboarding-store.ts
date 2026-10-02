import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

import { zustandStorage } from "~/lib/storage";

interface OnboardingStore {
  isCompleted: boolean;
  hasHydrated: boolean;
  name: string | null;
  setCompleted: (isCompleted: boolean) => void;
  setHasHydrated: (hasHydrated: boolean) => void;
  setName: (name: string | null) => void;
}

export const useOnboarding = create<OnboardingStore>()(
  persist(
    (set) => ({
      isCompleted: false,
      hasHydrated: false,
      name: null,
      setCompleted(isCompleted) {
        set({ isCompleted });
      },
      setHasHydrated(hasHydrated) {
        set({ hasHydrated });
      },
      setName(name) {
        set({ name });
      },
    }),
    {
      name: "onboarding-store",
      storage: createJSONStorage(() => zustandStorage),
      version: 1,
      onRehydrateStorage: () => (state) => {
        state?.setHasHydrated(true);
      },
    }
  )
);
