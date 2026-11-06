export type RecitationMode = "once" | "continuous";

export interface RecitationModeOption {
  id: RecitationMode;
  name: string;
  description: string;
}

export const RECITATION_MODES: RecitationModeOption[] = [
  {
    id: "once",
    name: "Once per verse",
    description: "Recite the verse you are on, then stop",
  },
  {
    id: "continuous",
    name: "Continuous",
    description: "Recite each verse and move to the next until the surah ends",
  },
];

export const DEFAULT_RECITATION_MODE: RecitationMode = "once";

export function isRecitationMode(value: string): value is RecitationMode {
  return RECITATION_MODES.some((mode) => mode.id === value);
}
