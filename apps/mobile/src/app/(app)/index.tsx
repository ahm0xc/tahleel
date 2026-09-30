import { Card } from "heroui-native";

import { StreaksBadge } from "~/components/streaks-badge";
import { Button, ButtonLabel, Image, View } from "~/components/ui";

export default function HomeScreen() {
  return (
    <View className="bg-background flex-1">
      <Header />

      <View className="px-safe-offset-4 pt-6">
        <GoalCard />
      </View>
    </View>
  );
}

function Header() {
  return (
    <View className="pt-safe-offset-2 px-safe-offset-4 flex-row items-center justify-between py-3">
      <Image
        source={require("~/../assets/images/app-icon.png")}
        contentFit="cover"
        style={{ height: 32, width: 32, borderRadius: 8 }}
      />

      <StreaksBadge />
    </View>
  );
}

interface GoalCardProps {}

function GoalCard({}: GoalCardProps) {
  return (
    <Card className="rounded-4xl">
      <Card.Header>
        <Card.Title className="text-2xl">Goal</Card.Title>
        <Card.Description>0/5 Verses Today</Card.Description>
      </Card.Header>
      <Card.Body className="pt-4">
        <View className="bg-default h-2.5 rounded-full">
          <View
            style={{ width: "50%" }}
            className="bg-accent h-full w-full rounded-full"
          />
        </View>
      </Card.Body>
      <Card.Footer className="pt-4">
        <Button>
          <ButtonLabel>Start Reading</ButtonLabel>
        </Button>
      </Card.Footer>
    </Card>
  );
}
