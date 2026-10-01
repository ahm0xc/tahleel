import { ScrollView } from "react-native";

import { router } from "expo-router";
import { Card } from "heroui-native";

import { StatsGrid } from "~/components/stats-grid";
import { StreaksBadge } from "~/components/streaks-badge";
import { StreaksWeekCalendar } from "~/components/streaks-week-calendar";
import { Button, ButtonLabel, Image, Text, View } from "~/components/ui";
import { useStreaks } from "~/store/streaks-context";

export default function HomeScreen() {
  const { todayProgress, userStreaksPending } = useStreaks();

  return (
    <View className="bg-background flex-1">
      <Header />

      <ScrollView
        className="flex-1"
        contentContainerClassName="px-safe-offset-4 pb-8"
      >
        <View className="mt-6">
          <StreaksWeekCalendar />
        </View>
        <View className="mt-6">
          <GoalCard
            todayProgress={todayProgress}
            userStreaksPending={userStreaksPending}
          />
        </View>
        <View className="mt-6">
          <StatsGrid
            hasanat={todayProgress?.hasanatEarned ?? 0}
            versesRead={todayProgress?.versesRead ?? 0}
            timeSpent={todayProgress?.timeSpent ?? 0}
            isLoading={userStreaksPending}
          />
        </View>
      </ScrollView>
    </View>
  );
}

function Header() {
  return (
    <View className="pt-safe-offset-2 px-safe-offset-4 flex-row items-center justify-between py-3">
      <Image
        source={require("~/../assets/images/logo-long.png")}
        contentFit="cover"
        style={{ height: 32, width: (609 / 174) * 32, borderRadius: 8 }}
      />

      <StreaksBadge />
    </View>
  );
}

type GoalCardProps = {
  todayProgress: ReturnType<typeof useStreaks>["todayProgress"];
  userStreaksPending: boolean;
};

function GoalCard({ todayProgress, userStreaksPending }: GoalCardProps) {
  const versesRead = todayProgress?.versesRead ?? 0;
  const goal = todayProgress?.goalSnapshot ?? 0;
  const hasanatEarned = todayProgress?.hasanatEarned ?? 0;
  const timeSpent = todayProgress?.timeSpent ?? 0;
  const isCompleted = todayProgress?.completed ?? false;

  const progress = goal > 0 ? Math.min(versesRead / goal, 1) : 0;

  return (
    <Card className="rounded-4xl">
      <Card.Header>
        <Card.Title className="text-2xl">Goal</Card.Title>
        <Card.Description>
          {userStreaksPending
            ? "Loading…"
            : `${versesRead}/${goal} Verses Today`}
        </Card.Description>
      </Card.Header>
      <Card.Body className="pt-4">
        <View className="bg-default h-2.5 overflow-hidden rounded-full">
          <View
            style={{ width: `${progress * 100}%` }}
            className="bg-accent h-full rounded-full"
          />
        </View>
      </Card.Body>
      <Card.Footer className="pt-4">
        {todayProgress !== null && (
          <View className="mb-3 flex-row items-center justify-between">
            <Text className="text-muted text-sm">+{hasanatEarned} hasanat</Text>
            <Text className="text-muted text-sm">
              {formatDuration(timeSpent)}
            </Text>
          </View>
        )}

        <Button onPress={() => router.push("/reading")}>
          <ButtonLabel>
            {isCompleted ? "Keep Reading" : "Start Reading"}
          </ButtonLabel>
        </Button>
      </Card.Footer>
    </Card>
  );
}

function formatDuration(totalSeconds: number): string {
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);

  if (hours > 0) {
    return `${hours}h ${minutes}m`;
  }

  if (minutes > 0) {
    return `${minutes}m`;
  }

  return `${totalSeconds}s`;
}
