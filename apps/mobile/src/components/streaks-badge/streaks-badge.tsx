import { Ionicons } from "@expo/vector-icons";
import { useCSSVariable } from "uniwind";

import { Text, View } from "~/components/ui";
import { cn } from "~/lib/utils";
import { useStreaks } from "~/store/streaks-context";

const FLAME_COLOR = "#F79009";

export function StreaksBadge() {
  const { userStreaks: data, userStreaksPending: isPending } = useStreaks();
  const mutedColor = useCSSVariable("--muted") as string;

  const days = data?.currentStreak ?? 0;
  const isActive = !isPending && (data?.isAlive ?? false) && days > 0;

  return (
    <View
      className={cn(
        "flex-row items-center gap-1.5 rounded-full border py-1.5 pr-3 pl-2",
        isActive
          ? "border-orange-200 bg-orange-100/80 dark:border-orange-500/30 dark:bg-orange-500/15"
          : "border-border bg-surface"
      )}
    >
      <Ionicons
        color={isActive ? FLAME_COLOR : mutedColor}
        name="flame"
        size={20}
      />
      <Text
        className={cn(
          "text-sm font-semibold",
          isActive ? "text-foreground" : "text-muted"
        )}
      >
        {days}
      </Text>
    </View>
  );
}
