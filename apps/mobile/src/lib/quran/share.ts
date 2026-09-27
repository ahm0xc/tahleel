import { Share } from "react-native";

import { type Chapter } from "~/constants/chapters";
import { type QuranVerse } from "~/lib/quran/edition-data";

export async function shareVerse(chapter: Chapter, verse: QuranVerse) {
  const reference = `Quran ${chapter.chapterNumber}:${verse.verse} (${chapter.name})`;

  try {
    await Share.share({
      message: `${verse.text}\n\n${reference}`,
      title: reference,
    });
  } catch (err) {
    console.error("[Share] Failed to share verse:", err);
  }
}
