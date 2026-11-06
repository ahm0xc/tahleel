import { type ReciterId, getReciter } from "~/constants/reciters";

const RECITATION_BASE_URL = "https://everyayah.com/data";

export function getRecitationUrl(
  reciterId: ReciterId,
  chapterNumber: number,
  verseNumber: number
): string {
  const reciter = getReciter(reciterId);

  return `${RECITATION_BASE_URL}/${reciter.folder}/${toFileSegment(chapterNumber)}${toFileSegment(verseNumber)}.mp3`;
}

function toFileSegment(value: number): string {
  return String(value).padStart(3, "0");
}
