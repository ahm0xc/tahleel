import React from "react";

import {
  Button as HeroUIButton,
  ButtonLabelProps as UIButtonLabelProps,
} from "heroui-native";

import { triggerHaptic } from "~/lib/haptics";
import { cn } from "~/lib/utils";

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
      variant={variant}
      className={cn(
        "rounded-full border-[1.5px]",
        variant === "tertiary" && "border-surface-secondary",
        variant === "secondary" && "border-border",
        variant === "ghost" && "border-transparent",
        variant === "danger" && "border-red-200",
        variant === "danger-soft" && "border-red-50",
        // "shadow-[inset_0px_1px_4px_rgba(255,255,255,0.3)]",
        variant === "tertiary" &&
          "shadow-[inset_0px_1px_4px_rgba(255,255,255,1)]",
        className
      )}
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
