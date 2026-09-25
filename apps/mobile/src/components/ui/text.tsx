import React from "react";

import { Text as RNText, TextProps as RNTextProps } from "react-native";

import { cn } from "~/lib/utils";

interface TextProps extends RNTextProps {}

export default function Text({ className, ...props }: TextProps) {
  return (
    <RNText
      className={cn("text-foreground font-sans text-base", className)}
      {...props}
    />
  );
}
