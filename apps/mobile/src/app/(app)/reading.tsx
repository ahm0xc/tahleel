import React from "react";

import { FlatList } from "react-native";

import Feather from "@expo/vector-icons/Feather";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { PressableFeedback } from "heroui-native";
import { useCSSVariable } from "uniwind";

import { SurahSelect } from "~/components/quran";
import { Text, View } from "~/components/ui";
import { cn } from "~/lib/utils";

type ReadingView = "default" | "favorites";

export default function ReadingScreen() {
  const [view, setView] = React.useState<ReadingView>("default");
  const [containerHeight, setContainerHeight] = React.useState(0);

  function toggleView() {
    setView(view === "default" ? "favorites" : "default");
  }

  return (
    <View className="bg-background flex-1">
      <Header view={view} toggleView={toggleView} />

      <View
        className="flex-1"
        onLayout={(event) => {
          const { height } = event.nativeEvent.layout;
          setContainerHeight(height);
        }}
      >
        <FlatList
          data={[{ id: "hello" }, { id: "hi" }, { id: "bye" }]}
          renderItem={({ item }) => (
            <View
              style={{
                height: containerHeight,
                justifyContent: "center",
                alignItems: "center",
              }}
            >
              <Text>{item.id}</Text>
            </View>
          )}
          keyExtractor={(item) => item.id}
          pagingEnabled={true}
          snapToInterval={containerHeight}
          snapToAlignment="start"
          decelerationRate="fast"
          showsVerticalScrollIndicator={false}
          disableIntervalMomentum={true} // <- key for TikTok-feel, stops it skipping 2+ pages on fast flicks
        />
      </View>
    </View>
  );
}

function Header({
  view,
  toggleView,
}: {
  view: ReadingView;
  toggleView: () => void;
}) {
  const foregroundColor = useCSSVariable("--foreground") as string;
  const mutedColor = useCSSVariable("--muted") as string;

  return (
    <View className="pt-safe-offset-2 px-safe-offset-4 absolute top-0 left-0 z-10 w-full">
      <View className="flex-row items-center justify-between">
        <View>
          <PressableFeedback
            className="bg-default/70 flex-row items-center rounded-full p-1"
            onPress={toggleView}
          >
            <View
              className={cn(
                "size-7 flex-row items-center justify-center",
                view === "default" && "bg-foreground/5 rounded-full"
              )}
            >
              <Feather
                name="book-open"
                size={16}
                color={view === "default" ? foregroundColor : mutedColor}
              />
            </View>
            <View
              className={cn(
                "size-7 flex-row items-center justify-center",
                view === "favorites" && "bg-foreground/5 rounded-full"
              )}
            >
              <MaterialIcons
                name="favorite-outline"
                size={16}
                color={view === "favorites" ? foregroundColor : mutedColor}
              />
            </View>
          </PressableFeedback>
        </View>

        <View>
          <SurahSelect />
        </View>
      </View>
    </View>
  );
}
