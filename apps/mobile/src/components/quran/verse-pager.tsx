import React from "react";

import { FlatList, type ViewToken } from "react-native";

import { View } from "~/components/ui";
import { type EnglishVerse } from "~/lib/quran/english-edition";

import { VersePage } from "./verse-page";

const viewabilityConfig = { itemVisiblePercentThreshold: 50 };

export interface PagedVerse {
  key: string;
  chapterNumber: number;
  verse: EnglishVerse;
}

interface VersePagerProps {
  verses: PagedVerse[];
  listKey: string;
  initialIndex: number;
  onPageChange?: (index: number) => void;
}

export function VersePager({
  verses,
  listKey,
  initialIndex,
  onPageChange,
}: VersePagerProps) {
  const listRef = React.useRef<FlatList<PagedVerse>>(null);
  const activeIndexRef = React.useRef(initialIndex);
  const hasRestoredRef = React.useRef(false);
  const listKeyRef = React.useRef(listKey);
  const pageCountRef = React.useRef(verses.length);
  const onPageChangeRef = React.useRef(onPageChange);
  const [containerHeight, setContainerHeight] = React.useState(0);
  const [containerWidth, setContainerWidth] = React.useState(0);

  React.useEffect(() => {
    onPageChangeRef.current = onPageChange;
  }, [onPageChange]);

  React.useEffect(() => {
    const isNewList = listKeyRef.current !== listKey;

    if (isNewList) {
      hasRestoredRef.current = false;
      listKeyRef.current = listKey;
    }

    const previousCount = pageCountRef.current;
    pageCountRef.current = verses.length;

    if (
      isNewList ||
      containerHeight === 0 ||
      verses.length === 0 ||
      verses.length >= previousCount
    ) {
      return;
    }

    const index = Math.min(activeIndexRef.current, verses.length - 1);

    activeIndexRef.current = index;
    listRef.current?.scrollToOffset({
      offset: index * containerHeight,
      animated: false,
    });
  }, [containerHeight, listKey, verses.length]);

  const onViewableItemsChanged = React.useCallback(
    ({ viewableItems }: { viewableItems: ViewToken[] }) => {
      if (!hasRestoredRef.current) {
        hasRestoredRef.current = true;
        return;
      }

      const [first] = viewableItems;

      if (first?.index != null) {
        activeIndexRef.current = first.index;
        onPageChangeRef.current?.(first.index);
      }
    },
    []
  );

  return (
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
          ref={listRef}
          key={listKey}
          data={verses}
          initialScrollIndex={initialIndex}
          keyExtractor={(item) => item.key}
          renderItem={({ item }) => (
            <VersePage
              chapterNumber={item.chapterNumber}
              verse={item.verse}
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
  );
}
