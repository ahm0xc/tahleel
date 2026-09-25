import React, { useEffect } from "react";

import { StyleSheet, TextInput, View } from "react-native";

import Animated, {
  Easing,
  useAnimatedProps,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";
import Svg, { Circle } from "react-native-svg";

// Create animated versions of SVG Circle and React Native TextInput
const AnimatedCircle = Animated.createAnimatedComponent(Circle);
const AnimatedTextInput = Animated.createAnimatedComponent(TextInput);

const CircularProgressBar = ({
  value = 0,
  radius = 60,
  strokeWidth = 12,
  duration = 1000,
  activeColor = "#2ecc71",
  inactiveColor = "#e6e6e6",
  maxValue = 100,
  title = "",
  titleColor = "#333",
  titleStyle = {},
  numberStyle = {},
  inactivePathStyle = {},
}: {
  value?: number;
  radius?: number;
  strokeWidth?: number;
  duration?: number;
  activeColor?: string;
  inactiveColor?: string;
  maxValue?: number;
  title?: string;
  titleColor?: string;
  titleStyle?: object;
  numberStyle?: object;
  inactivePathStyle?: object;
}) => {
  // Shared value for driving the animation natively
  const progress = useSharedValue(0);

  // Geometric calculations
  const circumference = 2 * Math.PI * radius;
  const halfCircle = radius + strokeWidth;

  useEffect(() => {
    // Trigger the animation when the 'value' prop changes
    progress.value = withTiming(value, {
      duration: duration,
      easing: Easing.inOut(Easing.ease),
    });
  }, [value, duration]);

  // Animate the strokeDashoffset to draw the circle
  const animatedCircleProps = useAnimatedProps(() => {
    const progressPercentage = progress.value / maxValue;
    const strokeDashoffset = circumference - circumference * progressPercentage;
    return {
      strokeDashoffset,
    };
  });

  // Animate the text inside the circle dynamically on the UI thread
  const animatedTextProps = useAnimatedProps(() => {
    return {
      text: `${Math.round(progress.value)}`,
    };
  });

  return (
    <View style={{ width: halfCircle * 2, height: halfCircle * 2 }}>
      <Svg
        width={halfCircle * 2}
        height={halfCircle * 2}
        viewBox={`0 0 ${halfCircle * 2} ${halfCircle * 2}`}
      >
        {/* Background / Inactive Circle */}
        <Circle
          cx="50%"
          cy="50%"
          r={radius}
          stroke={inactiveColor}
          strokeWidth={strokeWidth}
          fill="transparent"
          {...inactivePathStyle}
        />

        {/* Foreground / Active Progress Circle */}
        <AnimatedCircle
          cx="50%"
          cy="50%"
          r={radius}
          stroke={activeColor}
          strokeWidth={strokeWidth}
          fill="transparent"
          strokeDasharray={circumference}
          animatedProps={animatedCircleProps}
          strokeLinecap="round"
          // Rotate by -90 degrees so the progress starts at the top (12 o'clock)
          rotation="-90"
          originX={halfCircle}
          originY={halfCircle}
        />
      </Svg>

      {/* Center Content */}
      <View style={[StyleSheet.absoluteFill, styles.textContainer]}>
        <AnimatedTextInput
          editable={false}
          defaultValue="0"
          animatedProps={animatedTextProps as any}
          style={[styles.valueText, { color: activeColor }, numberStyle]}
        />
        {title ? (
          <Animated.Text
            style={[styles.titleText, { color: titleColor }, titleStyle]}
          >
            {title}
          </Animated.Text>
        ) : null}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  textContainer: {
    justifyContent: "center",
    alignItems: "center",
  },
  valueText: {
    fontSize: 32,
    fontWeight: "bold",
    textAlign: "center",
    padding: 0,
    margin: 0,
  },
  titleText: {
    fontSize: 14,
    fontWeight: "600",
    marginTop: 4,
  },
});

export default CircularProgressBar;
