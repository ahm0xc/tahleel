import { useState } from "react";

import { ScrollView } from "react-native";

import { useUser } from "@clerk/expo";
import AntDesign from "@expo/vector-icons/AntDesign";
import Feather from "@expo/vector-icons/Feather";
import { Tabs } from "heroui-native";
import { useCSSVariable } from "uniwind";

import { Button, Text, View } from "~/components/ui";
import { useStreaks } from "~/store/streaks-context";

export default function LeaderboardScreen() {
  const [scope, setScope] = useState("friends");

  const { user } = useUser();
  const { todayProgress } = useStreaks();
  const currentUserEntry: LeaderboardEntry | null = user
    ? {
        id: user.id,
        name:
          user.fullName ||
          [user.firstName, user.lastName].filter(Boolean).join(" ") ||
          user.username ||
          "You",
        hasanat: todayProgress?.hasanatEarned ?? 0,
        isCurrentUser: true,
      }
    : null;
  const friendsEntries = rankEntries([
    ...FRIEND_ENTRIES,
    ...(currentUserEntry ? [currentUserEntry] : []),
  ]);
  const globalEntries = rankEntries([
    ...GLOBAL_ENTRIES,
    ...(currentUserEntry ? [currentUserEntry] : []),
  ]);
  const entries = scope === "friends" ? friendsEntries : globalEntries;

  return (
    <View className="bg-background flex-1">
      <Header />
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
        <View className="flex-row items-center justify-between px-1 pb-1">
          <Text className="text-muted text-xs font-semibold tracking-wider uppercase">
            Ranked by daily hasanat
          </Text>
          <Text className="text-muted text-xs">
            {entries.length} {scope === "friends" ? "people" : "readers"}
          </Text>
        </View>
        {entries.map((entry, index) => (
          <LeaderboardRow key={entry.id} entry={entry} rank={index + 1} />
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
            size="md"
            variant="ghost"
          >
            <Feather color={foregroundColor} name="users" size={22} />
          </Button>
          <Button
            accessibilityLabel="Add friend"
            isIconOnly
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
}: {
  entry: LeaderboardEntry;
  rank: number;
}) {
  const initials = entry.name
    .split(" ")
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase();

  return (
    <View className="border-border bg-surface flex-row items-center gap-3 rounded-2xl border px-3 py-3">
      <View
        className={
          rank === 1
            ? "bg-accent size-8 items-center justify-center rounded-full"
            : "bg-default size-8 items-center justify-center rounded-full"
        }
      >
        <Text
          className={
            rank === 1
              ? "text-accent-foreground text-xs font-semibold"
              : "text-muted text-xs font-semibold"
          }
        >
          {rank}
        </Text>
      </View>
      <View className="bg-default size-10 items-center justify-center rounded-full">
        <Text className="text-sm font-semibold">{initials}</Text>
      </View>
      <View className="min-w-0 flex-1 flex-row items-center gap-2">
        <Text className="shrink font-medium" numberOfLines={1}>
          {entry.name}
        </Text>
        {entry.isCurrentUser && (
          <Text className="text-accent text-[10px] font-semibold">YOU</Text>
        )}
      </View>
      <View className="items-end">
        <Text className="text-sm font-semibold">
          {entry.hasanat.toLocaleString()}
        </Text>
        <Text className="text-muted text-xs">hasanat</Text>
      </View>
    </View>
  );
}

type LeaderboardEntry = {
  id: string;
  name: string;
  hasanat: number;
  isCurrentUser?: boolean;
};

const FRIEND_ENTRIES: LeaderboardEntry[] = [
  { id: "friend-aisha", name: "Aisha Rahman", hasanat: 18240 },
  { id: "friend-omar", name: "Omar Farooq", hasanat: 16375 },
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

const GLOBAL_ENTRIES: LeaderboardEntry[] = Array.from(
  { length: 100 },
  (_, index) => ({
    id: `global-${index + 1}`,
    name: `${FIRST_NAMES[index % FIRST_NAMES.length]} ${
      LAST_NAMES[Math.floor(index / FIRST_NAMES.length)]
    }`,
    hasanat: 28450 - index * 173,
  })
);

function rankEntries(entries: LeaderboardEntry[]) {
  return [...entries].sort((first, second) => second.hasanat - first.hasanat);
}
