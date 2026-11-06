export type ReciterId =
  | "alafasy"
  | "abdulbasit-murattal"
  | "abdulbasit-mujawwad"
  | "sudais"
  | "husary"
  | "husary-muallim"
  | "maher"
  | "shaatree";

export interface Reciter {
  id: ReciterId;
  name: string;
  arabicName: string;
  folder: string;
  bitrate: string;
}

export const RECITERS: Reciter[] = [
  {
    id: "alafasy",
    name: "Mishary Alafasy",
    arabicName: "مشاري راشد العفاسي",
    folder: "Alafasy_128kbps",
    bitrate: "128 kbps",
  },
  {
    id: "abdulbasit-murattal",
    name: "Abdul Basit (Murattal)",
    arabicName: "عبد الباسط عبد الصمد",
    folder: "Abdul_Basit_Murattal_192kbps",
    bitrate: "192 kbps",
  },
  {
    id: "abdulbasit-mujawwad",
    name: "Abdul Basit (Mujawwad)",
    arabicName: "عبد الباسط عبد الصمد",
    folder: "Abdul_Basit_Mujawwad_128kbps",
    bitrate: "128 kbps",
  },
  {
    id: "sudais",
    name: "Abdurrahman As-Sudais",
    arabicName: "عبد الرحمن السديس",
    folder: "Abdurrahmaan_As-Sudais_192kbps",
    bitrate: "192 kbps",
  },
  {
    id: "husary",
    name: "Mahmoud Al-Husary",
    arabicName: "محمود خليل الحصري",
    folder: "Husary_128kbps",
    bitrate: "128 kbps",
  },
  {
    id: "husary-muallim",
    name: "Al-Husary (Muallim)",
    arabicName: "محمود خليل الحصري (المعلم)",
    folder: "Husary_Muallim_128kbps",
    bitrate: "128 kbps",
  },
  {
    id: "maher",
    name: "Maher Al Muaiqly",
    arabicName: "ماهر المعيقلي",
    folder: "MaherAlMuaiqly128kbps",
    bitrate: "128 kbps",
  },
  {
    id: "shaatree",
    name: "Abu Bakr Ash-Shaatree",
    arabicName: "أبو بكر الشاطري",
    folder: "Abu_Bakr_Ash-Shaatree_128kbps",
    bitrate: "128 kbps",
  },
];

export const DEFAULT_RECITER: ReciterId = "alafasy";

export function getReciter(id: ReciterId): Reciter {
  return RECITERS.find((reciter) => reciter.id === id) ?? RECITERS[0];
}

export function isReciterId(value: string): value is ReciterId {
  return RECITERS.some((reciter) => reciter.id === value);
}
