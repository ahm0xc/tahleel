import React from "react";

import {
  type AccessibilityState,
  FlatList,
  type NativeSyntheticEvent,
  Pressable,
  type TextLayoutEventData,
} from "react-native";

import Feather from "@expo/vector-icons/Feather";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { useCSSVariable } from "uniwind";

import { Text, View } from "~/components/ui";
import { CHAPTERS, type Chapter, getChapter } from "~/constants/chapters";
import { triggerHaptic } from "~/lib/haptics";
import { type EnglishVerse } from "~/lib/quran/english-edition";
import { shareVerse } from "~/lib/quran/share";
import {
  CHUNKING_VERSION,
  MAX_LINES_PER_CHUNK,
  chunkVerseText,
} from "~/lib/quran/verse-chunks";
import { cn } from "~/lib/utils";
import { useFavorite } from "~/store/favorite-store";

import { VerseImageCapture } from "./verse-image-capture";

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
  const [contentWidth, setContentWidth] = React.useState(0);
  const [activeChunk, setActiveChunk] = React.useState(0);
  const activeChunkRef = React.useRef(0);
  const isDraggingRef = React.useRef(false);
  const hasTickedRef = React.useRef(false);
  const isProgrammaticRef = React.useRef(false);
  const chunkListRef = React.useRef<FlatList<string>>(null);
  const [captureRequest, setCaptureRequest] = React.useState(0);

  function commit(index: number) {
    if (index === activeChunkRef.current) {
      return;
    }

    activeChunkRef.current = index;
    setActiveChunk(index);
    triggerHaptic("Light");
  }

  function indexAtOffset(offsetX: number) {
    if (contentWidth === 0 || chunks === null) {
      return 0;
    }

    return Math.min(
      Math.max(Math.round(offsetX / contentWidth), 0),
      chunks.length - 1
    );
  }

  function goToChunk(offset: number) {
    if (chunks === null) {
      return;
    }

    const next = Math.min(
      Math.max(activeChunkRef.current + offset, 0),
      chunks.length - 1
    );

    if (next === activeChunkRef.current) {
      return;
    }

    // Commit before scrolling: the scroll events a chevron press produces would
    // otherwise tick back to the chunk being left, fighting the animation.
    isProgrammaticRef.current = true;
    commit(next);
    chunkListRef.current?.scrollToIndex({ index: next, animated: true });
  }

  function handleScrollBeginDrag() {
    isDraggingRef.current = true;
    isProgrammaticRef.current = false;
    hasTickedRef.current = false;
  }

  function handleScrollEndDrag() {
    isDraggingRef.current = false;
  }

  function handleScroll(offsetX: number) {
    const next = indexAtOffset(offsetX);

    if (isProgrammaticRef.current) {
      // A chevron press already committed the chunk it is heading for, so only
      // the event that lands on it may lift the guard.
      if (next === activeChunkRef.current) {
        isProgrammaticRef.current = false;
      }

      return;
    }

    if (isDraggingRef.current || hasTickedRef.current) {
      return;
    }

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
    isProgrammaticRef.current = false;

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
      <VerseActions
        chapter={chapter}
        verse={verse}
        onCapture={() => {
          setCaptureRequest((request) => request + 1);
        }}
      />

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
            ref={chunkListRef}
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
          <ChunkNav
            direction="left"
            disabled={activeChunk === 0}
            onPress={() => {
              goToChunk(-1);
            }}
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

          <ChunkNav
            direction="right"
            disabled={activeChunk === chunks.length - 1}
            onPress={() => {
              goToChunk(1);
            }}
          />
        </View>
      )}

      <VerseImageCapture
        chapter={chapter}
        request={captureRequest}
        verse={verse}
        width={width}
      />
    </View>
  );
}

function ChunkNav({
  direction,
  disabled,
  onPress,
}: {
  direction: "left" | "right";
  disabled: boolean;
  onPress: () => void;
}) {
  const foregroundColor = useCSSVariable("--foreground") as string;
  const isPrevious = direction === "left";

  return (
    <Pressable
      accessibilityLabel={isPrevious ? "Previous chunk" : "Next chunk"}
      accessibilityRole="button"
      accessibilityState={{ disabled }}
      className={cn(
        "size-8 items-center justify-center rounded-full active:opacity-60",
        disabled && "opacity-40"
      )}
      disabled={disabled}
      hitSlop={8}
      onPress={onPress}
    >
      <Feather
        color={foregroundColor}
        name={isPrevious ? "chevron-left" : "chevron-right"}
        size={CHEVRON_SIZE}
      />
    </Pressable>
  );
}

function VerseActions({
  chapter,
  verse,
  onCapture,
}: {
  chapter: Chapter;
  verse: EnglishVerse;
  onCapture: () => void;
}) {
  const foregroundColor = useCSSVariable("--foreground") as string;
  const dangerColor = useCSSVariable("--danger") as string;
  const { isFavorite, toggleFavorite } = useFavorite({
    chapterNumber: chapter.chapterNumber,
    verseNumber: verse.verse,
  });

  return (
    <View className="absolute right-0 bottom-0 z-10" pointerEvents="box-none">
      <View
        className="pr-safe-offset-4 pb-safe-offset-4 items-end gap-2"
        pointerEvents="box-none"
      >
        <VerseAction
          accessibilityState={{ selected: isFavorite }}
          label="Favorites"
          onPress={toggleFavorite}
        >
          <MaterialIcons
            color={isFavorite ? dangerColor : foregroundColor}
            name={isFavorite ? "favorite" : "favorite-outline"}
            size={20}
          />
        </VerseAction>

        <VerseAction
          label="Share verse"
          onPress={() => shareVerse(chapter, verse)}
        >
          <Feather color={foregroundColor} name="share" size={20} />
        </VerseAction>

        <VerseAction label="Capture photo" onPress={onCapture}>
          <Feather color={foregroundColor} name="camera" size={20} />
        </VerseAction>

        <VerseAction label="Verse info">
          <Feather color={foregroundColor} name="info" size={20} />
        </VerseAction>
      </View>
    </View>
  );
}

function VerseAction({
  accessibilityState,
  children,
  label,
  onPress,
}: {
  accessibilityState?: AccessibilityState;
  children: React.ReactNode;
  label: string;
  onPress?: () => void;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityState={accessibilityState}
      className="bg-default size-10 items-center justify-center rounded-full active:opacity-60"
      onPress={() => {
        triggerHaptic();
        onPress?.();
      }}
    >
      {children}
    </Pressable>
  );
}
