import React from "react";

import { AppState, Platform } from "react-native";

import { useAuth, useSignIn, useUser } from "@clerk/expo";
import { useNetworkState } from "expo-network";

import { delay, withTimeout } from "~/lib/async";
import {
  clearDeviceSession,
  readDeviceSession,
  saveDeviceSession,
} from "~/lib/device-session";
import { api } from "~/trpc/client";

type TokenStatus = "unknown" | "present" | "absent";
type AttemptStatus = "idle" | "running" | "done";

const RESTORE_TIMEOUT_MS = 6_000;
const RESTORE_RETRY_DELAYS_MS = [6_000, 6_000];
const REGISTER_RETRY_DELAYS_MS = [1_000, 4_000];

function isUnauthorized(error: unknown) {
  return (
    typeof error === "object" &&
    error !== null &&
    "data" in error &&
    (error as { data?: { code?: string } }).data?.code === "UNAUTHORIZED"
  );
}

export function useDeviceSession() {
  const { isLoaded, isSignedIn } = useAuth({
    treatPendingAsSignedOut: false,
  });
  const { user } = useUser();
  const { signIn } = useSignIn();
  const utils = api.useUtils();
  const { isConnected, isInternetReachable } = useNetworkState();
  const isOnline = isConnected !== false && isInternetReachable !== false;

  const [tokenStatus, setTokenStatus] = React.useState<TokenStatus>("unknown");
  const [attemptStatus, setAttemptStatus] =
    React.useState<AttemptStatus>("idle");
  const [retryTick, setRetryTick] = React.useState(0);

  const sessionRef = React.useRef({
    isSignedIn,
    userId: user?.id,
    signIn,
    utils,
  });
  const isRestoring = React.useRef(false);
  const isRegistering = React.useRef(false);

  React.useEffect(() => {
    sessionRef.current = { isSignedIn, userId: user?.id, signIn, utils };
  });

  React.useEffect(() => {
    const subscription = AppState.addEventListener("change", (nextState) => {
      if (nextState === "active") {
        setRetryTick((tick) => tick + 1);
      }
    });

    return () => subscription.remove();
  }, []);

  React.useEffect(() => {
    if (!isOnline) return;
    setRetryTick((tick) => tick + 1);
  }, [isOnline]);

  const redeemDeviceSession = React.useCallback(async (deviceToken: string) => {
    const { signIn: currentSignIn, utils: currentUtils } = sessionRef.current;
    if (!currentSignIn) throw new Error("Clerk sign-in is not ready.");

    const { ticket } = await withTimeout(
      (signal) =>
        currentUtils.client.auth.restoreSession.mutate(
          { deviceToken },
          { signal }
        ),
      RESTORE_TIMEOUT_MS
    );

    if (sessionRef.current.isSignedIn) {
      throw new Error("A session became active before restore.");
    }

    const ticketResult = await currentSignIn.ticket({ ticket });
    if (ticketResult.error) throw ticketResult.error;

    if (sessionRef.current.isSignedIn) {
      throw new Error("A session became active during restore.");
    }

    const finalizeResult = await currentSignIn.finalize();
    if (finalizeResult.error) throw finalizeResult.error;
  }, []);

  React.useEffect(() => {
    if (!isLoaded) return;

    if (isSignedIn) {
      setAttemptStatus("idle");
      return;
    }

    if (isRestoring.current) return;

    isRestoring.current = true;
    setAttemptStatus((current) => (current === "idle" ? "running" : current));

    let restored = false;

    void (async () => {
      try {
        const stored = await readDeviceSession();
        if (!stored) {
          setTokenStatus("absent");
          return;
        }

        setTokenStatus("present");

        for (let attempt = 0; ; attempt++) {
          if (sessionRef.current.isSignedIn) return;

          try {
            await redeemDeviceSession(stored.token);
            restored = true;
            return;
          } catch (error) {
            console.warn("[auth] Silent session restore failed", error);

            if (isUnauthorized(error)) {
              await clearDeviceSession();
              setTokenStatus("absent");
              return;
            }

            if (sessionRef.current.isSignedIn) return;

            const retryDelay = RESTORE_RETRY_DELAYS_MS[attempt];
            if (retryDelay === undefined) return;

            setAttemptStatus("done");
            await delay(retryDelay);
          }
        }
      } finally {
        isRestoring.current = false;
        setAttemptStatus(
          restored || sessionRef.current.isSignedIn ? "idle" : "done"
        );
      }
    })();
  }, [isLoaded, isSignedIn, retryTick, redeemDeviceSession]);

  React.useEffect(() => {
    if (!isSignedIn || !user || isRegistering.current) return;

    isRegistering.current = true;

    void (async () => {
      try {
        const stored = await readDeviceSession();
        if (stored?.userId === user.id) {
          setTokenStatus("present");
          return;
        }

        if (stored) await clearDeviceSession();

        for (let attempt = 0; ; attempt++) {
          try {
            const { token } =
              await sessionRef.current.utils.client.auth.registerDevice.mutate({
                platform: Platform.OS === "ios" ? "ios" : "android",
              });

            const session = sessionRef.current;
            if (!session.isSignedIn || session.userId !== user.id) {
              void session.utils.client.auth.revokeDevice
                .mutate({ deviceToken: token })
                .catch((error) =>
                  console.warn(
                    "[auth] Failed to revoke unused device token",
                    error
                  )
                );
              await clearDeviceSession();
              return;
            }

            await saveDeviceSession({ token, userId: user.id });
            setTokenStatus("present");
            return;
          } catch (error) {
            const retryDelay = REGISTER_RETRY_DELAYS_MS[attempt];
            if (retryDelay === undefined) throw error;

            await delay(retryDelay);
          }
        }
      } catch (error) {
        console.warn("[auth] Failed to register this device", error);
      } finally {
        isRegistering.current = false;
      }
    })();
  }, [isSignedIn, user, retryTick]);

  return {
    isRestoring:
      isLoaded &&
      !isSignedIn &&
      tokenStatus !== "absent" &&
      attemptStatus !== "done",
  };
}
