import { type RefObject } from "react";

import { type View } from "react-native";

import * as Sharing from "expo-sharing";
import { captureRef } from "react-native-view-shot";

export type ShareImageResult = "shared" | "unavailable" | "failed";

const CAPTURE_OPTIONS = {
  format: "png",
  quality: 1,
  result: "tmpfile",
} as const;

export async function captureShareImage(
  target: RefObject<View | null>
): Promise<string | null> {
  try {
    return await captureRef(target, CAPTURE_OPTIONS);
  } catch (err) {
    console.error("[ShareImage] Failed to capture share image:", err);
    return null;
  }
}

export async function shareImage(
  title: string,
  uri: string
): Promise<ShareImageResult> {
  try {
    if (!(await Sharing.isAvailableAsync())) {
      return "unavailable";
    }

    await Sharing.shareAsync(uri, {
      dialogTitle: title,
      mimeType: "image/png",
      UTI: "public.png",
    });

    return "shared";
  } catch (err) {
    console.error("[ShareImage] Failed to share image:", err);
    return "failed";
  }
}
