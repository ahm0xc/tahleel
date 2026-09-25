import { Alert, Linking, ScrollView } from "react-native";

import { useAuth, useUser } from "@clerk/clerk-expo";
import { Host, Button as NativeButton } from "@expo/ui/swift-ui";
import {
  buttonBorderShape,
  buttonStyle,
  controlSize,
  labelStyle,
} from "@expo/ui/swift-ui/modifiers";
import Constants from "expo-constants";
import * as Device from "expo-device";
import { useRouter } from "expo-router";

import { SettingsList, SettingsListItem } from "~/components/settings-list";
import { Image, Text, View } from "~/components/ui";
import { openAccountDeletionRequest } from "~/lib/account-deletion";
import { openFeedback } from "~/lib/feedback";
import { triggerHaptic } from "~/lib/haptics";
import { isDev } from "~/lib/utils";
import { useOnboarding } from "~/store/onboarding-store";

const PRIVACY_POLICY_URL = `${process.env.EXPO_PUBLIC_APP_URL}/privacy`;
const TERMS_URL = `${process.env.EXPO_PUBLIC_APP_URL}/terms`;

export default function SettingsScreen() {
  const { signOut } = useAuth();
  const { user } = useUser();
  const { setCompleted: setOnboardingCompleted } = useOnboarding();

  return (
    <ScrollView className="pb-safe-offset-4 flex-1">
      <Header />

      <ProfileCard />

      <SettingsList title="Information">
        <SettingsListItem
          icon="chatbubble-ellipses-outline"
          label="Send Feedback"
          onPress={() => void openFeedback()}
        />
        <SettingsListItem
          icon="hand-left-outline"
          label="Privacy Policy"
          onPress={() => Linking.openURL(PRIVACY_POLICY_URL)}
        />
        <SettingsListItem
          icon="document-text-outline"
          label="Terms of Use"
          onPress={() => Linking.openURL(TERMS_URL)}
        />
        <SettingsListItem
          destructive
          icon="trash-outline"
          label="Account deletion request"
          onPress={() => {
            if (!user) return;

            Alert.alert(
              "Request account deletion?",
              "This will open your mail app with a prefilled request. Your account will not be deleted until the request is reviewed.",
              [
                { text: "Cancel", style: "cancel" },
                {
                  text: "Request deletion",
                  style: "destructive",
                  onPress: () =>
                    void openAccountDeletionRequest({
                      id: user.id,
                      firstName: user.firstName,
                      lastName: user.lastName,
                      email: user.primaryEmailAddress?.emailAddress ?? null,
                    }),
                },
              ]
            );
          }}
        />
        <SettingsListItem
          destructive
          icon="log-out-outline"
          label="Sign out"
          onPress={() =>
            Alert.alert("Sign out?", "Are you sure you want to sign out?", [
              { text: "Cancel", style: "cancel" },
              {
                text: "Sign out",
                style: "destructive",
                onPress: () => void signOut(),
              },
            ])
          }
          showDivider={false}
        />
      </SettingsList>

      {isDev ? (
        <SettingsList title="Development">
          <SettingsListItem
            destructive
            icon="refresh-outline"
            label="Reset onboarding"
            onPress={() => setOnboardingCompleted(false)}
          />
          <SettingsListItem
            destructive
            icon="log-out-outline"
            label="Reset onboarding and sign out"
            onPress={() => {
              setOnboardingCompleted(false);
              void signOut();
            }}
            showDivider={false}
          />
        </SettingsList>
      ) : null}

      <View className="px-safe-offset-4 pb-safe-offset-4 items-center pt-4">
        <Text className="text-foreground/40 text-center text-xs">
          Device: {Device.modelName ?? "Unknown device"} | OS:{" "}
          {Device.osName ?? "Unknown"} {Device.osVersion ?? ""}
        </Text>
        <Text className="text-foreground/40 mt-1 text-center text-xs">
          App version: {Constants.expoConfig?.version ?? "Unknown"} | SDK:{" "}
          {Constants.expoConfig?.sdkVersion ?? "Unknown"}
        </Text>
      </View>
    </ScrollView>
  );
}

function Header() {
  const router = useRouter();

  return (
    <View className="px-safe-offset-4 pt-4">
      <View className="flex-row items-center justify-between">
        <View className="flex-1 flex-row justify-start"></View>

        <View className="flex-1 flex-row justify-center">
          <Image
            source={require("~/../assets/images/app-logo-long.png")}
            style={{ height: 30, width: (434 / 100) * 30 }}
          />
        </View>

        <View className="flex-1 flex-row justify-end">
          <Host matchContents>
            <NativeButton
              label="Back"
              systemImage="xmark"
              onPress={() => {
                triggerHaptic();
                router.back();
              }}
              modifiers={[
                buttonStyle("glass"),
                controlSize("large"),
                labelStyle("iconOnly"),
                buttonBorderShape("circle"),
              ]}
            />
          </Host>
        </View>
      </View>
    </View>
  );
}

function ProfileCard() {
  const { user } = useUser();

  const name = [user?.firstName, user?.lastName].filter(Boolean).join(" ");
  const email = user?.primaryEmailAddress?.emailAddress ?? "No email added";
  const initials =
    [user?.firstName?.[0], user?.lastName?.[0]]
      .filter(Boolean)
      .join("")
      .toUpperCase() || "U";

  return (
    <View className="px-safe-offset-4 pt-8">
      <View className="border-border bg-surface overflow-hidden rounded-[28px] border">
        <View className="px-4 py-4">
          <View className="flex-row items-center">
            <View className="bg-accent h-16 w-16 items-center justify-center overflow-hidden rounded-full">
              {user?.imageUrl ? (
                <Image
                  source={user.imageUrl}
                  contentFit="cover"
                  style={{ height: 64, width: 64 }}
                />
              ) : (
                <Text className="text-accent-foreground font-sans-semi-bold text-xl">
                  {initials}
                </Text>
              )}
            </View>

            <View className="ml-4 flex-1">
              <Text className="text-foreground font-sans-semi-bold text-xl">
                {name || "Unknown"}
              </Text>
              <Text
                className="text-foreground/60 mt-1 text-[15px]"
                numberOfLines={1}
              >
                {email}
              </Text>
            </View>
          </View>
        </View>
      </View>
    </View>
  );
}
