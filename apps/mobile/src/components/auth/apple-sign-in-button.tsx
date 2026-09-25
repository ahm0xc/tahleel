import React from "react";

import { Alert, Platform } from "react-native";

import { useSignInWithApple } from "@clerk/expo/apple";
import { Ionicons } from "@expo/vector-icons";
import { Button, PressableFeedback } from "heroui-native";

import { Text } from "../ui";

type AppleSignInButtonProps = React.ComponentPropsWithoutRef<typeof Button> & {
  onSignInComplete?: (method: "apple") => void;
};

export default function AppleSignInButton({
  onSignInComplete,
}: AppleSignInButtonProps) {
  const [isAttempting, setIsAttempting] = React.useState(false);

  const { startAppleAuthenticationFlow } = useSignInWithApple();

  async function handleAppleSignIn() {
    try {
      setIsAttempting(true);
      const { createdSessionId, setActive } =
        await startAppleAuthenticationFlow();

      if (createdSessionId && setActive) {
        // Set the created session as the active session
        await setActive({ session: createdSessionId });

        // Once the session is set as active,
        // if a callback function is provided, call it.
        // Otherwise, redirect to the home page.
        onSignInComplete?.("apple");
      }
    } catch (err: any) {
      // User canceled the sign-in flow
      if (err.code === "ERR_REQUEST_CANCELED") return;

      Alert.alert(
        "Error",
        err.message || "An error occurred during Apple Sign-In"
      );
      console.error("Apple Sign-In error:", JSON.stringify(err, null, 2));
    } finally {
      setIsAttempting(false);
    }
  }

  if (Platform.OS !== "ios") return null;

  return (
    <PressableFeedback
      className="h-13 flex-row items-center justify-center gap-2 rounded-full border border-black bg-black"
      onPress={handleAppleSignIn}
      isDisabled={isAttempting}
    >
      <Ionicons name="logo-apple" size={24} color="white" />
      <Text className="font-medium text-white">Sign in with Apple</Text>
    </PressableFeedback>
  );
}
