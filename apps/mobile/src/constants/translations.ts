import type { FontFamily } from "./fonts";

export type TranslationLanguageId = "english" | "bengali";

export interface TranslationLanguage {
  id: TranslationLanguageId;
  name: string;
  nativeName: string;
  direction: "ltr";
  editionId: string;
  fontFamily: FontFamily;
  author: string;
}

export const TRANSLATION_LANGUAGES: TranslationLanguage[] = [
  {
    id: "english",
    name: "English",
    nativeName: "English",
    direction: "ltr",
    editionId: "eng-mustafakhattaba",
    fontFamily: "NotoSans",
    author: "Mustafa Khattaba",
  },
  {
    id: "bengali",
    name: "Bengali",
    nativeName: "বাংলা",
    direction: "ltr",
    editionId: "ben-abubakrzakaria",
    fontFamily: "HindSiliguri",
    author: "Abu Bakr Zakaria",
  },
];

export const DEFAULT_TRANSLATION_LANGUAGE: TranslationLanguageId = "english";

export function getTranslationLanguage(
  id: TranslationLanguageId
): TranslationLanguage {
  return (
    TRANSLATION_LANGUAGES.find((language) => language.id === id) ??
    TRANSLATION_LANGUAGES[0]
  );
}
