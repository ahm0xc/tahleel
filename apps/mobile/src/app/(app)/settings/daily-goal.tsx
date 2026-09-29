import { ScrollView } from "react-native";

import { SettingsOptionGrid } from "~/components/settings";
import { DAILY_VERSE_GOALS } from "~/constants/goals";
import { usePreferences } from "~/store/preferences-store";

export default function DailyGoalScreen() {
  const dailyVerseGoal = usePreferences((state) => state.dailyVerseGoal);
  const setDailyVerseGoal = usePreferences((state) => state.setDailyVerseGoal);

  return (
    <ScrollView
      className="bg-background flex-1"
      contentContainerClassName="pb-safe-offset-6"
    >
      <SettingsOptionGrid
        title="Verses per day"
        options={DAILY_VERSE_GOALS.map((goal) => ({
          value: goal,
          label: String(goal),
        }))}
        value={dailyVerseGoal}
        onChange={setDailyVerseGoal}
      />
    </ScrollView>
  );
}
