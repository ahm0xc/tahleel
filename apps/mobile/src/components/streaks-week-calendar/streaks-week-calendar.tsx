import React from "react";

import { Ionicons } from "@expo/vector-icons";

import { Text, View } from "~/components/ui";
import {
  addDays,
  diffInDays,
  getWeekStart,
  todayInUTC,
  weekdayIndex,
} from "~/lib/days";
import { cn } from "~/lib/utils";
import { useStreaks } from "~/store/streaks-context";

const GRACE_DAYS = 2;
const WEEK_LENGTH = 7;

const WEEKDAY_LABELS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

type DayStatus = "completed" | "grace" | "missed" | "empty" | "upcoming";

type WeekDay = {
  day: string;
  isToday: boolean;
  status: DayStatus;
};

export function StreaksWeekCalendar() {
  const { userStreaks, todayProgress, streaksHistory: history } = useStreaks();

  const today = todayInUTC();
  const weekStart = getWeekStart(today);

  const completedDays = React.useMemo(() => {
    const completed = new Set<string>();
    for (const row of history ?? []) {
      if (row.completed) completed.add(row.day);
    }
    if (todayProgress?.completed) completed.add(today);
    return completed;
  }, [history, today, todayProgress?.completed]);

  const days = React.useMemo<WeekDay[]>(() => {
    const lastCompletedDay = userStreaks?.lastCompletedDay ?? null;
    const firstProgressDay = userStreaks?.firstProgressDay ?? null;

    return Array.from({ length: WEEK_LENGTH }, (_, index) => {
      const day = addDays(weekStart, index);

      return {
        day,
        isToday: day === today,
        status: getDayStatus(
          day,
          today,
          completedDays,
          lastCompletedDay,
          firstProgressDay
        ),
      };
    });
  }, [
    completedDays,
    today,
    userStreaks?.firstProgressDay,
    userStreaks?.lastCompletedDay,
    weekStart,
  ]);

  return (
    <View>
      <View className="flex-row items-center">
        {days.map((weekDay) => (
          <View key={weekDay.day} className="flex-1 items-center">
            <WeekdayLabel weekDay={weekDay} />
          </View>
        ))}
      </View>

      <View className="mt-1.5 flex-row items-center">
        {days.map((weekDay) => (
          <View key={weekDay.day} className="flex-1 items-center">
            <DayCircle isToday={weekDay.isToday} status={weekDay.status} />
          </View>
        ))}
      </View>
    </View>
  );
}

function WeekdayLabel({ weekDay }: { weekDay: WeekDay }) {
  return (
    <Text
      className={cn(
        "w-full text-center text-xs",
        weekDay.isToday ? "text-foreground font-semibold" : "text-muted"
      )}
    >
      {WEEKDAY_LABELS[weekdayIndex(weekDay.day)]}
    </Text>
  );
}

function DayCircle({
  isToday,
  status,
}: {
  isToday: boolean;
  status: DayStatus;
}) {
  if (isToday) {
    return (
      <View
        className={cn(
          "rounded-full border-2 p-0.5",
          status === "completed" ? "border-orange-500" : "border-border"
        )}
      >
        {status === "completed" ? (
          <FilledCircle className="bg-orange-500" icon="flame" />
        ) : (
          <View className="bg-surface size-9 rounded-full" />
        )}
      </View>
    );
  }

  switch (status) {
    case "completed":
      return <FilledCircle className="bg-orange-500" icon="flame" />;
    case "grace":
      return <FilledCircle className="bg-sky-500" icon="snow" />;
    case "missed":
      return <FilledCircle className="bg-red-500" icon="close" />;
    case "upcoming":
      return <View className="border-border/60 size-9 rounded-full border" />;
    default:
      return <View className="bg-muted/20 size-9 rounded-full" />;
  }
}

function FilledCircle({
  className,
  icon,
}: {
  className: string;
  icon: "flame" | "snow" | "close";
}) {
  return (
    <View
      className={cn(
        "size-9 items-center justify-center rounded-full",
        className
      )}
    >
      <Ionicons color="white" name={icon} size={18} />
    </View>
  );
}

function getDayStatus(
  day: string,
  today: string,
  completedDays: Set<string>,
  lastCompletedDay: string | null,
  firstProgressDay: string | null
): DayStatus {
  if (completedDays.has(day)) return "completed";

  if (day > today) return "upcoming";

  if (day === today) return "empty";

  // Days before the user's first progress report were never a chance to
  // complete, so they must not count as missed.
  if (firstProgressDay !== null && day < firstProgressDay) return "empty";

  if (lastCompletedDay === null) return "empty";

  if (
    day > lastCompletedDay &&
    diffInDays(lastCompletedDay, day) <= GRACE_DAYS
  ) {
    return "grace";
  }

  return "missed";
}
