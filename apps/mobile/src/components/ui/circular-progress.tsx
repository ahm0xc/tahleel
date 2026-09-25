import React, { useEffect } from "react";

import { View } from "react-native";

import Animated, {
  useAnimatedProps,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";
import Svg, { Circle, G } from "react-native-svg";

const AnimatedCircle = Animated.createAnimatedComponent(Circle);

interface Props {
  value: number;
  max?: number;
  radius?: number;
  strokeWidth?: number;
  duration?: number;
  color?: string;
  trackColor?: string;
}

const CircularProgress = ({
  value,
  max = 100,
  radius = 40,
  strokeWidth = 10,
  duration = 1000,
  color = "#2196F3",
  trackColor = "#E0E0E0",
}: Props) => {
  const circumference = 2 * Math.PI * radius;
  const halfCircle = radius + strokeWidth;

  const progress = useSharedValue(0);

  useEffect(() => {
    progress.value = withTiming(value, { duration });
  }, [value]);

  const animatedProps = useAnimatedProps(() => {
    // Calculate the stroke offset based on progress
    const strokeDashoffset =
      circumference - (circumference * progress.value) / max;

    return {
      strokeDashoffset,
    };
  });

  return (
    <View style={{ width: halfCircle * 2, height: halfCircle * 2 }}>
      <Svg
        width={halfCircle * 2}
        height={halfCircle * 2}
        viewBox={`0 0 ${halfCircle * 2} ${halfCircle * 2}`}
      >
        <G rotation="-90" origin={`${halfCircle}, ${halfCircle}`}>
          {/* Background Track */}
          <Circle
            cx="50%"
            cy="50%"
            r={radius}
            fill="transparent"
            stroke={trackColor}
            strokeWidth={strokeWidth}
          />
          {/* Animated Progress Bar */}
          <AnimatedCircle
            cx="50%"
            cy="50%"
            r={radius}
            fill="transparent"
            stroke={color}
            strokeWidth={strokeWidth}
            strokeDasharray={circumference}
            animatedProps={animatedProps}
            strokeLinecap="round"
          />
        </G>
      </Svg>
    </View>
  );
};

export default CircularProgress;
