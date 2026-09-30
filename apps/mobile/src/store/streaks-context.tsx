import {
  type ReactNode,
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import { useAuth } from "@clerk/expo";
import { useAppState } from "@react-native-community/hooks";
import type { AppRouter } from "@repo/trpc";
import type { inferRouterOutputs } from "@trpc/server";

import { useQueryWithCallbacks } from "~/hooks/use-query-with-callbacks";
import { calculateHasanat } from "~/lib/quran/hasanat";
import { cacheStorage } from "~/lib/storage";
import { usePreferences } from "~/store/preferences-store";
import { api } from "~/trpc/client";

type UserStreaks = inferRouterOutputs<AppRouter>["streaks"]["get"];
type TodayProgress = NonNullable<UserStreaks["todayProgress"]>;

type RecordVerseReadInput = {
  chapterNumber: number;
  verseNumber: number;
  text: string;
  timeSpentMs: number;
};

type SessionProgress = {
  readVerseKeys: Set<string>;
  versesRead: number;
  hasanatEarned: number;
  timeSpent: number;
};

type StreaksContextType = {
  userStreaks: UserStreaks | undefined;
  userStreaksPending: boolean;
  todayProgress: TodayProgress | null;
  recordVerseRead: (input: RecordVerseReadInput) => void;
};

type CachedStreaks = {
  day: string;
  data: UserStreaks;
};

const SYNC_DEBOUNCE_MS = 5_000;
const MILLISECONDS_PER_DAY = 86_400_000;

const StreaksContext = createContext<StreaksContextType | undefined>(undefined);

function todayInUTC() {
  return new Date().toISOString().slice(0, 10);
}

function epochDay(day: string): number {
  return (
    Date.UTC(
      Number(day.slice(0, 4)),
      Number(day.slice(5, 7)) - 1,
      Number(day.slice(8, 10))
    ) / MILLISECONDS_PER_DAY
  );
}

function diffInDays(from: string, to: string): number {
  return epochDay(to) - epochDay(from);
}

function isStreakAlive(lastCompletedDay: string | null): boolean {
  return (
    lastCompletedDay !== null && diffInDays(lastCompletedDay, todayInUTC()) <= 1
  );
}

function cacheKeyFor(userId: string) {
  return `streaks.get:${userId}`;
}

function emptySession(): SessionProgress {
  return {
    readVerseKeys: new Set(),
    versesRead: 0,
    hasanatEarned: 0,
    timeSpent: 0,
  };
}

function hasSessionActivity(session: SessionProgress): boolean {
  return (
    session.versesRead > 0 || session.hasanatEarned > 0 || session.timeSpent > 0
  );
}

function subtractSession(
  from: SessionProgress,
  sent: SessionProgress
): SessionProgress {
  const readVerseKeys = new Set(
    [...from.readVerseKeys].filter((key) => !sent.readVerseKeys.has(key))
  );

  return {
    readVerseKeys,
    versesRead: from.versesRead - sent.versesRead,
    hasanatEarned: from.hasanatEarned - sent.hasanatEarned,
    timeSpent: from.timeSpent - sent.timeSpent,
  };
}

function isUserStreaks(value: unknown): value is UserStreaks {
  if (typeof value !== "object" || value === null) return false;

  const candidate = value as Record<string, unknown>;

  return (
    typeof candidate.currentStreak === "number" &&
    typeof candidate.longestStreak === "number" &&
    (candidate.lastCompletedDay === null ||
      typeof candidate.lastCompletedDay === "string") &&
    typeof candidate.isAlive === "boolean" &&
    (candidate.todayProgress === null ||
      typeof candidate.todayProgress === "object")
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
  const dailyVerseGoal = usePreferences((state) => state.dailyVerseGoal);

  const updateMutation = api.streaks.update.useMutation();

  const [sessionVersion, setSessionVersion] = useState(0);
  const sessionRef = useRef<SessionProgress>(emptySession());
  const syncTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const syncInFlightRef = useRef(false);
  const userStreaksRef = useRef<UserStreaks | undefined>(undefined);
  const updateMutationRef = useRef(updateMutation);

  useEffect(() => {
    updateMutationRef.current = updateMutation;
  }, [updateMutation]);

  const mutateSession = useCallback(
    (updater: (previous: SessionProgress) => SessionProgress) => {
      sessionRef.current = updater(sessionRef.current);
      setSessionVersion((version) => version + 1);
    },
    []
  );

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
    userStreaksRef.current = userStreaks;
  }, [userStreaks]);

  const todayProgress = useMemo<TodayProgress | null>(() => {
    const base = userStreaks?.todayProgress;
    const session = sessionRef.current;

    const goal = base?.goalSnapshot ?? dailyVerseGoal;
    const versesRead = (base?.versesRead ?? 0) + session.versesRead;
    const hasanatEarned = (base?.hasanatEarned ?? 0) + session.hasanatEarned;
    const timeSpent = (base?.timeSpent ?? 0) + session.timeSpent;

    return {
      day: base?.day ?? todayInUTC(),
      goalSnapshot: goal,
      versesRead,
      hasanatEarned,
      timeSpent,
      completed: versesRead >= goal,
    };
  }, [dailyVerseGoal, sessionVersion, userStreaks?.todayProgress]);

  const flush = useCallback(async () => {
    if (!userId || syncInFlightRef.current) return;

    if (userStreaksRef.current === undefined) return;

    const base = userStreaksRef.current.todayProgress ?? null;
    const session = sessionRef.current;

    if (!hasSessionActivity(session)) return;

    const sent = {
      ...session,
      readVerseKeys: new Set(session.readVerseKeys),
    };

    syncInFlightRef.current = true;

    try {
      const result = await updateMutationRef.current.mutateAsync({
        day: todayInUTC(),
        goalSnapshot: base?.goalSnapshot ?? dailyVerseGoal,
        versesRead: (base?.versesRead ?? 0) + sent.versesRead,
        hasanatEarned: (base?.hasanatEarned ?? 0) + sent.hasanatEarned,
        timeSpent: (base?.timeSpent ?? 0) + sent.timeSpent,
      });

      const nextProgress = result.progress;
      const isAlive = isStreakAlive(result.streak.lastCompletedDay);

      const nextUserStreaks: UserStreaks = {
        currentStreak: result.streak.currentStreak,
        longestStreak: result.streak.longestStreak,
        lastCompletedDay: result.streak.lastCompletedDay,
        isAlive,
        todayProgress: {
          day: nextProgress.day,
          goalSnapshot: nextProgress.goalSnapshot,
          versesRead: nextProgress.versesRead,
          hasanatEarned: nextProgress.hasanatEarned,
          timeSpent: nextProgress.timeSpent,
          completed: nextProgress.completed,
        },
      };

      mutateSession((previous) => subtractSession(previous, sent));
      userStreaksRef.current = nextUserStreaks;

      utils.streaks.get.setData(undefined, (previous) =>
        previous ? { ...nextUserStreaks } : previous
      );
    } catch (error) {
      console.error("[Streaks] Failed to sync reading progress:", { error });
    } finally {
      syncInFlightRef.current = false;

      if (hasSessionActivity(sessionRef.current)) {
        scheduleSyncRef.current();
      }
    }
  }, [dailyVerseGoal, mutateSession, userId, utils]);

  const scheduleSync = useCallback(() => {
    if (!userId) return;

    if (syncTimerRef.current) {
      clearTimeout(syncTimerRef.current);
    }

    syncTimerRef.current = setTimeout(() => {
      syncTimerRef.current = null;
      void flushRef.current();
    }, SYNC_DEBOUNCE_MS);
  }, [userId]);

  const flushRef = useRef(flush);
  const scheduleSyncRef = useRef(scheduleSync);

  useEffect(() => {
    flushRef.current = flush;
  }, [flush]);

  useEffect(() => {
    scheduleSyncRef.current = scheduleSync;
  }, [scheduleSync]);

  const recordVerseRead = useCallback(
    ({
      chapterNumber,
      verseNumber,
      text,
      timeSpentMs,
    }: RecordVerseReadInput) => {
      if (!userId) return;

      const verseKey = `${chapterNumber}:${verseNumber}`;
      const hasanat = calculateHasanat(text);
      const timeSpent = Math.round(timeSpentMs / 1000);

      mutateSession((previous) => {
        const isNew = !previous.readVerseKeys.has(verseKey);
        const readVerseKeys = new Set(previous.readVerseKeys);
        if (isNew) readVerseKeys.add(verseKey);

        return {
          readVerseKeys,
          versesRead: previous.versesRead + (isNew ? 1 : 0),
          hasanatEarned: previous.hasanatEarned + (isNew ? hasanat : 0),
          timeSpent: previous.timeSpent + timeSpent,
        };
      });

      scheduleSyncRef.current();
    },
    [mutateSession, userId]
  );

  useEffect(() => {
    const currentDay = todayInUTC();

    if (activeDay.current === currentDay) return;

    activeDay.current = currentDay;
    mutateSession(() => emptySession());
    void utils.streaks.get.invalidate();
  }, [appState, mutateSession, utils]);

  const previousAppState = useRef(appState);

  useEffect(() => {
    if (previousAppState.current !== appState && appState !== "active") {
      if (syncTimerRef.current) {
        clearTimeout(syncTimerRef.current);
      }
      void flushRef.current();
    }
    previousAppState.current = appState;
  }, [appState]);

  useEffect(() => {
    if (!userId || userStreaks === undefined) return;

    if (hasSessionActivity(sessionRef.current)) {
      scheduleSyncRef.current();
    }
  }, [userId, userStreaks]);

  const value = useMemo<StreaksContextType>(
    () => ({ userStreaks, userStreaksPending, todayProgress, recordVerseRead }),
    [recordVerseRead, todayProgress, userStreaks, userStreaksPending]
  );

  return (
    <StreaksContext.Provider value={value}>{children}</StreaksContext.Provider>
  );
}

export function useStreaks() {
  const context = useContext(StreaksContext);

  if (!context) {
    throw new Error("useStreaks must be used within a StreaksProvider");
  }

  return context;
}
