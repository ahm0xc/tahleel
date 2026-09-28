import { Ionicons } from "@expo/vector-icons";
import { Card } from "heroui-native";

import { Button, ButtonLabel, Image, Text, View } from "~/components/ui";
import { api } from "~/trpc/client";

export default function HomeScreen() {
  const { data } = api.example.hello.useQuery({ text: "Ahmed" });

  console.log({ data });

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

      <StreakBadge days={7} />
    </View>
  );
}

function StreakBadge({ days }: { days: number }) {
  return (
    <View className="flex-row items-center gap-1.5 rounded-full border border-orange-200 bg-orange-100/80 py-1.5 pr-3 pl-2 dark:border-orange-500/30 dark:bg-orange-500/15">
      <Ionicons color="#F79009" name="flame" size={20} />
      <Text className="text-foreground text-sm font-semibold">{days}</Text>
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
