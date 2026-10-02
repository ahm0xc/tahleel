import { SvgProps } from "react-native-svg";
import { useCSSVariable } from "uniwind";

import ArrowLeftIcon from "../../assets/icons/arrow-left.svg";
import ColorHeartIcon from "../../assets/icons/color.heart.svg";
import DonationIcon from "../../assets/icons/donation.svg";

export const ICONS = {
  donation: DonationIcon,
  "arrow-left": ArrowLeftIcon,
  // Colored icons below
  "color.heart": ColorHeartIcon,
};

export type IconName = keyof typeof ICONS;

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

  return (
    <IconComponent
      width={size}
      height={size}
      color={variableColor?.toString() ?? color}
      {...props}
    />
  );
}
