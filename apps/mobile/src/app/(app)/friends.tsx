import { Pressable } from "react-native";

import { Host, Button as NativeButton } from "@expo/ui/swift-ui";
import {
  buttonBorderShape,
  buttonStyle,
  controlSize,
  labelStyle,
} from "@expo/ui/swift-ui/modifiers";
import Feather from "@expo/vector-icons/Feather";
import { useRouter } from "expo-router";
import { Menu } from "heroui-native";
import { useCSSVariable } from "uniwind";

import { Text, View } from "~/components/ui";

export default function FriendsScreen() {
  const router = useRouter();

  return (
    <View className="bg-background flex-1">
      <View className="pt-safe-offset-2 px-safe-offset-4 pb-5">
        <View className="flex-row items-center gap-3">
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
          <View>
            <Text className="text-2xl font-bold tracking-tight">Friends</Text>
          </View>
        </View>
      </View>

      <View className="px-safe-offset-4">
        <View className="border-border bg-surface overflow-hidden rounded-3xl border">
          {FRIENDS.map((friend, index) => (
            <FriendRow
              key={friend.id}
              friend={friend}
              showDivider={index < FRIENDS.length - 1}
            />
          ))}
        </View>
      </View>
    </View>
  );
}

function FriendRow({
  friend,
  showDivider,
}: {
  friend: Friend;
  showDivider: boolean;
}) {
  const foregroundColor = String(useCSSVariable("--foreground") ?? "#4d4d4d");
  const initials = friend.name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .toUpperCase();

  return (
    <View
      className={
        showDivider
          ? "border-border flex-row items-center border-b px-4 py-3"
          : "flex-row items-center px-4 py-3"
      }
    >
      <View className="bg-accent size-11 items-center justify-center rounded-full">
        <Text className="text-accent-foreground font-semibold">{initials}</Text>
      </View>

      <View className="ml-3 min-w-0 flex-1">
        <Text className="text-foreground font-semibold" numberOfLines={1}>
          {friend.name}
        </Text>
      </View>

      <Menu>
        <Menu.Trigger asChild>
          <Pressable
            accessibilityLabel={`Actions for ${friend.name}`}
            className="active:bg-default ml-2 size-10 items-center justify-center rounded-full"
          >
            <Feather color={foregroundColor} name="more-horizontal" size={21} />
          </Pressable>
        </Menu.Trigger>
        <Menu.Portal>
          <Menu.Overlay />
          <Menu.Content presentation="popover" width={210}>
            <Menu.Item>
              <Menu.ItemTitle>View profile</Menu.ItemTitle>
            </Menu.Item>
            <Menu.Item>
              <Menu.ItemTitle>Send encouragement</Menu.ItemTitle>
            </Menu.Item>
            <Menu.Item variant="danger">
              <Menu.ItemTitle>Remove friend</Menu.ItemTitle>
            </Menu.Item>
          </Menu.Content>
        </Menu.Portal>
      </Menu>
    </View>
  );
}

type Friend = {
  id: string;
  name: string;
};

const FRIENDS: Friend[] = [
  { id: "aisha-rahman", name: "Aisha Rahman" },
  { id: "omar-farooq", name: "Omar Farooq" },
  { id: "fatima-khan", name: "Fatima Khan" },
  { id: "yusuf-ahmed", name: "Yusuf Ahmed" },
  { id: "maryam-hassan", name: "Maryam Hassan" },
];
