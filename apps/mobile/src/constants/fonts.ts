export const FONT_ASSETS = {
  KFGQPCUthmanicScriptHAFS: require("~/../assets/fonts/KFGQPC-HAFS-Uthmanic-Script-Regular.ttf"),
  KFGQPCNastaleeq: require("~/../assets/fonts/KFGQPC-Nastaleeq-Regular.ttf"),
  NotoSans: require("~/../assets/fonts/NotoSans.ttf"),
  HindSiliguri: require("~/../assets/fonts/HindSiliguri-Regular.ttf"),
} as const;

export type FontFamily = keyof typeof FONT_ASSETS;

export const SANS_FONT_FAMILY = "NotoSans" satisfies FontFamily;
