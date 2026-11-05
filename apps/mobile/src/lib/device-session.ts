import * as SecureStore from "expo-secure-store";

const STORAGE_KEY = "tahleel.device-session";
const OPTIONS = {
  keychainAccessible: SecureStore.AFTER_FIRST_UNLOCK,
};

export type DeviceSession = {
  token: string;
  userId: string;
};

export async function readDeviceSession(): Promise<DeviceSession | null> {
  try {
    const raw = await SecureStore.getItemAsync(STORAGE_KEY, OPTIONS);
    if (!raw) return null;

    const parsed = JSON.parse(raw) as Partial<DeviceSession>;
    if (typeof parsed.token !== "string" || typeof parsed.userId !== "string") {
      return null;
    }

    return { token: parsed.token, userId: parsed.userId };
  } catch {
    return null;
  }
}

export async function saveDeviceSession(session: DeviceSession) {
  await SecureStore.setItemAsync(STORAGE_KEY, JSON.stringify(session), OPTIONS);
}

export async function clearDeviceSession() {
  try {
    await SecureStore.deleteItemAsync(STORAGE_KEY, OPTIONS);
  } catch {
    return;
  }
}
