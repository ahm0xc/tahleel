import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

import { zustandStorage } from "~/lib/storage";

interface ExampleStore {
  foo: string;
  setFoo: (value: string) => void;
}

export const useExample = create<ExampleStore>()(
  persist(
    (set) => ({
      foo: "bar",
      setFoo: (value) => set({ foo: value }),
    }),
    {
      name: "example-store",
      storage: createJSONStorage(() => zustandStorage),
      version: 1,
    }
  )
);
