import { Share } from "react-native";

import { type Chapter } from "~/constants/chapters";
import { type QuranVerse } from "~/lib/quran/edition-data";

export type ShareTextResult = "shared" | "cancelled" | "failed";

function getVerseReference(chapter: Chapter, verse: QuranVerse) {
  return `Quran ${chapter.chapterNumber}:${verse.verse} (${chapter.name})`;
}

async function shareText(
  message: string,
  title: string
): Promise<ShareTextResult> {
  try {
    const result = await Share.share({ message, title });

    return result.action === Share.dismissedAction ? "cancelled" : "shared";
  } catch (err) {
    console.error("[Share] Failed to share text:", err);

    return "failed";
  }
}

export async function shareVerse(
  chapter: Chapter,
  verse: QuranVerse
): Promise<ShareTextResult> {
  const reference = getVerseReference(chapter, verse);

  return shareText(`${verse.text}\n\n${reference}`, reference);
}

export async function shareTranslation(
  chapter: Chapter,
  verse: QuranVerse,
  text: string,
  author: string
): Promise<ShareTextResult> {
  const reference = getVerseReference(chapter, verse);

  return shareText(`${text}\n\n${reference}\n— ${author}`, reference);
}
