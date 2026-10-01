import React, { useEffect, useState } from "react";

import {
  type DimensionValue,
  type ImageStyle,
  Image as RNImage,
} from "react-native";

import { Image as ExpoImage, type ImageSource } from "expo-image";
import { useUniwind } from "uniwind";

type ExpoImageSource = NonNullable<
  React.ComponentProps<typeof ExpoImage>["source"]
>;

export type ThemedImageSource = {
  light: ExpoImageSource;
  dark?: ExpoImageSource;
};

export type ImageProps = Omit<
  React.ComponentProps<typeof ExpoImage>,
  "source"
> & {
  source: ExpoImageSource | ThemedImageSource;
  width?: DimensionValue;
  height?: DimensionValue;
};

type MeasurableSource = number | string | ImageSource | undefined;

type IntrinsicSize = { width: number; height: number };

const sizeRequests = new Map<string, Promise<IntrinsicSize | null>>();

function isThemedSource(
  source: ExpoImageSource | ThemedImageSource
): source is ThemedImageSource {
  return (
    typeof source === "object" &&
    source !== null &&
    !Array.isArray(source) &&
    "light" in source
  );
}

function toMeasurableSource(
  source: ExpoImageSource | undefined
): MeasurableSource {
  const candidate = Array.isArray(source) ? source[0] : source;

  if (typeof candidate === "number") return candidate;
  if (typeof candidate === "string") {
    return candidate.startsWith("sf:") ? undefined : candidate;
  }
  if (candidate && typeof candidate === "object")
    return candidate as ImageSource;
  return undefined;
}

function getMeasurableKey(source: MeasurableSource): string | null {
  if (typeof source === "number") return `asset:${source}`;
  if (typeof source === "string") return source;
  if (!source) return null;

  const { uri, width, height } = source;
  if (uri) return uri;
  return typeof width === "number" && typeof height === "number"
    ? `${width}x${height}`
    : null;
}

function getIntrinsicSizeSync(source: MeasurableSource): IntrinsicSize | null {
  if (typeof source === "number") {
    const asset = RNImage.resolveAssetSource(source);
    return asset?.width && asset?.height
      ? { width: asset.width, height: asset.height }
      : null;
  }
  if (!source || typeof source !== "object") return null;

  const { width, height } = source;
  return typeof width === "number" &&
    typeof height === "number" &&
    width > 0 &&
    height > 0
    ? { width, height }
    : null;
}

function loadIntrinsicSize(
  source: MeasurableSource,
  key: string | null
): Promise<IntrinsicSize | null> {
  if (!key) return Promise.resolve(null);

  const pending = sizeRequests.get(key);
  if (pending) return pending;

  const request = (async () => {
    if (typeof source === "string") return RNImage.getSize(source);
    if (!source || typeof source !== "object" || !source.uri) return null;
    return source.headers
      ? RNImage.getSizeWithHeaders(source.uri, source.headers)
      : RNImage.getSize(source.uri);
  })()
    .then((size) => (size && size.width > 0 && size.height > 0 ? size : null))
    .catch(() => null);

  sizeRequests.set(key, request);

  return request;
}

function useIntrinsicSize(source: MeasurableSource): IntrinsicSize | null {
  const key = getMeasurableKey(source);
  const syncSize = getIntrinsicSizeSync(source);
  const [measured, setMeasured] = useState<{
    key: string | null;
    size: IntrinsicSize | null;
  }>({ key, size: null });

  useEffect(() => {
    if (syncSize) return;

    let active = true;
    loadIntrinsicSize(source, key).then((size) => {
      if (active) setMeasured({ key, size });
    });

    return () => {
      active = false;
    };
  }, [key]);

  return syncSize ?? (measured.key === key ? measured.size : null);
}

function resolveSizeStyle(
  width: DimensionValue | undefined,
  height: DimensionValue | undefined,
  size: IntrinsicSize | null
): ImageStyle | undefined {
  if (width === undefined && height === undefined) return undefined;
  if (!size) return { width, height };

  const ratio = size.width / size.height;

  if (typeof width === "number") {
    return {
      width,
      height: typeof height === "number" ? height : width / ratio,
    };
  }
  if (typeof height === "number") {
    return { width: height * ratio, height };
  }

  return { width, height, aspectRatio: ratio };
}

export default function Image({
  source,
  width,
  height,
  style,
  ...props
}: ImageProps) {
  const { theme } = useUniwind();

  const resolvedSource = isThemedSource(source)
    ? theme === "dark"
      ? (source.dark ?? source.light)
      : source.light
    : source;

  const hasSingleDimension = (width === undefined) !== (height === undefined);

  const size = useIntrinsicSize(
    hasSingleDimension ? toMeasurableSource(resolvedSource) : undefined
  );
  const sizeStyle = resolveSizeStyle(width, height, size);

  return (
    <ExpoImage
      source={resolvedSource}
      transition={200}
      cachePolicy="disk"
      style={sizeStyle ? [style, sizeStyle] : style}
      {...props}
    />
  );
}
