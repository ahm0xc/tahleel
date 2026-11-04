import { create } from "zustand";

interface DeepLinkStore {
  pendingDeepLink: string | null;
  setPendingDeepLink: (deepLink: string | null) => void;
}

export const useDeepLinkStore = create<DeepLinkStore>((set) => ({
  pendingDeepLink: null,
  setPendingDeepLink: (pendingDeepLink) => set({ pendingDeepLink }),
}));
