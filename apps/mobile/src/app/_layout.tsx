import React from "react";

import { ClerkProvider, useAuth } from "@clerk/clerk-expo";
import * as Notifications from "expo-notifications";
import { Slot, usePathname, useRouter } from "expo-router";
import * as SecureStore from "expo-secure-store";
import * as SplashScreen from "expo-splash-screen";
import { HeroUINativeProvider } from "heroui-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";

import "~/globals.css";
import {
  NotificationProvider,
  useNotificationObserver,
} from "~/store/notification-store";
import { useOnboarding } from "~/store/onboarding-store";

SplashScreen.preventAutoHideAsync();

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldPlaySound: true,
    shouldSetBadge: true,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

const tokenCache = {
  async getToken(key: string) {
    try {
      return SecureStore.getItemAsync(key);
    } catch (err) {
      console.error("[TokenCache] Failed to get token:", err);
      return null;
    }
  },
  async saveToken(key: string, value: string) {
    try {
      return SecureStore.setItemAsync(key, value);
    } catch (err) {
      console.error("[TokenCache] Failed to save token:", err);
      return;
    }
  },
};

const CLERK_PUBLISHABLE_KEY = process.env.EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY;

if (!CLERK_PUBLISHABLE_KEY) {
  console.error("Missing CLERK_PUBLISHABLE_KEY");
}

function InitialLayout() {
  const [isAppReady, setIsAppReady] = React.useState(false);

  const { isLoaded: isAuthLoaded, isSignedIn } = useAuth();
  const {
    hasHydrated: hasOnboardingHydrated,
    isCompleted: isOnboardingCompleted,
  } = useOnboarding();

  const router = useRouter();
  const pathname = usePathname();
  const inAuthGroup = pathname === "/auth" || pathname.startsWith("/auth/");
  const inOnboarding = pathname === "/onboarding";

  useNotificationObserver();

  React.useEffect(() => {
    if (!isAuthLoaded || !hasOnboardingHydrated) return;

    if (!isOnboardingCompleted) {
      if (!inOnboarding) router.replace("/onboarding");
    } else if (!isSignedIn) {
      if (!inAuthGroup) router.replace("/auth");
    } else if (inOnboarding || inAuthGroup) {
      router.replace("/");
    }

    setIsAppReady(true);
  }, [
    hasOnboardingHydrated,
    isAuthLoaded,
    isOnboardingCompleted,
    isSignedIn,
    pathname,
    router,
  ]);

  const isRedirecting =
    (isOnboardingCompleted && !isSignedIn && !inAuthGroup) ||
    (!isOnboardingCompleted && !inOnboarding) ||
    (isOnboardingCompleted && isSignedIn && (inOnboarding || inAuthGroup));

  React.useEffect(() => {
    if (isAppReady) {
      SplashScreen.hideAsync();
    }
  }, [isAppReady]);

  if (!isAppReady || !isAuthLoaded || !hasOnboardingHydrated || isRedirecting) {
    return null;
  }

  return <Slot />;
}

export default function RootLayout() {
  return (
    <ClerkProvider
      publishableKey={CLERK_PUBLISHABLE_KEY}
      tokenCache={tokenCache}
      telemetry={false}
    >
      <NotificationProvider>
        <GestureHandlerRootView style={{ flex: 1 }}>
          <HeroUINativeProvider
            config={{ devInfo: { stylingPrinciples: false } }}
          >
            <InitialLayout />
          </HeroUINativeProvider>
        </GestureHandlerRootView>
      </NotificationProvider>
    </ClerkProvider>
  );
}
