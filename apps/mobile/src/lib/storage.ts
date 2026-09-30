import { createMMKV } from "react-native-mmkv";
import { StateStorage } from "zustand/middleware";

export const localStorage = createMMKV();
export const cacheStorage = createMMKV({
  id: "cache-storage",
});

export const zustandStorage: StateStorage = {
  setItem: (name, value) => {
    try {
      return localStorage.set(name, value);
    } catch (err) {
      console.error("[Storage] Failed to set item:", { name, error: err });
      throw err;
    }
  },
  getItem: (name) => {
    try {
      const value = localStorage.getString(name);
      return value ?? null;
    } catch (err) {
      console.error("[Storage] Failed to get item:", { name, error: err });
      return null;
    }
  },
  removeItem: (name) => {
    try {
      return localStorage.remove(name);
    } catch (err) {
      console.error("[Storage] Failed to remove item:", { name, error: err });
      throw err;
    }
  },
};
