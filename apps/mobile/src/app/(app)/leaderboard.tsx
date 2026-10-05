import { useState } from "react";

import { ScrollView } from "react-native";

import { useUser } from "@clerk/expo";
import AntDesign from "@expo/vector-icons/AntDesign";
import Feather from "@expo/vector-icons/Feather";
import { router } from "expo-router";
import { Skeleton, Tabs } from "heroui-native";
import { useCSSVariable } from "uniwind";

import { Icon } from "~/components/icon";
import { OfflineAlert } from "~/components/offline-alert";
import { Button, Image, Text, View } from "~/components/ui";
import { useOffline } from "~/hooks/use-offline";
import { cn } from "~/lib/utils";
import { useStreaks } from "~/store/streaks-context";
import { api } from "~/trpc/client";

export default function LeaderboardScreen() {
  const [scope, setScope] = useState("friends");
  const isOffline = useOffline();

  const { user } = useUser();
  const { todayProgress } = useStreaks();
  const { data: friendLeaderboard, isLoading: isFriendsLoading } =
    api.friends.leaderboard.useQuery(undefined, { enabled: !isOffline });
  const currentUserEntry: LeaderboardEntry | null = user
    ? {
        id: user.id,
        name:
          user.fullName ||
          [user.firstName, user.lastName].filter(Boolean).join(" ") ||
          user.username ||
          "You",
        hasanat: todayProgress?.hasanatEarned ?? 0,
        imageUrl: user.imageUrl ?? null,
        isCurrentUser: true,
      }
    : null;
  const friendsEntries = rankEntries(
    (friendLeaderboard ?? []).map((entry) => ({
      id: entry.userId,
      name: entry.displayName,
      hasanat: entry.hasanat,
      imageUrl: entry.imageUrl,
      isCurrentUser: entry.isCurrentUser,
    }))
  );
  const globalEntries = rankEntries([
    ...GLOBAL_ENTRIES,
    ...(currentUserEntry ? [currentUserEntry] : []),
  ]);
  const entries = scope === "friends" ? friendsEntries : globalEntries;
  const isLoading = scope === "friends" && isFriendsLoading;

  return (
    <View className="bg-background flex-1">
      <Header />
      {isOffline && (
        <View className="px-safe-offset-4 pb-4">
          <OfflineAlert description="Friend rankings can't be loaded while you're offline." />
        </View>
      )}
      <Tabs className="px-safe-offset-4" value={scope} onValueChange={setScope}>
        <Tabs.List className="w-full">
          <Tabs.Indicator />
          <Tabs.Trigger className="flex-1" value="friends">
            <Tabs.Label>Friends</Tabs.Label>
          </Tabs.Trigger>
          <Tabs.Trigger className="flex-1" value="global">
            <Tabs.Label>Global</Tabs.Label>
          </Tabs.Trigger>
        </Tabs.List>
      </Tabs>
      <ScrollView
        className="flex-1"
        contentContainerClassName="gap-2 px-safe-offset-4 pb-6 pt-4"
      >
        {isLoading
          ? SKELETON_NAME_WIDTHS.map((nameWidth, index) => (
              <LeaderboardRowSkeleton key={index} nameWidth={nameWidth} />
            ))
          : entries.map((entry, index) => (
              <LeaderboardRow
                key={entry.id}
                entry={entry}
                rank={index + 1}
                highlighted={scope === "global" && entry.isCurrentUser === true}
              />
            ))}
      </ScrollView>
    </View>
  );
}

function Header() {
  const foregroundColor = String(useCSSVariable("--foreground") ?? "#4d4d4d");

  return (
    <View className="pt-safe-offset-2 px-safe-offset-4 pb-5">
      <View className="flex-row items-center justify-between">
        <Text className="text-2xl font-bold tracking-tight">Leaderboard</Text>
        <View className="flex-row items-center gap-1">
          <Button
            accessibilityLabel="Friends"
            isIconOnly
            onPress={() => router.push("/friends")}
            size="md"
            variant="ghost"
          >
            <Feather color={foregroundColor} name="users" size={22} />
          </Button>
          <Button
            accessibilityLabel="Add friend"
            isIconOnly
            onPress={() => router.push("/add-friend")}
            size="md"
            variant="ghost"
          >
            <AntDesign color={foregroundColor} name="user-add" size={24} />
          </Button>
        </View>
      </View>
    </View>
  );
}

function LeaderboardRow({
  entry,
  rank,
  highlighted,
}: {
  entry: LeaderboardEntry;
  rank: number;
  highlighted: boolean;
}) {
  const initials = entry.name
    .split(" ")
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase();

  return (
    <View
      className={cn(
        "border-border flex-row items-center gap-3 rounded-2xl border px-3 py-3",
        highlighted ? "bg-accent" : "bg-surface"
      )}
    >
      <RankBadge highlighted={highlighted} rank={rank} />
      <View
        className={cn(
          "size-10 items-center justify-center overflow-hidden rounded-full",
          highlighted ? "bg-accent-foreground" : "bg-accent"
        )}
      >
        {entry.imageUrl ? (
          <Image
            source={entry.imageUrl}
            contentFit="cover"
            style={{ height: 40, width: 40 }}
          />
        ) : (
          <Text
            className={cn(
              "text-sm font-semibold",
              highlighted ? "text-accent" : "text-accent-foreground"
            )}
          >
            {initials}
          </Text>
        )}
      </View>
      <View className="min-w-0 flex-1 flex-row items-center gap-2">
        <Text
          className={cn(
            "shrink font-medium",
            highlighted && "text-accent-foreground"
          )}
          numberOfLines={1}
        >
          {entry.name}
        </Text>
      </View>
      <View className="items-end">
        <View className="flex-row items-center gap-1">
          <Text
            className={cn(
              "text-sm font-semibold",
              highlighted && "text-accent-foreground"
            )}
          >
            {entry.hasanat.toLocaleString()}
          </Text>
          <Icon name="color.heart" size={14} />
        </View>
        <Text
          className={cn(
            "text-xs",
            highlighted ? "text-accent-foreground" : "text-muted"
          )}
        >
          hasanat
        </Text>
      </View>
    </View>
  );
}

function RankBadge({
  rank,
  highlighted,
}: {
  rank: number;
  highlighted: boolean;
}) {
  const rankColor = String(
    useCSSVariable(highlighted ? "--accent-foreground" : "--muted") ?? "#8a8a8a"
  );

  if (rank <= PODIUM_IMAGES.length) {
    return (
      <Image
        source={PODIUM_IMAGES[rank - 1]}
        contentFit="contain"
        style={{ height: 32, width: 32 }}
      />
    );
  }

  return (
    <View className="min-w-8 flex-row items-center justify-center gap-0.5 px-1">
      <Feather color={rankColor} name="hash" size={13} />
      <Text
        className={cn(
          "text-xs font-semibold",
          highlighted ? "text-accent-foreground" : "text-muted"
        )}
      >
        {rank}
      </Text>
    </View>
  );
}

function LeaderboardRowSkeleton({ nameWidth }: { nameWidth: string }) {
  return (
    <View className="border-border bg-surface flex-row items-center gap-3 rounded-2xl border px-3 py-3">
      <Skeleton className="size-8 rounded-full" />
      <Skeleton className="size-10 rounded-full" />
      <View className="min-w-0 flex-1 flex-row items-center gap-2">
        <Skeleton className={`h-4 rounded-full ${nameWidth}`} />
      </View>
      <View className="items-end">
        <Skeleton className="h-4 w-12 rounded-full" />
        <Skeleton className="h-3 w-14 rounded-full" />
      </View>
    </View>
  );
}

type LeaderboardEntry = {
  id: string;
  name: string;
  hasanat: number;
  imageUrl: string | null;
  isCurrentUser?: boolean;
};

const PODIUM_IMAGES = [
  require("~/../assets/images/1st-prize.png"),
  require("~/../assets/images/2nd-place.png"),
  require("~/../assets/images/3rd-place.png"),
];

const FIRST_NAMES = [
  "Aisha",
  "Omar",
  "Fatima",
  "Yusuf",
  "Maryam",
  "Ibrahim",
  "Zainab",
  "Hamza",
  "Khadija",
  "Bilal",
];

const LAST_NAMES = [
  "Rahman",
  "Khan",
  "Ahmed",
  "Hassan",
  "Ali",
  "Siddiqui",
  "Farooq",
  "Malik",
  "Hussain",
  "Qureshi",
];

const SKELETON_NAME_WIDTHS = [
  "w-1/2",
  "w-2/5",
  "w-3/5",
  "w-2/3",
  "w-1/3",
  "w-2/5",
  "w-1/2",
  "w-3/5",
];

const GLOBAL_ENTRIES: LeaderboardEntry[] = Array.from(
  { length: 100 },
  (_, index) => ({
    id: `global-${index + 1}`,
    name: `${FIRST_NAMES[index % FIRST_NAMES.length]} ${
      LAST_NAMES[Math.floor(index / FIRST_NAMES.length)]
    }`,
    hasanat: 28450 - index * 173,
    imageUrl: null,
  })
);

function rankEntries(entries: LeaderboardEntry[]) {
  return [...entries].sort((first, second) => second.hasanat - first.hasanat);
}
