import { LinearGradient } from "expo-linear-gradient";
import { useCSSVariable } from "uniwind";

import AppleSignInButton from "~/components/auth/apple-sign-in-button";
import GoogleSignInButton from "~/components/auth/google-sign-in-button";
import { Image, Text, View } from "~/components/ui";
import { withOpacity } from "~/lib/utils";

export default function AuthScreen() {
  const backgroundColor = useCSSVariable("--background") as string;

  return (
    <View className="pb-safe-offset-4 bg-background flex-1">
      <View className="relative flex-1 overflow-hidden">
        <Image
          source={require("~/../assets/images/auth-banner.jpeg")}
          contentFit="cover"
          style={{ height: "100%", width: "100%" }}
        />

        <LinearGradient
          colors={[
            withOpacity(backgroundColor, 0),
            withOpacity(backgroundColor, 0.55),
            backgroundColor,
          ]}
          locations={[0, 0.55, 1]}
          start={{ x: 0.5, y: 0 }}
          end={{ x: 0.5, y: 1 }}
          style={{
            bottom: 0,
            height: 40,
            left: 0,
            position: "absolute",
            right: 0,
          }}
        />
      </View>

      <View className="px-4">
        <View className="mt-4">
          <Text className="android:text-3xl text-4xl font-semibold">
            Begin your journey with the Quran.
          </Text>
          <Text className="text-foreground/80 mt-3 text-lg font-medium">
            Read a few verses a day and build a habit that lasts.
          </Text>
        </View>
        <View className="mt-10 gap-2">
          <AppleSignInButton />
          <GoogleSignInButton />
        </View>
      </View>
    </View>
  );
}
