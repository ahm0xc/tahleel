import React from "react";

import { ClerkProvider, useAuth, useUser } from "@clerk/expo";
import { resourceCache } from "@clerk/expo/resource-cache";
import { tokenCache } from "@clerk/expo/token-cache";
import { useFonts } from "expo-font";
import * as Notifications from "expo-notifications";
import { Slot, usePathname, useRouter } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { StatusBar } from "expo-status-bar";
import { HeroUINativeProvider } from "heroui-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";

import { getDailyDoseTime } from "~/constants/daily-dose-times";
import { FONT_ASSETS } from "~/constants/fonts";
import "~/globals.css";
import { useInviteDeepLink } from "~/hooks/use-invite-deep-link";
import { refreshDailyDoseIfNeeded } from "~/lib/notification";
import { useInviteStore } from "~/store/invite-store";
import {
  NotificationProvider,
  useNotificationObserver,
} from "~/store/notification-store";
import { useOnboarding } from "~/store/onboarding-store";
import { usePreferences } from "~/store/preferences-store";
import { StreaksProvider } from "~/store/streaks-context";
import { TRPCProvider } from "~/trpc/provider";

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

  const [fontsLoaded, fontsError] = useFonts(FONT_ASSETS);

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
  const areFontsReady = fontsLoaded || fontsError != null;

  useNotificationObserver();
  useInviteDeepLink();

  React.useEffect(() => {
    const { dailyDoseEnabled, dailyDoseTimeId, dailyDoseTranslationId } =
      usePreferences.getState();

    void refreshDailyDoseIfNeeded({
      enabled: dailyDoseEnabled,
      time: getDailyDoseTime(dailyDoseTimeId),
      translationLanguageId: dailyDoseTranslationId,
    });
  }, []);

  React.useEffect(() => {
    if (!user) return;

    const { name, setName } = useOnboarding.getState();
    if (!name) return;

    user
      .update({ firstName: name })
      .then(() => setName(null))
      .catch((error) => {
        console.error("[Onboarding] Failed to apply name to Clerk user", error);
      });
  }, [user]);

  React.useEffect(() => {
    if (fontsError) {
      console.warn("[Fonts] Failed to load:", fontsError.message);
    }
  }, [fontsError]);

  React.useEffect(() => {
    if (!isAuthLoaded || !isUserLoaded || !hasOnboardingHydrated) return;

    if (!isOnboardingCompleted) {
      if (!inOnboarding) router.replace("/onboarding");
    } else if (!isAuthenticated) {
      if (!inAuthGroup) router.replace("/auth");
    } else if (inOnboarding || inAuthGroup) {
      const pendingCode = useInviteStore.getState().pendingCode;
      if (pendingCode) {
        useInviteStore.getState().setPendingCode(null);
        router.replace(`/invite/${pendingCode}`);
      } else {
        router.replace("/");
      }
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
    if (isAppReady && areFontsReady) {
      SplashScreen.hideAsync();
    }
  }, [isAppReady, areFontsReady]);

  if (
    !isAppReady ||
    !areFontsReady ||
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
      __experimental_resourceCache={resourceCache}
      telemetry={false}
    >
      <TRPCProvider>
        <StreaksProvider>
          <NotificationProvider>
            <GestureHandlerRootView style={{ flex: 1 }}>
              <StatusBar style="auto" />
              <HeroUINativeProvider
                config={{ devInfo: { stylingPrinciples: false } }}
              >
                <InitialLayout />
              </HeroUINativeProvider>
            </GestureHandlerRootView>
          </NotificationProvider>
        </StreaksProvider>
      </TRPCProvider>
    </ClerkProvider>
  );
}
