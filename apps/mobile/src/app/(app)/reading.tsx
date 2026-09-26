import React from "react";

import { FlatList, type ViewToken } from "react-native";

import Feather from "@expo/vector-icons/Feather";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { PressableFeedback } from "heroui-native";
import { useCSSVariable } from "uniwind";

import { ChapterSelect, VersePage } from "~/components/quran";
import { View } from "~/components/ui";
import { getEnglishChapter } from "~/lib/quran/english-edition";
import { cn } from "~/lib/utils";
import { type ReadingView, useReadingState } from "~/store/reading-state-store";

const viewabilityConfig = { itemVisiblePercentThreshold: 50 };

export default function ReadingScreen() {
  const chapterNumber = useReadingState((state) => state.chapterNumber);
  const verseNumber = useReadingState((state) => state.verseNumber);
  const view = useReadingState((state) => state.view);
  const setVerseNumber = useReadingState((state) => state.setVerseNumber);
  const setView = useReadingState((state) => state.setView);
  const [containerHeight, setContainerHeight] = React.useState(0);
  const [containerWidth, setContainerWidth] = React.useState(0);
  const hasRestoredRef = React.useRef(false);

  const verses = React.useMemo(
    () => getEnglishChapter(chapterNumber),
    [chapterNumber]
  );

  const initialScrollIndex = React.useMemo(
    () =>
      Math.min(Math.max(verseNumber - 1, 0), Math.max(verses.length - 1, 0)),
    [verseNumber, verses.length]
  );

  const onViewableItemsChanged = React.useCallback(
    ({ viewableItems }: { viewableItems: ViewToken[] }) => {
      if (!hasRestoredRef.current) {
        hasRestoredRef.current = true;
        return;
      }

      const [first] = viewableItems;

      if (first?.index != null) {
        setVerseNumber(first.index + 1);
      }
    },
    [setVerseNumber]
  );

  function toggleView() {
    setView(view === "default" ? "favorites" : "default");
  }

  return (
    <View className="bg-background flex-1">
      <Header view={view} toggleView={toggleView} />

      <View
        className="flex-1"
        onLayout={(event) => {
          const { height, width } = event.nativeEvent.layout;
          setContainerHeight(height);
          setContainerWidth(width);
        }}
      >
        {containerHeight > 0 && containerWidth > 0 && (
          <FlatList
            key={chapterNumber}
            data={verses}
            initialScrollIndex={initialScrollIndex}
            keyExtractor={(item) => String(item.verse)}
            renderItem={({ item }) => (
              <VersePage
                key={item.verse}
                chapterNumber={chapterNumber}
                verse={item}
                height={containerHeight}
                width={containerWidth}
              />
            )}
            getItemLayout={(_, index) => ({
              length: containerHeight,
              offset: containerHeight * index,
              index,
            })}
            onViewableItemsChanged={onViewableItemsChanged}
            viewabilityConfig={viewabilityConfig}
            pagingEnabled={true}
            snapToInterval={containerHeight}
            snapToAlignment="start"
            decelerationRate="fast"
            showsVerticalScrollIndicator={false}
            disableIntervalMomentum={true}
            removeClippedSubviews={false}
          />
        )}
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
          <ChapterSelect />
        </View>
      </View>
    </View>
  );
}
