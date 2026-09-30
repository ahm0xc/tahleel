import { create } from "zustand";

interface InviteStore {
  pendingCode: string | null;
  setPendingCode: (code: string | null) => void;
}

export const useInviteStore = create<InviteStore>((set) => ({
  pendingCode: null,
  setPendingCode: (pendingCode) => set({ pendingCode }),
}));
