import React from "react";

import { Image as ExpoImage } from "expo-image";

export type ImageProps = Omit<
  React.ComponentProps<typeof ExpoImage>,
  "source"
> & {
  source: any;
};

export default function Image({ source, ...props }: ImageProps) {
  const resolvedSource =
    typeof source === "object" && "light" in source ? source.light : source;

  return (
    <ExpoImage
      source={resolvedSource}
      transition={200}
      cachePolicy="disk"
      {...props}
    />
  );
}
