export type EditionLanguage = "arabic" | "english";

export interface Language {
  id: EditionLanguage;
  name: string;
  nativeName: string;
  direction: "rtl" | "ltr";
}

export interface Edition {
  id: string;
  name: string;
  arabicName: string;
  language: EditionLanguage;
}

export const EDITIONS: Edition[] = [
  {
    id: "ara-quranuthmanihaf",
    name: "Uthmani (Hafs)",
    arabicName: "الرسم العثماني",
    language: "arabic",
  },
  {
    id: "ara-quranindopak",
    name: "Indo-Pak",
    arabicName: "الخط الهندي",
    language: "arabic",
  },
  {
    id: "eng-mustafakhattaba",
    name: "Mustafa Khattaba",
    arabicName: "مصطفى الخطيب",
    language: "english",
  },
];

export const DEFAULT_LANGUAGE: EditionLanguage = "arabic";

const LANGUAGE_DETAILS: Record<EditionLanguage, Omit<Language, "id">> = {
  arabic: { name: "Arabic", nativeName: "العربية", direction: "rtl" },
  english: { name: "English", nativeName: "English", direction: "ltr" },
};

export const LANGUAGES: Language[] = Array.from(
  new Set(EDITIONS.map((edition) => edition.language)),
  (language) => ({ id: language, ...LANGUAGE_DETAILS[language] })
);

export function getLanguage(id: EditionLanguage): Language | undefined {
  return LANGUAGES.find((language) => language.id === id);
}

export function getEditionsByLanguage(id: EditionLanguage): Edition[] {
  return EDITIONS.filter((edition) => edition.language === id);
}
