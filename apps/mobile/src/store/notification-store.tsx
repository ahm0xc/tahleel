import * as React from "react";

import { Linking } from "react-native";

import { tryCatch } from "@ahm0xc/utils";
import { useAuth } from "@clerk/expo";
import { useAppState } from "@react-native-community/hooks";
import Constants from "expo-constants";
import * as Notifications from "expo-notifications";
import { useRouter } from "expo-router";

import { registerForPushNotificationsAsync } from "~/lib/notification";
import { localStorage } from "~/lib/storage";

const LAST_TRACKED_EXPO_PUSH_TOKEN = "last-tracked-expo-push-token";

interface NotificationContextType {
  expoPushToken: string | null;
  status: Notifications.PermissionStatus;
  registerNotification: () => Promise<string | null>;
}

const NotificationContext = React.createContext<
  NotificationContextType | undefined
>(undefined);

export function NotificationProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [expoPushToken, setExpoPushToken] = React.useState<string | null>(null);
  const [notificationStatus, setNotificationStatus] =
    React.useState<Notifications.PermissionStatus>(
      Notifications.PermissionStatus.UNDETERMINED
    );

  const currentAppState = useAppState();
  const { userId } = useAuth();

  async function registerNotification() {
    const [token, error] = await tryCatch(registerForPushNotificationsAsync());

    if (error) {
      console.error(
        "[Notification] Error while registering notification",
        error
      );
      return null;
    }

    if (token) {
      setExpoPushToken(token);
      return token;
    }

    return null;
  }

  async function refreshNotificationToken() {
    try {
      const projectId =
        Constants?.expoConfig?.extra?.eas?.projectId ??
        Constants?.easConfig?.projectId;

      if (!projectId) {
        console.warn(
          "[Notification] Project ID not found, skipping token refresh."
        );
        return;
      }

      const { data: token } = await Notifications.getExpoPushTokenAsync({
        projectId,
      });
      setExpoPushToken(token);
    } catch (error) {
      console.error(
        "[Notification] Failed to refresh notification token",
        error
      );
    }
  }

  async function refreshNotificationPermission() {
    try {
      const { status } = await Notifications.getPermissionsAsync();
      setNotificationStatus(status);
    } catch (error) {
      console.error(
        "[Notification] Failed to refresh notification status",
        error
      );
    }
  }

  React.useEffect(() => {
    refreshNotificationToken();
    refreshNotificationPermission();
  }, [currentAppState]);

  React.useEffect(() => {
    async function handler() {
      if (!expoPushToken) return;
      if (!userId) return;

      const lastTrackedExpoPushToken = localStorage.getString(
        LAST_TRACKED_EXPO_PUSH_TOKEN
      );

      if (
        typeof lastTrackedExpoPushToken === "undefined" ||
        lastTrackedExpoPushToken !== expoPushToken
      ) {
        localStorage.set(LAST_TRACKED_EXPO_PUSH_TOKEN, expoPushToken);
      }
    }

    handler();
  }, [expoPushToken, userId]);

  const value: NotificationContextType = {
    expoPushToken,
    status: notificationStatus,
    registerNotification,
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
}

export function useNotification() {
  const context = React.useContext(NotificationContext);
  if (context === undefined) {
    throw new Error(
      "useNotification must be used within a NotificationProvider"
    );
  }
  return context;
}

export function useNotificationObserver() {
  const router = useRouter();

  React.useEffect(() => {
    async function handler(notification: Notifications.Notification) {
      const url = notification.request.content.data?.url;
      const deepLink = notification.request.content.data?.deepLink;
      if (typeof url === "string") {
        Linking.openURL(url);
      }
      if (typeof deepLink === "string") {
        await new Promise((r) => setTimeout(() => r(""), 1000));
        router.push(deepLink);
      }
    }

    const response = Notifications.getLastNotificationResponse();

    if (response?.notification) {
      handler(response.notification);
    }

    const subscription = Notifications.addNotificationResponseReceivedListener(
      (response) => {
        handler(response.notification);
      }
    );

    return () => {
      subscription.remove();
    };
  }, []);
}
