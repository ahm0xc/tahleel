import React from "react";

import { FlatList, type ViewToken } from "react-native";

import { View } from "~/components/ui";
import { type ArabicScript } from "~/constants/scripts";
import { type QuranVerse } from "~/lib/quran/edition-data";
import { useRecitation } from "~/store/recitation-store";

import { ChapterAdvancePage } from "./chapter-advance-page";
import { VersePage } from "./verse-page";

const viewabilityConfig = { itemVisiblePercentThreshold: 50 };

export interface PagedVerse {
  key: string;
  chapterNumber: number;
  verse: QuranVerse | null;
}

interface VersePagerProps {
  script: ArabicScript;
  fontSize: number;
  verses: PagedVerse[];
  listKey: string;
  initialIndex: number;
  onPageChange?: (index: number) => void;
  onUserScroll?: () => void;
}

export function VersePager({
  script,
  fontSize,
  verses,
  listKey,
  initialIndex,
  onPageChange,
  onUserScroll,
}: VersePagerProps) {
  const listRef = React.useRef<FlatList<PagedVerse>>(null);
  const activeIndexRef = React.useRef(initialIndex);
  const hasRestoredRef = React.useRef(false);
  const listKeyRef = React.useRef(listKey);
  const pageCountRef = React.useRef(verses.length);
  const onPageChangeRef = React.useRef(onPageChange);
  const followToken = useRecitation((state) => state.followToken);
  const followTarget = useRecitation((state) => state.followTarget);
  const handledFollowTokenRef = React.useRef(followToken);
  const [containerHeight, setContainerHeight] = React.useState(0);
  const [containerWidth, setContainerWidth] = React.useState(0);
  const [activeIndex, setActiveIndex] = React.useState(initialIndex);

  React.useLayoutEffect(() => {
    if (handledFollowTokenRef.current === followToken) {
      return;
    }

    if (followTarget === null) {
      handledFollowTokenRef.current = followToken;
      return;
    }

    if (containerHeight === 0) {
      return;
    }

    handledFollowTokenRef.current = followToken;

    const index = verses.findIndex(
      (page) =>
        page.chapterNumber === followTarget.chapterNumber &&
        page.verse?.verse === followTarget.verseNumber
    );

    if (index < 0) {
      return;
    }

    listRef.current?.scrollToOffset({
      offset: index * containerHeight,
      animated: true,
    });
  }, [containerHeight, followTarget, followToken, verses]);

  React.useEffect(() => {
    setActiveIndex(initialIndex);
  }, [initialIndex]);

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
        setActiveIndex(first.index);
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
          // The verse text is set by props rather than the data, so a font
          // change leaves `data` untouched and the mounted rows would otherwise
          // keep rendering at the size they were built with. Folding this into
          // `listKey` instead would remount the list and lose the reader's
          // place, so the list is re-rendered rather than rebuilt.
          extraData={`${script.id}:${fontSize}`}
          renderItem={({ item, index }) =>
            item.verse === null ? (
              <ChapterAdvancePage height={containerHeight} />
            ) : (
              <VersePage
                chapterNumber={item.chapterNumber}
                fontSize={fontSize}
                isActive={index === activeIndex}
                script={script}
                verse={item.verse}
                height={containerHeight}
                width={containerWidth}
              />
            )
          }
          getItemLayout={(_, index) => ({
            length: containerHeight,
            offset: containerHeight * index,
            index,
          })}
          onViewableItemsChanged={onViewableItemsChanged}
          onScrollBeginDrag={onUserScroll}
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
