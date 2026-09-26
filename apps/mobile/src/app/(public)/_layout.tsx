import { Stack } from "expo-router";

import { View } from "~/components/ui";

export default function Layout() {
  return (
    <View style={{ flex: 1 }}>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="onboarding" />
      </Stack>
    </View>
  );
}
