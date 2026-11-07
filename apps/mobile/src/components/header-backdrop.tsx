import { Platform, StyleSheet, processColor } from "react-native";

import MaskedView from "@react-native-masked-view/masked-view";
import { BlurView } from "expo-blur";
import { LinearGradient } from "expo-linear-gradient";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useCSSVariable } from "uniwind";

import { View } from "~/components/ui";

const FADE_LOCATIONS = [
  0, 0.15, 0.3, 0.44, 0.58, 0.7, 0.8, 0.89, 0.95, 1,
] as const;
const FADE_ALPHAS = [1, 0.99, 0.95, 0.87, 0.75, 0.61, 0.45, 0.3, 0.14, 0];
type GradientColors = [string, string, ...string[]];

export function HeaderBackdrop() {
  const insets = useSafeAreaInsets();
  const fadeColor = String(useCSSVariable("--background"));
  const isDark = isDarkColor(fadeColor);

  const maskColors = FADE_ALPHAS.map(
    (alpha) => `rgba(0,0,0,${alpha})`
  ) as unknown as GradientColors;
  const veilColors = FADE_ALPHAS.map((alpha) =>
    toRgba(fadeColor, 1 - alpha)
  ) as unknown as GradientColors;
  const tintColors = FADE_ALPHAS.map((alpha) =>
    toRgba(fadeColor, alpha * 0.62)
  ) as unknown as GradientColors;

  return (
    <View
      pointerEvents="none"
      style={{
        position: "absolute",
        top: 0,
        left: 0,
        right: 0,
        height: insets.top + 56 + 16,
        overflow: "hidden",
      }}
    >
      {Platform.OS === "ios" ? (
        <MaskedView
          style={StyleSheet.absoluteFill}
          maskElement={
            <LinearGradient
              colors={maskColors}
              locations={FADE_LOCATIONS}
              start={{ x: 0.5, y: 0 }}
              end={{ x: 0.5, y: 1 }}
              style={StyleSheet.absoluteFill}
            />
          }
        >
          <BlurView
            intensity={45}
            tint={isDark ? "dark" : "light"}
            style={StyleSheet.absoluteFill}
          />
        </MaskedView>
      ) : (
        <LinearGradient
          colors={veilColors}
          locations={FADE_LOCATIONS}
          start={{ x: 0.5, y: 0 }}
          end={{ x: 0.5, y: 1 }}
          style={StyleSheet.absoluteFill}
        />
      )}

      <LinearGradient
        colors={tintColors}
        locations={FADE_LOCATIONS}
        start={{ x: 0.5, y: 0 }}
        end={{ x: 0.5, y: 1 }}
        style={StyleSheet.absoluteFill}
      />
    </View>
  );
}

function isDarkColor(color: string) {
  const processedColor = processColor(color);
  if (typeof processedColor !== "number") return false;

  const value = processedColor >>> 0;
  const red = (value >> 16) & 255;
  const green = (value >> 8) & 255;
  const blue = value & 255;

  return red * 0.2126 + green * 0.7152 + blue * 0.0722 < 128;
}

function toRgba(color: string, alpha: number) {
  const processedColor = processColor(color);
  if (typeof processedColor !== "number") return color;

  const value = processedColor >>> 0;
  const red = (value >> 16) & 255;
  const green = (value >> 8) & 255;
  const blue = value & 255;

  return `rgba(${red}, ${green}, ${blue}, ${alpha})`;
}
