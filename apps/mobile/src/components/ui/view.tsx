import React from "react";

import { View as RNView, ViewProps as RNViewProps } from "react-native";

import { cn } from "~/lib/utils";

interface ViewProps extends RNViewProps {}

export default function View({ className, ...props }: ViewProps) {
  return <RNView className={cn("", className)} {...props} />;
}
