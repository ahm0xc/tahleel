import { Ionicons } from "@expo/vector-icons";

import { Text, View } from "~/components/ui";

type StatsGridProps = {
  hasanat: number;
  versesRead: number;
  timeSpent: number;
  isLoading?: boolean;
};

export function StatsGrid({
  hasanat,
  versesRead,
  timeSpent,
  isLoading = false,
}: StatsGridProps) {
  return (
    <View>
      <View className="mb-4 flex-row items-end justify-between">
        <View>
          <Text className="text-2xl font-semibold">Today’s progress</Text>
          <Text className="text-muted mt-1 text-sm">Every verse adds up</Text>
        </View>
      </View>

      <View className="bg-surface border-border rounded-3xl border p-5">
        <View className="flex-row items-center justify-between">
          <View>
            <Text className="text-muted text-sm">Hasanat today</Text>
            <View className="mt-2 flex-row items-end gap-2">
              <Text className="text-3xl font-semibold tracking-tight">
                {isLoading ? "—" : hasanat.toLocaleString()}
              </Text>
              <Text className="text-muted mb-1 text-sm">hasanat</Text>
            </View>
          </View>
          <View className="h-11 w-11 items-center justify-center rounded-2xl bg-[#E8F4EC] dark:bg-[#25392F]">
            <Ionicons color="#4D9A6C" name="sparkles" size={20} />
          </View>
        </View>
      </View>

      <View className="mt-3 flex-row gap-3">
        <View className="bg-surface border-border min-h-36 flex-1 justify-between rounded-3xl border p-4">
          <View className="h-10 w-10 items-center justify-center rounded-2xl bg-[#EEF2FF] dark:bg-[#30354A]">
            <Ionicons color="#6577D8" name="book-outline" size={20} />
          </View>
          <View>
            <Text className="text-2xl font-semibold">
              {isLoading ? "—" : versesRead.toLocaleString()}
            </Text>
            <Text className="text-muted mt-1 text-sm">Verses read</Text>
          </View>
        </View>

        <View className="bg-surface border-border min-h-36 flex-1 justify-between rounded-3xl border p-4">
          <View className="h-10 w-10 items-center justify-center rounded-2xl bg-[#FFF3E7] dark:bg-[#45382D]">
            <Ionicons color="#D18B4A" name="time-outline" size={20} />
          </View>
          <View>
            <Text className="text-2xl font-semibold">
              {isLoading ? "—" : formatDuration(timeSpent)}
            </Text>
            <Text className="text-muted mt-1 text-sm">Time spent</Text>
          </View>
        </View>
      </View>
    </View>
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
