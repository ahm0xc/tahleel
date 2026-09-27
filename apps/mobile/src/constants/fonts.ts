export const FONT_ASSETS = {
  KFGQPCUthmanicScriptHAFS: require("~/../assets/fonts/KFGQPC-Uthmanic-Script-HAFS-Regular.otf"),
  KFGQPCNastaleeq: require("~/../assets/fonts/KFGQPC-Nastaleeq-Regular.ttf"),
  NotoSans: require("~/../assets/fonts/NotoSans.ttf"),
} as const;

export type FontFamily = keyof typeof FONT_ASSETS;

/**
 * The family every piece of UI text is set in. `globals.css` points Tailwind's
 * `--font-sans` at the same name, so the two have to move together.
 */
export const SANS_FONT_FAMILY: FontFamily = "NotoSans";
