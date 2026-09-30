import {
  type ReactNode,
  createContext,
  useContext,
  useEffect,
  useMemo,
  useRef,
} from "react";

import { useAuth } from "@clerk/expo";
import { useAppState } from "@react-native-community/hooks";
import type { AppRouter } from "@repo/trpc";
import type { inferRouterOutputs } from "@trpc/server";

import { useQueryWithCallbacks } from "~/hooks/use-query-with-callbacks";
import { cacheStorage } from "~/lib/storage";
import { api } from "~/trpc/client";

type UserStreaks = inferRouterOutputs<AppRouter>["streaks"]["get"];

type StreaksContextType = {
  userStreaks: UserStreaks | undefined;
  userStreaksPending: boolean;
};

type CachedStreaks = {
  day: string;
  data: UserStreaks;
};

const StreaksContext = createContext<StreaksContextType | undefined>(undefined);

function todayInUTC() {
  return new Date().toISOString().slice(0, 10);
}

function cacheKeyFor(userId: string) {
  return `streaks.get:${userId}`;
}

function isUserStreaks(value: unknown): value is UserStreaks {
  if (typeof value !== "object" || value === null) return false;

  const candidate = value as Record<string, unknown>;

  return (
    typeof candidate.currentStreak === "number" &&
    typeof candidate.longestStreak === "number" &&
    (candidate.lastCompletedDay === null ||
      typeof candidate.lastCompletedDay === "string") &&
    typeof candidate.isAlive === "boolean"
  );
}

function readCachedStreaks(
  userId: string,
  day: string
): UserStreaks | undefined {
  const key = cacheKeyFor(userId);
  const raw = cacheStorage.getString(key);

  if (!raw) return undefined;

  let parsed: unknown;

  try {
    parsed = JSON.parse(raw);
  } catch (err) {
    console.error("[Streaks] Failed to parse cached streaks:", { error: err });
    cacheStorage.remove(key);
    return undefined;
  }

  if (typeof parsed !== "object" || parsed === null) return undefined;

  const cached = parsed as Partial<CachedStreaks>;

  if (cached.day !== day || !isUserStreaks(cached.data)) {
    cacheStorage.remove(key);
    return undefined;
  }

  return cached.data;
}

type StreaksProviderProps = {
  children: ReactNode;
};

export function StreaksProvider({ children }: StreaksProviderProps) {
  const utils = api.useUtils();
  const { userId } = useAuth();
  const appState = useAppState();

  const snapshot = useMemo(
    () => (userId ? readCachedStreaks(userId, todayInUTC()) : undefined),
    [userId]
  );
  const activeDay = useRef(todayInUTC());

  const { data: userStreaks, isPending: userStreaksPending } =
    useQueryWithCallbacks({
      ...utils.streaks.get.queryOptions(),
      enabled: Boolean(userId),
      staleTime: 0,
      initialData: snapshot,
      onSuccess(data) {
        if (!userId) return;
        cacheStorage.set(
          cacheKeyFor(userId),
          JSON.stringify({ day: todayInUTC(), data } satisfies CachedStreaks)
        );
      },
    });

  useEffect(() => {
    const currentDay = todayInUTC();

    if (activeDay.current === currentDay) return;

    activeDay.current = currentDay;
    void utils.streaks.get.invalidate();
  }, [appState, utils]);

  return (
    <StreaksContext.Provider value={{ userStreaks, userStreaksPending }}>
      {children}
    </StreaksContext.Provider>
  );
}

export function useStreaks() {
  const context = useContext(StreaksContext);

  if (!context) {
    throw new Error("useStreaks must be used within a StreaksProvider");
  }

  return context;
}
