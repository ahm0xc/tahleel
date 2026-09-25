import { ConfigContext, ExpoConfig } from "expo/config";

const IS_DEV = process.env.APP_VARIANT === "development";
const IS_PREVIEW = process.env.APP_VARIANT === "preview";

const getUniqueIdentifier = () => {
  if (IS_DEV) return "io.somossa.tahleel.dev";
  if (IS_PREVIEW) return "io.somossa.tahleel.prev";
  return "io.somossa.tahleel";
};

const getAppName = () => {
  if (IS_DEV) return "Tahleel (Dev)";
  if (IS_PREVIEW) return "Tahleel (Preview)";
  return "Tahleel";
};

export default ({ config }: ConfigContext): ExpoConfig => {
  const isDevClient = process.env.EXPO_PUBLIC_DEV_CLIENT === "true";

  return {
    ...config,
    name: getAppName(),
    slug: "tahleel",
    version: "1.0.0",
    orientation: "portrait",
    icon: "./assets/images/icon.png",
    scheme: "tahleel",
    userInterfaceStyle: "light",
    backgroundColor: "#FFF",
    ios: {
      icon: "./assets/images/app-icon.png",
      supportsTablet: false,
      bundleIdentifier: getUniqueIdentifier(),
      usesAppleSignIn: true,
      infoPlist: {
        ITSAppUsesNonExemptEncryption: false,
        CFBundleAllowMixedLocalizations: true,
        CFBundleLocalizations: ["en"],
        UIBackgroundModes: ["remote-notification"],
      },
    },
    android: {
      adaptiveIcon: {
        foregroundImage: "./assets/images/adaptive-app-icon.png",
        backgroundColor: "#FFF",
      },
      package: getUniqueIdentifier(),
    },
    plugins: [
      "expo-router",
      [
        "expo-splash-screen",
        {
          image: "./assets/images/splash-icon.png",
          imageWidth: 150,
          resizeMode: "contain",
          backgroundColor: "#FFF",
        },
      ],
      "expo-secure-store",
      "expo-localization",
      "expo-apple-authentication",
      "expo-video",
      "expo-image",
      "expo-mail-composer",
      "expo-notifications",
      "expo-font",
      "expo-web-browser",
      [
        "expo-build-properties",
        {
          ios: {
            enableSceneSupport: true,
          },
        },
      ],
    ],
    extra: {
      eas: {
      },
    },
    updates: {},
    owner: "somossaxio-org",
    runtimeVersion: isDevClient
      ? "1.0.0"
      : {
          policy: "appVersion",
        },
  };
};
