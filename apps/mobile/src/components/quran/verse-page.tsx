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
import { type ArabicScript } from "~/constants/scripts";
import { getTranslationLanguage } from "~/constants/translations";
import {
  ARABIC_LINE_HEIGHT_RATIO,
  getLineHeight,
} from "~/constants/typography";
import { triggerHaptic } from "~/lib/haptics";
import { type QuranVerse, getEditionVerse } from "~/lib/quran/edition-data";
import { shareVerse } from "~/lib/quran/share";
import {
  CHUNKING_VERSION,
  MAX_LINES_PER_CHUNK,
  chunkVerseText,
} from "~/lib/quran/verse-chunks";
import { cn } from "~/lib/utils";
import { useFavorite } from "~/store/favorite-store";
import { usePreferences } from "~/store/preferences-store";

import { ShareImageCapture } from "./share-image-capture";
import { TranslationImageCaptureCard } from "./translation-image-capture-card";
import { VerseDetailSheet } from "./verse-detail-sheet";
import { VerseImageCaptureCard } from "./verse-image-capture-card";

const VERSE_TEXT_CLASS_NAME = "text-center";

const CHEVRON_SIZE = 22;

const chunkCache = new Map<string, string[]>();

/**
 * A split is a set of cut points measured against one width *and* one font, so
 * a cached one has to name the script and size it came from. Without them a
 * verse split for a narrow font would be served again for a wide one, cutting
 * lines that fit. There is nothing to measure against until the page has a
 * width, hence the null.
 */
function cacheKey(
  scriptId: string,
  fontSize: number,
  chapterNumber: number,
  verseNumber: number,
  width: number
): string | null {
  if (width <= 0) {
    return null;
  }

  return `${CHUNKING_VERSION}:${scriptId}:${fontSize}:${chapterNumber}:${verseNumber}:${Math.round(width)}`;
}

/**
 * A single chunk is not worth a page of its own, so a hit only counts once it
 * has something to page to.
 */
function readChunkCache(key: string | null): string[] | null {
  const cached = key === null ? undefined : chunkCache.get(key);

  return cached && cached.length > 1 ? cached : null;
}

export function VersePage({
  chapterNumber,
  fontSize,
  isActive,
  script,
  verse,
  height,
  width,
}: {
  chapterNumber: number;
  fontSize: number;
  isActive: boolean;
  script: ArabicScript;
  verse: QuranVerse;
  height: number;
  width: number;
}) {
  const verseTextStyle = React.useMemo(
    () => ({
      fontFamily: script.fontFamily,
      fontSize,
      lineHeight: getLineHeight(fontSize, ARABIC_LINE_HEIGHT_RATIO),
      writingDirection: script.direction,
    }),
    [fontSize, script.direction, script.fontFamily]
  );
  const chunkKey = cacheKey(
    script.id,
    fontSize,
    chapterNumber,
    verse.verse,
    width
  );
  const [chunks, setChunks] = React.useState<string[] | null>(() =>
    readChunkCache(chunkKey)
  );
  const chapter = getChapter(chapterNumber) ?? CHAPTERS[0];
  const [contentWidth, setContentWidth] = React.useState(0);
  const [activeChunk, setActiveChunk] = React.useState(0);
  const activeChunkRef = React.useRef(0);
  const isDraggingRef = React.useRef(false);
  const hasTickedRef = React.useRef(false);
  const isProgrammaticRef = React.useRef(false);
  const chunkListRef = React.useRef<FlatList<string>>(null);
  const [captureRequest, setCaptureRequest] = React.useState(0);
  const [translationCaptureRequest, setTranslationCaptureRequest] =
    React.useState(0);
  const chunkKeyRef = React.useRef(chunkKey);

  const translationLanguageId = usePreferences(
    (state) => state.translationLanguageId
  );
  const translationFontSize = usePreferences(
    (state) => state.translationFontSize
  );
  const language = getTranslationLanguage(translationLanguageId);
  const translation = React.useMemo(
    () =>
      getEditionVerse(language.editionId, chapter.chapterNumber, verse.verse)
        ?.text,
    [chapter.chapterNumber, language.editionId, verse.verse]
  );

  const verseShareTitle = `Quran ${chapter.chapterNumber}:${chapter.name}`;
  const translationShareTitle = `${verseShareTitle} · ${language.name}`;

  const renderVerseCard = React.useCallback(
    (cardWidth: number) => (
      <VerseImageCaptureCard
        chapter={chapter}
        fontSize={fontSize}
        script={script}
        verse={verse}
        width={cardWidth}
      />
    ),
    [chapter, fontSize, script, verse]
  );

  const renderTranslationCard = React.useCallback(
    (cardWidth: number) =>
      // The host is only mounted for a translation that exists, so this is only
      // here to keep the renderer total.
      translation === undefined ? null : (
        <TranslationImageCaptureCard
          chapter={chapter}
          fontSize={translationFontSize}
          language={language}
          text={translation}
          verseNumber={verse.verse}
          width={cardWidth}
        />
      ),
    [chapter, language, translation, translationFontSize, verse.verse]
  );

  // Changing the font re-lays the verse out, but `chunks` still holds the split
  // measured for the old one, and a re-measure only ever adds chunks back. A
  // verse that used to need splitting may no longer do, so the split is dropped
  // and re-measured whenever the geometry it was measured against changes.
  React.useEffect(() => {
    if (chunkKey === null || chunkKeyRef.current === chunkKey) {
      return;
    }

    chunkKeyRef.current = chunkKey;
    // The paged strip is about to be rebuilt, so the drag bookkeeping guarding
    // its scroll events has to start clean or it would swallow the first swipe.
    activeChunkRef.current = 0;
    isDraggingRef.current = false;
    isProgrammaticRef.current = false;
    hasTickedRef.current = false;
    setActiveChunk(0);
    setChunks(readChunkCache(chunkKey));
  }, [chunkKey]);

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

    if (chunkKey !== null) {
      chunkCache.set(chunkKey, split);
    }

    setChunks(split);
  }

  return (
    <View
      className="px-safe-offset-6 pt-safe-offset-12 pb-safe-offset-4 justify-center"
      style={{ height }}
    >
      <VerseActions
        chapter={chapter}
        isActive={isActive}
        verse={verse}
        onCapture={() => {
          setCaptureRequest((request) => request + 1);
        }}
        onCaptureTranslation={() => {
          setTranslationCaptureRequest((request) => request + 1);
        }}
      />

      <View
        className="w-full"
        onLayout={(event) => setContentWidth(event.nativeEvent.layout.width)}
      >
        {chunks === null ? (
          <>
            <Text className={VERSE_TEXT_CLASS_NAME} style={verseTextStyle}>
              {verse.text}
            </Text>

            <Text
              accessibilityElementsHidden={true}
              className={VERSE_TEXT_CLASS_NAME}
              importantForAccessibility="no-hide-descendants"
              onTextLayout={handleTextLayout}
              pointerEvents="none"
              style={[
                verseTextStyle,
                {
                  position: "absolute",
                  top: 0,
                  left: 0,
                  right: 0,
                  opacity: 0,
                },
              ]}
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
                style={[verseTextStyle, { width: contentWidth }]}
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

      <ShareImageCapture
        request={captureRequest}
        shareTitle={verseShareTitle}
        width={width}
      >
        {renderVerseCard}
      </ShareImageCapture>

      {/*
        The host lives on the page, not inside the sheet that asks for the
        capture: the sheet is translated off the screen as it dismisses, and an
        off-screen host rasterizes blank. Nothing can ask for a missing
        translation either -- that tab says so instead of offering the button --
        so the host only exists when there is one to capture.
      */}
      {translation !== undefined && (
        <ShareImageCapture
          request={translationCaptureRequest}
          shareTitle={translationShareTitle}
          width={width}
        >
          {renderTranslationCard}
        </ShareImageCapture>
      )}
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
  isActive,
  verse,
  onCapture,
  onCaptureTranslation,
}: {
  chapter: Chapter;
  isActive: boolean;
  verse: QuranVerse;
  onCapture: () => void;
  onCaptureTranslation: () => void;
}) {
  const foregroundColor = useCSSVariable("--foreground") as string;
  const dangerColor = useCSSVariable("--danger") as string;
  const [isDetailsOpen, setIsDetailsOpen] = React.useState(false);
  const { isFavorite, toggleFavorite } = useFavorite({
    chapterNumber: chapter.chapterNumber,
    verseNumber: verse.verse,
  });

  // The pager recycles a page for whichever verse scrolls into it, and the
  // sheet is gone by the time the verse is no longer the one on screen, so the
  // flag has to go with it. Left set, a recycled page would come back holding
  // it and stand a sheet up already open.
  React.useEffect(() => {
    if (!isActive) {
      setIsDetailsOpen(false);
    }
  }, [isActive]);

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

        <VerseAction
          label="Verse details"
          onPress={() => {
            setIsDetailsOpen(true);
          }}
        >
          <Feather color={foregroundColor} name="info" size={20} />
        </VerseAction>

        {/*
          A closed sheet stays mounted, and one that has only just mounted has
          not been measured yet, so it cannot snap to its open position until
          it has. Standing it up on the tap left it stuck below the screen
          until the next one, so it is mounted while the verse is still idle
          instead. The pager keeps far more than one verse alive, so it is
          mounted for the verse on screen and no other.
        */}
        {isActive && (
          <VerseDetailSheet
            chapter={chapter}
            isOpen={isDetailsOpen}
            onCaptureImage={handleCaptureTranslation}
            onOpenChange={setIsDetailsOpen}
            verse={verse}
          />
        )}
      </View>
    </View>
  );

  /**
   * The system share sheet has to come up over the details sheet, so the
   * capture is armed on the way out rather than while the sheet is still up.
   */
  function handleCaptureTranslation() {
    setIsDetailsOpen(false);
    onCaptureTranslation();
  }
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
