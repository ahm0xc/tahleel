import * as Haptics from "expo-haptics";

export type HapticStyle = keyof typeof Haptics.ImpactFeedbackStyle;

export function triggerHaptic(style: HapticStyle = "Light") {
  void Haptics.impactAsync(Haptics.ImpactFeedbackStyle[style]).catch(() => {
    // Haptics are optional on unsupported devices.
  });
}
