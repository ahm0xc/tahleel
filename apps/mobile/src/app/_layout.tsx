import React from "react";

import { ClerkProvider, useAuth, useUser } from "@clerk/expo";
import { tokenCache } from "@clerk/expo/token-cache";
import * as Notifications from "expo-notifications";
import { Slot, usePathname, useRouter } from "expo-router";
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

const CLERK_PUBLISHABLE_KEY = process.env.EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY;

if (!CLERK_PUBLISHABLE_KEY) {
  throw new Error("Missing EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY");
}

function InitialLayout() {
  const [isAppReady, setIsAppReady] = React.useState(false);

  const { isLoaded: isAuthLoaded, isSignedIn } = useAuth({
    treatPendingAsSignedOut: false,
  });
  const { isLoaded: isUserLoaded, user } = useUser();
  const isAuthenticated = isSignedIn === true && user != null;
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
    if (!isAuthLoaded || !isUserLoaded || !hasOnboardingHydrated) return;

    if (!isOnboardingCompleted) {
      if (!inOnboarding) router.replace("/onboarding");
    } else if (!isAuthenticated) {
      if (!inAuthGroup) router.replace("/auth");
    } else if (inOnboarding || inAuthGroup) {
      router.replace("/");
    }

    setIsAppReady(true);
  }, [
    hasOnboardingHydrated,
    isAuthLoaded,
    isOnboardingCompleted,
    isAuthenticated,
    isUserLoaded,
    pathname,
    router,
  ]);

  const isRedirecting =
    (isOnboardingCompleted && !isAuthenticated && !inAuthGroup) ||
    (!isOnboardingCompleted && !inOnboarding) ||
    (isOnboardingCompleted && isAuthenticated && (inOnboarding || inAuthGroup));

  React.useEffect(() => {
    if (isAppReady) {
      SplashScreen.hideAsync();
    }
  }, [isAppReady]);

  if (
    !isAppReady ||
    !isAuthLoaded ||
    !isUserLoaded ||
    !hasOnboardingHydrated ||
    isRedirecting
  ) {
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
