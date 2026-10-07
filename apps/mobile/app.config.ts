import { ConfigContext, ExpoConfig } from "expo/config";

const APP_DOMAIN = "tahleel.ahm0xc.me";

const IS_DEV = process.env.APP_VARIANT === "development";
const IS_PREVIEW = process.env.APP_VARIANT === "preview";

const getUniqueIdentifier = () => {
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
    userInterfaceStyle: "automatic",
    backgroundColor: "#FFFFFF",
    ios: {
      icon: "./assets/images/app-icon.png",
      supportsTablet: false,
      bundleIdentifier: getUniqueIdentifier(),
      appleTeamId: "PJ3RA8ZXLV",
      usesAppleSignIn: true,
      associatedDomains: [`applinks:${APP_DOMAIN}`],
      entitlements: {
        "com.apple.security.application-groups": [
          `group.${getUniqueIdentifier()}`,
        ],
      },
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
        backgroundColor: "#FFFFFF",
      },
      package: getUniqueIdentifier(),
      googleServicesFile: "./google-services.json",
      intentFilters: [
        {
          action: "VIEW",
          data: [
            {
              scheme: "https",
              host: APP_DOMAIN,
              pathPrefix: "/invite",
            },
          ],
          category: ["BROWSABLE", "DEFAULT"],
        },
      ],
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
      "@clerk/expo",
      "@clerk/expo-google-signin",
      "expo-localization",
      "expo-apple-authentication",
      "expo-video",
      "expo-image",
      "expo-sharing",
      "expo-mail-composer",
      "expo-notifications",
      "expo-font",
      "expo-web-browser",
      [
        "expo-image-picker",
        {
          photosPermission:
            "Allow Tahleel to access your photos so you can set a profile picture.",
        },
      ],
      [
        "expo-build-properties",
        {
          ios: {
            enableSceneSupport: true,
          },
        },
      ],
      "@bacons/apple-targets",
    ],
    experiments: {
      reactCompiler: true,
    },
    extra: {
      eas: {
        projectId: "700ffcd1-f18b-4b82-8c19-545c19f73966",
      },
      EXPO_PUBLIC_CLERK_GOOGLE_WEB_CLIENT_ID:
        process.env.EXPO_PUBLIC_CLERK_GOOGLE_WEB_CLIENT_ID,
      EXPO_PUBLIC_CLERK_GOOGLE_IOS_CLIENT_ID:
        process.env.EXPO_PUBLIC_CLERK_GOOGLE_IOS_CLIENT_ID,
      EXPO_PUBLIC_CLERK_GOOGLE_ANDROID_CLIENT_ID:
        process.env.EXPO_PUBLIC_CLERK_GOOGLE_ANDROID_CLIENT_ID,
      EXPO_PUBLIC_CLERK_GOOGLE_IOS_URL_SCHEME:
        process.env.EXPO_PUBLIC_CLERK_GOOGLE_IOS_URL_SCHEME,
    },
    updates: {
      url: "https://u.expo.dev/700ffcd1-f18b-4b82-8c19-545c19f73966",
    },
    owner: "somossaxio-org",
    runtimeVersion: isDevClient
      ? "1.0.0"
      : {
          policy: "appVersion",
        },
  };
};
