import React, { useState } from "react";

import type { ImageSourcePropType } from "react-native";
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  useWindowDimensions,
} from "react-native";

import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useCSSVariable } from "uniwind";

import { Image, Text, View } from "~/components/ui";
import { RECITERS, type ReciterId } from "~/constants/reciters";
import { triggerHaptic } from "~/lib/haptics";
import {
  playReciterPreview,
  stopRecitation,
} from "~/lib/quran/recitation-player";
import { preloadReciterPreviews } from "~/lib/quran/reciter-preview";
import { cn } from "~/lib/utils";
import { usePreferences } from "~/store/preferences-store";
import { useRecitation } from "~/store/recitation-store";

const GRID_GAP = 12;
const SCREEN_PADDING = 32;

const RECITER_IMAGES: Record<ReciterId, ImageSourcePropType> = {
  alafasy: require("~/../assets/images/reciter/alafasy.webp"),
  "abdulbasit-murattal": require("~/../assets/images/reciter/abdul-basit.webp"),
  "abdulbasit-mujawwad": require("~/../assets/images/reciter/abdul-basit.webp"),
  sudais: require("~/../assets/images/reciter/abdur-rahman-as-sudais.webp"),
  husary: require("~/../assets/images/reciter/al-husary.webp"),
  "husary-muallim": require("~/../assets/images/reciter/al-husary.webp"),
  maher: require("~/../assets/images/reciter/maher-al-muaiqly.webp"),
  shaatree: require("~/../assets/images/reciter/abu-bakr-al-shaatree.webp"),
};

export default function ReciterScreen() {
  const { width: windowWidth } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const [rowWidth, setRowWidth] = useState(0);
  const reciterId = usePreferences((state) => state.reciterId);
  const setReciterId = usePreferences((state) => state.setReciterId);
  const preview = useRecitation((state) => state.preview);

  const fallbackWidth =
    windowWidth - SCREEN_PADDING - insets.left - insets.right;
  const cardSize = ((rowWidth || fallbackWidth) - GRID_GAP) / 2;

  React.useEffect(() => () => stopRecitation(), []);

  React.useEffect(() => {
    preloadReciterPreviews(RECITERS.map((reciter) => reciter.id));
  }, []);

  function handlePreview(id: ReciterId) {
    if (preview?.reciterId === id) {
      stopRecitation();
      return;
    }

    triggerHaptic();
    playReciterPreview(id);
  }

  return (
    <ScrollView
      className="bg-background flex-1"
      contentContainerStyle={{ paddingTop: insets.top + 56 + 8 }}
      contentContainerClassName="pb-safe-offset-6"
      showsVerticalScrollIndicator={false}
    >
      <View className="px-safe-offset-4">
        <View
          className="flex-row flex-wrap gap-3"
          onLayout={(event) => setRowWidth(event.nativeEvent.layout.width)}
        >
          {RECITERS.map((reciter) => (
            <ReciterCard
              key={reciter.id}
              isPreviewLoading={
                preview?.reciterId === reciter.id && preview.phase === "loading"
              }
              isPreviewing={
                preview?.reciterId === reciter.id && preview.phase === "playing"
              }
              isSelected={reciter.id === reciterId}
              reciter={reciter}
              size={cardSize}
              onPreview={() => handlePreview(reciter.id)}
              onSelect={() => {
                triggerHaptic();
                stopRecitation();
                setReciterId(reciter.id);
              }}
            />
          ))}
        </View>
      </View>
    </ScrollView>
  );
}

function ReciterCard({
  isPreviewLoading,
  isPreviewing,
  isSelected,
  reciter,
  size,
  onPreview,
  onSelect,
}: {
  isPreviewLoading: boolean;
  isPreviewing: boolean;
  isSelected: boolean;
  reciter: (typeof RECITERS)[number];
  size: number;
  onPreview: () => void;
  onSelect: () => void;
}) {
  const foregroundColor = useCSSVariable("--foreground") as string;
  const accentForegroundColor = useCSSVariable("--accent-foreground") as string;
  const isPreviewActive = isPreviewing || isPreviewLoading;

  return (
    <Pressable
      accessibilityRole="radio"
      accessibilityState={{ selected: isSelected }}
      accessibilityLabel={reciter.name}
      className={cn(
        "bg-surface overflow-hidden rounded-3xl border-2 active:opacity-80",
        isSelected ? "border-accent" : "border-border"
      )}
      style={{ height: size, width: size }}
      onPress={onSelect}
    >
      <Image
        source={RECITER_IMAGES[reciter.id]}
        contentFit="contain"
        contentPosition="bottom right"
        style={{
          position: "absolute",
          right: 0,
          bottom: 0,
          height: "62%",
          width: "72%",
          transform: [{ translateY: 10 }],
        }}
      />

      <View className="px-3 pt-3">
        <Text
          className="text-foreground text-[15px] font-semibold"
          numberOfLines={2}
        >
          {reciter.name}
        </Text>
      </View>

      <Pressable
        accessibilityRole="button"
        accessibilityLabel={`Preview ${reciter.name}`}
        className={cn(
          "absolute bottom-2 left-2 h-9 w-9 items-center justify-center rounded-full active:opacity-70",
          isPreviewActive ? "bg-accent" : "bg-default"
        )}
        onPress={onPreview}
      >
        {isPreviewLoading ? (
          <ActivityIndicator color={accentForegroundColor} size="small" />
        ) : (
          <Ionicons
            color={isPreviewing ? accentForegroundColor : foregroundColor}
            name={isPreviewing ? "pause" : "play"}
            size={16}
          />
        )}
      </Pressable>
    </Pressable>
  );
}
