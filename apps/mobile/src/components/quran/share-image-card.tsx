import { type ReactNode } from "react";

import { LinearGradient } from "expo-linear-gradient";
import { useCSSVariable } from "uniwind";

import { View } from "~/components/ui";

const ASPECT_RATIO = 1.25;
const PADDING = 28;
const BORDER_RADIUS = 24;
const RULE_WIDTH = 36;
const RULE_HEIGHT = 2;
const HEADING_RATIO = 0.8;

interface ShareImageCardProps {
  children: ReactNode;
  width: number;
}

/**
 * The chrome every shareable card is drawn on. Keeping it in one place is what
 * makes a verse card and a translation card read as the same object rather than
 * two lookalikes that drift apart.
 */
export function ShareImageCard({ children, width }: ShareImageCardProps) {
  const backgroundColor = useCSSVariable("--background") as string;
  const surfaceColor = useCSSVariable("--surface") as string;

  return (
    <LinearGradient
      colors={[backgroundColor, surfaceColor]}
      start={{ x: 0, y: 0 }}
      end={{ x: 0.5, y: 1 }}
      style={{
        borderRadius: BORDER_RADIUS,
        // A translation can run longer than the card's 4:5 shape, so this is a
        // floor rather than a height: the card grows to fit instead of clipping.
        minHeight: width * ASPECT_RATIO,
        padding: PADDING,
        width,
      }}
    >
      <View className="flex-1 justify-between">{children}</View>
    </LinearGradient>
  );
}

export function CardRule() {
  const accentColor = useCSSVariable("--accent") as string;

  return (
    <View
      style={{
        backgroundColor: accentColor,
        borderRadius: RULE_HEIGHT,
        height: RULE_HEIGHT,
        width: RULE_WIDTH,
      }}
    />
  );
}

export function getCardHeadingSize(fontSize: number): number {
  return Math.round(fontSize * HEADING_RATIO);
}
