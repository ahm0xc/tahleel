import type { ComponentType } from "react";

import { SvgProps } from "react-native-svg";
import { useCSSVariable } from "uniwind";

const ICONS: Record<string, ComponentType<any>> = {};

export type IconName = string;

interface IconComponentProps extends SvgProps {
  name: IconName;
  size?: number;
  color?: string;
}

export function Icon({
  name,
  size,
  color = "foreground",
  ...props
}: IconComponentProps) {
  const variableColor = useCSSVariable(`--color-${color}`);

  const IconComponent = ICONS[name];

  if (!IconComponent) return null;

  return (
    <IconComponent
      width={size}
      height={size}
      color={variableColor?.toString() ?? color}
      {...props}
    />
  );
}
