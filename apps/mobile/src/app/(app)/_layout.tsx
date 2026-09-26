import { Stack } from "expo-router";

import { BottomNav } from "~/components/bottom-nav";
import { View } from "~/components/ui";

export default function Layout() {
  return (
    <View className="bg-background flex-1">
      <Stack screenOptions={{ headerShown: false, animation: "none" }}>
        <Stack.Screen name="index" />
        <Stack.Screen name="reading" />
        <Stack.Screen name="explore" />
        <Stack.Screen name="friends" />
        <Stack.Screen name="settings" />
      </Stack>

      <BottomNav />
    </View>
  );
}
