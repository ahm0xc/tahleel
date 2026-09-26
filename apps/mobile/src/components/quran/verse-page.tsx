import React from "react";

import {
  FlatList,
  type NativeSyntheticEvent,
  type TextLayoutEventData,
} from "react-native";

import Feather from "@expo/vector-icons/Feather";
import { useCSSVariable } from "uniwind";

import { Text, View } from "~/components/ui";
import { CHAPTERS, getChapter } from "~/constants/chapters";
import { triggerHaptic } from "~/lib/haptics";
import { type EnglishVerse } from "~/lib/quran/english-edition";
import {
  CHUNKING_VERSION,
  MAX_LINES_PER_CHUNK,
  chunkVerseText,
} from "~/lib/quran/verse-chunks";

const VERSE_TEXT_CLASS_NAME = "text-center text-xl leading-relaxed";

const CHEVRON_SIZE = 22;

const chunkCache = new Map<string, string[]>();

function cacheKey(chapterNumber: number, verseNumber: number, width: number) {
  return `${CHUNKING_VERSION}:${chapterNumber}:${verseNumber}:${Math.round(width)}`;
}

export function VersePage({
  chapterNumber,
  verse,
  height,
  width,
}: {
  chapterNumber: number;
  verse: EnglishVerse;
  height: number;
  width: number;
}) {
  const [chunks, setChunks] = React.useState<string[] | null>(() => {
    const cached =
      width > 0
        ? chunkCache.get(cacheKey(chapterNumber, verse.verse, width))
        : undefined;

    return cached && cached.length > 1 ? cached : null;
  });
  const chapter = getChapter(chapterNumber) ?? CHAPTERS[0];
  const foregroundColor = useCSSVariable("--foreground") as string;
  const [contentWidth, setContentWidth] = React.useState(0);
  const [activeChunk, setActiveChunk] = React.useState(0);
  const activeChunkRef = React.useRef(0);
  const isDraggingRef = React.useRef(false);
  const hasTickedRef = React.useRef(false);

  function commit(index: number) {
    if (index === activeChunkRef.current) {
      return;
    }

    activeChunkRef.current = index;
    setActiveChunk(index);
    triggerHaptic("Light");
  }

  function indexAtOffset(offsetX: number) {
    return contentWidth === 0 ? 0 : Math.round(offsetX / contentWidth);
  }

  function handleScrollBeginDrag() {
    isDraggingRef.current = true;
    hasTickedRef.current = false;
  }

  function handleScrollEndDrag() {
    isDraggingRef.current = false;
  }

  function handleScroll(offsetX: number) {
    if (isDraggingRef.current || hasTickedRef.current) {
      return;
    }

    const next = indexAtOffset(offsetX);

    if (next === activeChunkRef.current) {
      return;
    }

    // One tick per swipe, so a snap that overshoots and returns cannot tick
    // twice.
    hasTickedRef.current = true;
    commit(next);
  }

  function handleMomentumScrollEnd(offsetX: number) {
    hasTickedRef.current = false;

    // Silently correct a snap that overshot past the halfway mark and then
    // settled back, rather than paying for a second tick.
    const settled = indexAtOffset(offsetX);

    if (settled !== activeChunkRef.current) {
      activeChunkRef.current = settled;
      setActiveChunk(settled);
    }
  }

  function handleTextLayout(event: NativeSyntheticEvent<TextLayoutEventData>) {
    const { lines } = event.nativeEvent;

    if (lines.length <= MAX_LINES_PER_CHUNK) {
      return;
    }

    const split = chunkVerseText(verse.text, lines, MAX_LINES_PER_CHUNK);

    if (split.length <= 1) {
      return;
    }

    chunkCache.set(cacheKey(chapterNumber, verse.verse, width), split);
    setChunks(split);
  }

  return (
    <View
      className="px-safe-offset-6 pt-safe-offset-12 pb-safe-offset-4 justify-center"
      style={{ height }}
    >
      <View
        className="w-full"
        onLayout={(event) => setContentWidth(event.nativeEvent.layout.width)}
      >
        {chunks === null ? (
          <>
            <Text className={VERSE_TEXT_CLASS_NAME}>{verse.text}</Text>

            <Text
              accessibilityElementsHidden={true}
              className={VERSE_TEXT_CLASS_NAME}
              importantForAccessibility="no-hide-descendants"
              onTextLayout={handleTextLayout}
              pointerEvents="none"
              style={{
                position: "absolute",
                top: 0,
                left: 0,
                right: 0,
                opacity: 0,
              }}
            >
              {verse.text}
            </Text>
          </>
        ) : (
          <FlatList
            data={chunks}
            horizontal={true}
            keyExtractor={(_, index) => `${verse.verse}:${index}`}
            getItemLayout={(_, index) => ({
              length: contentWidth,
              offset: contentWidth * index,
              index,
            })}
            onScroll={(event) => {
              handleScroll(event.nativeEvent.contentOffset.x);
            }}
            onScrollBeginDrag={handleScrollBeginDrag}
            onScrollEndDrag={handleScrollEndDrag}
            onMomentumScrollEnd={(event) => {
              handleMomentumScrollEnd(event.nativeEvent.contentOffset.x);
            }}
            scrollEventThrottle={16}
            renderItem={({ item }) => (
              <Text
                className={VERSE_TEXT_CLASS_NAME}
                style={{ width: contentWidth }}
              >
                {item}
              </Text>
            )}
            contentContainerStyle={{ alignItems: "flex-start" }}
            pagingEnabled={true}
            snapToInterval={contentWidth}
            snapToAlignment="start"
            decelerationRate="fast"
            disableIntervalMomentum={true}
            nestedScrollEnabled={true}
            removeClippedSubviews={false}
            showsHorizontalScrollIndicator={false}
            bounces={false}
          />
        )}
      </View>

      <Text className="text-muted mt-5 text-center text-sm">
        {`Verse ${verse.verse} of ${chapter.name}`}
      </Text>

      {chunks !== null && (
        <View className="mt-5 flex-row items-center justify-center">
          <Feather
            name="chevron-left"
            size={CHEVRON_SIZE}
            color={foregroundColor}
          />

          {chunks.map((_, index) => (
            <View
              key={index}
              className={
                index === activeChunk
                  ? "bg-foreground/60 mx-0.5 h-1.5 w-5 rounded-full"
                  : "bg-foreground/20 mx-0.5 h-1.5 w-2 rounded-full"
              }
            />
          ))}

          <Feather
            name="chevron-right"
            size={CHEVRON_SIZE}
            color={foregroundColor}
          />
        </View>
      )}
    </View>
  );
}
