import { Platform } from "react-native";

import { Host, Button as NativeButton } from "@expo/ui/swift-ui";
import {
  buttonBorderShape,
  buttonStyle,
  controlSize,
  labelStyle,
} from "@expo/ui/swift-ui/modifiers";
import { NativeStackHeaderProps, Stack, useRouter } from "expo-router";
import { useCSSVariable } from "uniwind";

import { Icon } from "~/components/icon";
import { Button, Text, View } from "~/components/ui";

export default function SettingsLayout() {
  const backgroundColor = useCSSVariable("--background") as string;
  const foregroundColor = useCSSVariable("--foreground") as string;

  return (
    <Stack
      screenOptions={{
        animation: "slide_from_right",
        contentStyle: { backgroundColor },
        header: Header,
      }}
    >
      <Stack.Screen name="index" options={{ headerShown: false }} />
      <Stack.Screen name="profile" options={{ title: "Profile" }} />
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

function Header({ options }: NativeStackHeaderProps) {
  const router = useRouter();

  return (
    <View className="pt-safe-offset-0 px-safe-offset-4 flex-row">
      <View className="h-14 flex-1 flex-row items-center justify-start">
        {Platform.OS === "ios" ? (
          <Host matchContents>
            <NativeButton
              label="Back"
              systemImage="chevron.backward"
              modifiers={[
                buttonStyle("glass"),
                controlSize("extraLarge"),
                labelStyle("iconOnly"),
                buttonBorderShape("circle"),
              ]}
              onPress={() => router.back()}
            />
          </Host>
        ) : (
          <Button isIconOnly variant="ghost" onPress={() => router.back()}>
            <Icon name="arrow-left" size={24} />
          </Button>
        )}
      </View>
      <View className="flex-1 flex-row items-center justify-center">
        <Text className="text-lg font-semibold">{options.title}</Text>
      </View>
      <View className="flex-1 flex-row items-center justify-end"></View>
    </View>
  );
}
