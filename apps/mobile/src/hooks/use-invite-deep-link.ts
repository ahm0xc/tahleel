import { useEffect, useRef } from "react";

import { useAuth } from "@clerk/expo";
import * as Linking from "expo-linking";

import { APP_DOMAIN } from "~/constants/config";
import { useInviteStore } from "~/store/invite-store";

function extractInviteCode(url: string): string | null {
  const parsed = Linking.parse(url);
  const path = parsed.path ?? "";

  const isAppLink =
    parsed.scheme === "tahleel" || parsed.hostname === APP_DOMAIN;
  if (!isAppLink) return null;

  const segments = path.split("/").filter(Boolean);
  return segments[0] === "invite" ? (segments[1] ?? null) : null;
}

export function useInviteDeepLink() {
  const { isSignedIn } = useAuth();
  const { setPendingCode } = useInviteStore();

  const isSignedInRef = useRef(isSignedIn);
  useEffect(() => {
    isSignedInRef.current = isSignedIn;
  }, [isSignedIn]);

  useEffect(() => {
    Linking.getInitialURL().then((url) => {
      if (!url) return;
      const code = extractInviteCode(url);
      if (code && !isSignedInRef.current) setPendingCode(code);
    });
  }, [setPendingCode]);

  useEffect(() => {
    const subscription = Linking.addEventListener("url", ({ url }) => {
      const code = extractInviteCode(url);
      if (code && !isSignedInRef.current) setPendingCode(code);
    });

    return () => subscription.remove();
  }, [setPendingCode]);
}
