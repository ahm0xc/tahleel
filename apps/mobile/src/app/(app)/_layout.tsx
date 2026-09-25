import { Stack } from "expo-router";

import { View } from "~/components/ui";

export default function Layout() {
  return (
    <View style={{ flex: 1 }}>
      <Stack screenOptions={{ headerShown: false, animation: "none" }}>
        <Stack.Screen name="index" />
        <Stack.Screen name="onboarding" />
        <Stack.Screen
          name="settings"
          options={{
            presentation: "formSheet",
            animation: "slide_from_bottom",
          }}
        />
      </Stack>
    </View>
  );
}
