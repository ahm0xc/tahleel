import { Stack } from "expo-router";
import { useCSSVariable } from "uniwind";

import { View } from "~/components/ui";

export default function Layout() {
  const backgroundColor = useCSSVariable("--background") as string;

  return (
    <View style={{ flex: 1 }}>
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor },
        }}
      >
        <Stack.Screen name="auth" />
      </Stack>
    </View>
  );
}
