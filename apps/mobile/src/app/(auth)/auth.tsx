import AppleSignInButton from "~/components/auth/apple-sign-in-button";
import GoogleSignInButton from "~/components/auth/google-sign-in-button";
import { Image, Text, View } from "~/components/ui";

export default function AuthScreen() {
  return (
    <View className="pb-safe-offset-4 flex-1">
      <View className="flex-1 overflow-hidden">
        <Image
          source={require("~/../assets/images/auth-banner.png")}
          contentFit="cover"
          style={{ height: "100%", width: "100%" }}
        />
      </View>

      <View className="mt-8 px-4">
        <View className="mt-4">
          <Text className="android:text-3xl font-sans-semi-bold text-4xl">
            Make room for the photos that matter.
          </Text>
          <Text className="text-foreground/80 mt-3 text-lg font-medium">
            Swipe right to keep your favorites and left to clear the rest from
            your camera roll.
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
