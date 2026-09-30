import React from "react";

import {
  Button as HeroUIButton,
  ButtonLabelProps as UIButtonLabelProps,
} from "heroui-native";

import { triggerHaptic } from "~/lib/haptics";

export type ButtonProps = React.ComponentPropsWithoutRef<
  typeof HeroUIButton
> & {
  capture?: {
    event: string;
    properties?: Record<string, any>;
  };
  haptics?: "Soft" | "Light" | "Medium" | "Heavy" | "Rigid";
};

export function Button({
  className,
  variant,
  capture,
  onPress,
  onPressIn,
  onPressOut,
  haptics,
  ...props
}: ButtonProps) {
  function handleHaptics() {
    if (haptics) triggerHaptic(haptics);
  }

  function handleOnPress(event: any) {
    handleHaptics();

    if (typeof onPress === "function") {
      onPress(event);
    }
  }

  function handleOnPressIn(event: any) {
    if (typeof onPressIn === "function") {
      onPressIn(event);
    }
  }

  function handleOnPressOut(event: any) {
    if (typeof onPressOut === "function") {
      onPressOut(event);
    }
  }

  return (
    <HeroUIButton
      className={className}
      variant={variant}
      onPress={handleOnPress}
      onPressIn={handleOnPressIn}
      onPressOut={handleOnPressOut}
      {...props}
    />
  );
}

export type ButtonLabelProps = UIButtonLabelProps;

export function ButtonLabel({ ...props }: ButtonLabelProps) {
  return <HeroUIButton.Label {...props} />;
}
