import { Stack } from "expo-router";
import { useCSSVariable } from "uniwind";

import { SANS_FONT_FAMILY } from "~/constants/fonts";

export default function SettingsLayout() {
  const backgroundColor = useCSSVariable("--background") as string;
  const foregroundColor = useCSSVariable("--foreground") as string;

  return (
    <Stack
      screenOptions={{
        animation: "slide_from_right",
        contentStyle: { backgroundColor },
        headerBackButtonDisplayMode: "minimal",
        headerShadowVisible: false,
        headerShown: true,
        headerStyle: { backgroundColor },
        headerTintColor: foregroundColor,
        headerTitleStyle: {
          color: foregroundColor,
          fontFamily: SANS_FONT_FAMILY,
          fontSize: 17,
        },
      }}
    >
      <Stack.Screen name="index" options={{ headerShown: false }} />
      <Stack.Screen name="font-size" options={{ title: "Font size" }} />
      <Stack.Screen
        name="translation-font-size"
        options={{ title: "Translation font size" }}
      />
      <Stack.Screen name="script" options={{ title: "Script" }} />
      <Stack.Screen name="daily-goal" options={{ title: "Daily goal" }} />
    </Stack>
  );
}
