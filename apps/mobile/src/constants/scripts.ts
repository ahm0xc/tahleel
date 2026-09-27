import type { FontFamily } from "./fonts";

export type ArabicScriptId = "uthmani" | "indopak";

export interface ArabicScript {
  id: ArabicScriptId;
  name: string;
  arabicName: string;
  editionId: string;
  fontFamily: FontFamily;
  direction: "rtl";
}

export const ARABIC_SCRIPTS: ArabicScript[] = [
  {
    id: "uthmani",
    name: "Uthmani",
    arabicName: "الرسم العثماني",
    editionId: "ara-quranuthmanihaf",
    fontFamily: "KFGQPCUthmanicScriptHAFS",
    direction: "rtl",
  },
  {
    id: "indopak",
    name: "Indo-Pak",
    arabicName: "الخط الهندي",
    editionId: "ara-quranindopak",
    fontFamily: "KFGQPCNastaleeq",
    direction: "rtl",
  },
];

export const DEFAULT_ARABIC_SCRIPT: ArabicScriptId = "uthmani";

export function getArabicScript(id: ArabicScriptId): ArabicScript {
  return ARABIC_SCRIPTS.find((script) => script.id === id) ?? ARABIC_SCRIPTS[0];
}
