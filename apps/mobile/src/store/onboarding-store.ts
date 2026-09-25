import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

import { zustandStorage } from "~/lib/storage";

interface OnboardingStore {
  isCompleted: boolean;
  hasHydrated: boolean;
  setCompleted: (isCompleted: boolean) => void;
  setHasHydrated: (hasHydrated: boolean) => void;
}

export const useOnboarding = create<OnboardingStore>()(
  persist(
    (set) => ({
      isCompleted: false,
      hasHydrated: false,
      setCompleted(isCompleted) {
        set({ isCompleted });
      },
      setHasHydrated(hasHydrated) {
        set({ hasHydrated });
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
