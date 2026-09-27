import { type RefObject } from "react";

import { type View } from "react-native";

import * as Sharing from "expo-sharing";
import { captureRef } from "react-native-view-shot";

import { type Chapter } from "~/constants/chapters";

export type ShareVerseImageResult = "shared" | "unavailable" | "failed";

const CAPTURE_OPTIONS = {
  format: "png",
  quality: 1,
  result: "tmpfile",
} as const;

export async function captureVerseImage(
  target: RefObject<View | null>
): Promise<string | null> {
  try {
    return await captureRef(target, CAPTURE_OPTIONS);
  } catch (err) {
    console.error("[VerseImage] Failed to capture verse image:", err);
    return null;
  }
}

export async function shareVerseImage(
  chapter: Chapter,
  uri: string
): Promise<ShareVerseImageResult> {
  try {
    if (!(await Sharing.isAvailableAsync())) {
      return "unavailable";
    }

    await Sharing.shareAsync(uri, {
      dialogTitle: `Quran ${chapter.chapterNumber}:${chapter.name}`,
      mimeType: "image/png",
      UTI: "public.png",
    });

    return "shared";
  } catch (err) {
    console.error("[VerseImage] Failed to share verse image:", err);
    return "failed";
  }
}
