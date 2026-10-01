import { Alert, Linking, Pressable, ScrollView } from "react-native";

import { useAuth, useUser } from "@clerk/expo";
import { Ionicons } from "@expo/vector-icons";
import Constants from "expo-constants";
import * as Device from "expo-device";
import { router } from "expo-router";
import { useCSSVariable } from "uniwind";

import {
  SettingsList,
  SettingsListItem,
  SettingsPicker,
} from "~/components/settings";
import { Image, Text, View } from "~/components/ui";
import { getArabicScript } from "~/constants/scripts";
import { TRANSLATION_LANGUAGES } from "~/constants/translations";
import { openAccountDeletionRequest } from "~/lib/account-deletion";
import { openFeedback } from "~/lib/feedback";
import { cacheStorage } from "~/lib/storage";
import { isDev } from "~/lib/utils";
import { useOnboarding } from "~/store/onboarding-store";
import { usePreferences } from "~/store/preferences-store";

const PRIVACY_POLICY_URL = `${process.env.EXPO_PUBLIC_APP_URL}/privacy`;
const TERMS_URL = `${process.env.EXPO_PUBLIC_APP_URL}/terms`;

export default function SettingsScreen() {
  const { signOut } = useAuth();
  const { user } = useUser();
  const { setCompleted: setOnboardingCompleted } = useOnboarding();
  const scriptId = usePreferences((state) => state.scriptId);
  const dailyVerseGoal = usePreferences((state) => state.dailyVerseGoal);
  const translationLanguageId = usePreferences(
    (state) => state.translationLanguageId
  );
  const arabicFontSize = usePreferences((state) => state.arabicFontSize);
  const translationFontSize = usePreferences(
    (state) => state.translationFontSize
  );
  const setTranslationLanguageId = usePreferences(
    (state) => state.setTranslationLanguageId
  );

  const script = getArabicScript(scriptId);

  async function handleSignout() {
    cacheStorage.clearAll();
    await signOut();
  }

  return (
    <ScrollView className="pb-safe-offset-4 pt-safe-offset-2 bg-background flex-1">
      <Header />

      <ProfileCard />

      <SettingsList title="Quran settings">
        <SettingsListItem
          chevron
          icon="flag-outline"
          label="Daily goal"
          value={`${dailyVerseGoal} ${dailyVerseGoal === 1 ? "verse" : "verses"}`}
          onPress={() => router.push("/settings/daily-goal")}
        />

        <SettingsPicker
          icon="language-outline"
          label="Translation language"
          options={TRANSLATION_LANGUAGES.map((option) => ({
            value: option.id,
            label:
              option.nativeName === option.name
                ? option.name
                : `${option.name} (${option.nativeName})`,
            description: option.author,
          }))}
          value={translationLanguageId}
          onChange={setTranslationLanguageId}
        />

        <SettingsListItem
          chevron
          icon="text-outline"
          label="Script"
          value={script.name}
          onPress={() => router.push("/settings/script")}
        />

        <SettingsListItem
          chevron
          icon="resize-outline"
          label="Font size"
          value={String(arabicFontSize)}
          onPress={() => router.push("/settings/font-size")}
        />

        <SettingsListItem
          chevron
          icon="book-outline"
          label="Translation font size"
          showDivider={false}
          value={String(translationFontSize)}
          onPress={() => router.push("/settings/translation-font-size")}
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
                onPress: () => void handleSignout(),
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
              void handleSignout();
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
        source={require("~/../assets/images/logo-long.png")}
        style={{ height: 30, width: (434 / 100) * 30 }}
      />
    </View>
  );
}

function ProfileCard() {
  const { user } = useUser();
  const foregroundColor = useCSSVariable("--foreground") as string;

  const name = [user?.firstName, user?.lastName].filter(Boolean).join(" ");
  const email = user?.primaryEmailAddress?.emailAddress ?? "No email added";
  const initials =
    [user?.firstName?.[0], user?.lastName?.[0]]
      .filter(Boolean)
      .join("")
      .toUpperCase() || "U";

  return (
    <View className="px-safe-offset-4 pt-8">
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Profile"
        className="border-border bg-surface overflow-hidden rounded-[28px] border active:opacity-80"
        onPress={() => router.push("/settings/profile")}
      >
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
                <Text className="text-accent-foreground text-xl font-semibold">
                  {initials}
                </Text>
              )}
            </View>

            <View className="ml-4 flex-1">
              <Text className="text-foreground text-xl font-semibold">
                {name || "Unknown"}
              </Text>
              <Text
                className="text-foreground/60 mt-1 text-[15px]"
                numberOfLines={1}
              >
                {email}
              </Text>
            </View>

            <Ionicons
              className="ml-2"
              color={foregroundColor}
              name="chevron-forward"
              size={18}
            />
          </View>
        </View>
      </Pressable>
    </View>
  );
}
