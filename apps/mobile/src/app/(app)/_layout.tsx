import { Stack } from "expo-router";

import { BottomNav } from "~/components/bottom-nav";
import UpdateAlert from "~/components/update-alert";
import { View } from "~/components/ui";

export default function Layout() {
  return (
    <View className="bg-background flex-1">
      <Stack
        screenOptions={{
          headerShown: false,
          animation: "none",
        }}
      >
        <Stack.Screen name="index" />
        <Stack.Screen name="reading" />
        <Stack.Screen name="donate" />
        <Stack.Screen name="leaderboard" />
        <Stack.Screen
          name="add-friend"
          options={{ animation: "slide_from_right" }}
        />
        <Stack.Screen
          name="friends"
          options={{ animation: "slide_from_right" }}
        />
        <Stack.Screen name="settings" />
      </Stack>

      <BottomNav />
      <UpdateAlert />
    </View>
  );
}
