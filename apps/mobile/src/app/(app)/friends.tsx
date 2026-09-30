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

import { Image, Text, View } from "~/components/ui";
import { api } from "~/trpc/client";

export default function FriendsScreen() {
  const router = useRouter();
  const { data: friends } = api.friends.list.useQuery();
  const removeFriend = api.friends.remove.useMutation();
  const utils = api.useUtils();

  function handleRemove(userId: string) {
    removeFriend.mutate(
      { friendUserId: userId },
      {
        onSuccess: () => {
          utils.friends.list.invalidate();
        },
      }
    );
  }

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

      {!friends || friends.length === 0 ? (
        <View className="px-safe-offset-4 items-center gap-2 pt-16">
          <Text className="text-muted text-sm">
            No friends yet. Add someone from the leaderboard to get started.
          </Text>
        </View>
      ) : (
        <View className="px-safe-offset-4">
          <View className="border-border bg-surface overflow-hidden rounded-3xl border">
            {friends.map((friend, index) => (
              <FriendRow
                key={friend.userId}
                friend={friend}
                showDivider={index < friends.length - 1}
                onRemove={() => handleRemove(friend.userId)}
              />
            ))}
          </View>
        </View>
      )}
    </View>
  );
}

function FriendRow({
  friend,
  showDivider,
  onRemove,
}: {
  friend: Friend;
  showDivider: boolean;
  onRemove: () => void;
}) {
  const foregroundColor = String(useCSSVariable("--foreground") ?? "#4d4d4d");
  const initials = friend.displayName
    .split(" ")
    .slice(0, 2)
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
      <View className="bg-accent size-11 items-center justify-center overflow-hidden rounded-full">
        {friend.imageUrl ? (
          <Image
            source={friend.imageUrl}
            contentFit="cover"
            style={{ height: 44, width: 44 }}
          />
        ) : (
          <Text className="text-accent-foreground font-semibold">
            {initials}
          </Text>
        )}
      </View>

      <View className="ml-3 min-w-0 flex-1">
        <Text className="text-foreground font-semibold" numberOfLines={1}>
          {friend.displayName}
        </Text>
      </View>

      <Menu>
        <Menu.Trigger asChild>
          <Pressable
            accessibilityLabel={`Actions for ${friend.displayName}`}
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
            <Menu.Item variant="danger" onPress={onRemove}>
              <Menu.ItemTitle>Remove friend</Menu.ItemTitle>
            </Menu.Item>
          </Menu.Content>
        </Menu.Portal>
      </Menu>
    </View>
  );
}

type Friend = {
  userId: string;
  displayName: string;
  imageUrl: string | null;
};
