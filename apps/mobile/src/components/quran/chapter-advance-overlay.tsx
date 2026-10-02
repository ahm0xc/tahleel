import React from "react";

import { Platform, StyleSheet } from "react-native";

import { Portal } from "heroui-native";
import Animated, {
  Easing,
  Extrapolation,
  ReduceMotion,
  interpolate,
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";
import { FullWindowOverlay } from "react-native-screens";

import { Text, View } from "~/components/ui";
import { type Chapter } from "~/constants/chapters";
import { getArabicScript } from "~/constants/scripts";
import {
  ARABIC_LINE_HEIGHT_RATIO,
  getLineHeight,
} from "~/constants/typography";
import { usePreferences } from "~/store/preferences-store";

const ENTRANCE_DURATION_MS = 2740;

const BACKDROP_IN_MS = 240;

const NAME_IN_AT_MS = 300;
const NAME_IN_MS = 620;
const NAME_HOLD_MS = 1220;
const NAME_OUT_MS = 600;

const REVEAL_MS = 260;

const ARABIC_SIZE = 36;
const NAME_RISE = 12;

const END_OF_QURAN_ARABIC = "نِتِهَى الْقُرْآنُ الْكَرِيمُ";
const END_OF_QURAN_NAME = "End of the Quran";

const at = (ms: number) => ms / ENTRANCE_DURATION_MS;

const BACKDROP_PROGRESS = [0, at(BACKDROP_IN_MS), 1];
const NAME_PROGRESS = [
  at(NAME_IN_AT_MS),
  at(NAME_IN_AT_MS + NAME_IN_MS),
  at(NAME_IN_AT_MS + NAME_IN_MS + NAME_HOLD_MS),
  1,
];
const NAME_RISE_PROGRESS = [at(NAME_IN_AT_MS), at(NAME_IN_AT_MS + NAME_IN_MS)];

interface ChapterAdvanceOverlayProps {
  chapter: Chapter | null;
  isRevealing: boolean;
  onDismissed: () => void;
}

interface ChapterAdvanceSurfaceProps {
  children: React.ReactNode;
}

function ChapterAdvanceSurface({ children }: ChapterAdvanceSurfaceProps) {
  if (Platform.OS === "ios") {
    return <FullWindowOverlay>{children}</FullWindowOverlay>;
  }

  return <View className="absolute inset-0">{children}</View>;
}

export function ChapterAdvanceOverlay({
  chapter,
  isRevealing,
  onDismissed,
}: ChapterAdvanceOverlayProps) {
  const scriptId = usePreferences((state) => state.scriptId);
  const script = getArabicScript(scriptId);
  const progress = useSharedValue(0);
  const revealOpacity = useSharedValue(1);
  const onDismissedRef = React.useRef(onDismissed);

  onDismissedRef.current = onDismissed;

  React.useEffect(() => {
    progress.value = withTiming(1, {
      duration: ENTRANCE_DURATION_MS,
      easing: Easing.linear,
      reduceMotion: ReduceMotion.Never,
    });
  }, [progress]);

  React.useEffect(() => {
    if (!isRevealing) {
      return;
    }

    revealOpacity.value = withTiming(
      0,
      {
        duration: REVEAL_MS,
        easing: Easing.in(Easing.quad),
        reduceMotion: ReduceMotion.Never,
      },
      (finished) => {
        if (finished) {
          runOnJS(onDismissedRef.current)();
        }
      }
    );
  }, [isRevealing, revealOpacity]);

  const backdropStyle = useAnimatedStyle(() => ({
    opacity:
      interpolate(
        progress.value,
        BACKDROP_PROGRESS,
        [0, 1, 1],
        Extrapolation.CLAMP
      ) * revealOpacity.value,
  }));

  const nameStyle = useAnimatedStyle(() => ({
    opacity: interpolate(
      progress.value,
      NAME_PROGRESS,
      [0, 1, 1, 0],
      Extrapolation.CLAMP
    ),
    transform: [
      {
        translateY: interpolate(
          progress.value,
          NAME_RISE_PROGRESS,
          [NAME_RISE, 0],
          Extrapolation.CLAMP
        ),
      },
    ],
  }));

  return (
    <Portal name="chapter-advance-overlay">
      <ChapterAdvanceSurface>
        <Animated.View style={[StyleSheet.absoluteFill, backdropStyle]}>
          <View className="bg-background flex-1" />
        </Animated.View>

        <View
          accessibilityViewIsModal={true}
          className="px-safe-offset-8 items-center justify-center"
          style={StyleSheet.absoluteFill}
        >
          <Animated.View style={nameStyle}>
            <Text
              className="text-center"
              style={{
                fontFamily: script.fontFamily,
                fontSize: ARABIC_SIZE,
                lineHeight: getLineHeight(
                  ARABIC_SIZE,
                  ARABIC_LINE_HEIGHT_RATIO
                ),
                writingDirection: script.direction,
              }}
            >
              {chapter?.arabicName ?? END_OF_QURAN_ARABIC}
            </Text>

            <Text className="mt-4 text-center text-2xl font-medium">
              {chapter?.name ?? END_OF_QURAN_NAME}
            </Text>

            {chapter !== null && (
              <Text className="text-muted mt-1 text-center text-sm">
                {chapter.englishName}
              </Text>
            )}
          </Animated.View>
        </View>
      </ChapterAdvanceSurface>
    </Portal>
  );
}
