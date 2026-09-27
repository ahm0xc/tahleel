import { Alert, Linking, ScrollView } from "react-native";

import { useAuth, useUser } from "@clerk/expo";
import Constants from "expo-constants";
import * as Device from "expo-device";

import {
  SettingsList,
  SettingsListItem,
  SettingsPicker,
} from "~/components/settings-list";
import { Image, Text, View } from "~/components/ui";
import { LANGUAGES, getEditionsByLanguage } from "~/constants/editions";
import { openAccountDeletionRequest } from "~/lib/account-deletion";
import { openFeedback } from "~/lib/feedback";
import { isDev } from "~/lib/utils";
import { useOnboarding } from "~/store/onboarding-store";
import { usePreferences } from "~/store/preferences-store";

const PRIVACY_POLICY_URL = `${process.env.EXPO_PUBLIC_APP_URL}/privacy`;
const TERMS_URL = `${process.env.EXPO_PUBLIC_APP_URL}/terms`;

export default function SettingsScreen() {
  const { signOut } = useAuth();
  const { user } = useUser();
  const { setCompleted: setOnboardingCompleted } = useOnboarding();
  const language = usePreferences((state) => state.language);
  const editionId = usePreferences((state) => state.editionId);
  const setLanguage = usePreferences((state) => state.setLanguage);
  const setEditionId = usePreferences((state) => state.setEditionId);

  const editions = getEditionsByLanguage(language);
  const selectedEditionId = editions.some((edition) => edition.id === editionId)
    ? editionId
    : (editions[0]?.id ?? "");

  return (
    <ScrollView className="pb-safe-offset-4 pt-safe-offset-2 bg-background flex-1">
      <Header />

      <ProfileCard />

      <SettingsList title="Quran settings">
        <SettingsPicker
          icon="language-outline"
          label="Language"
          options={LANGUAGES.map((option) => ({
            value: option.id,
            label:
              option.nativeName === option.name
                ? option.name
                : `${option.name} (${option.nativeName})`,
          }))}
          value={language}
          onChange={setLanguage}
        />

        <SettingsPicker
          icon="book-outline"
          label="Translation"
          options={editions.map((edition) => ({
            value: edition.id,
            label: edition.name,
            description: edition.arabicName,
          }))}
          value={selectedEditionId}
          onChange={setEditionId}
          showDivider={false}
        />
      </SettingsList>

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
  return (
    <View className="px-safe-offset-4 items-center pt-4">
      <Image
        source={require("~/../assets/images/app-logo-long.png")}
        style={{ height: 30, width: (434 / 100) * 30 }}
      />
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
