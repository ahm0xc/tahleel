import React from "react";

import { Platform, useColorScheme } from "react-native";

import { useSignInWithApple } from "@clerk/expo/apple";
import { Ionicons } from "@expo/vector-icons";
import { PressableFeedback, useToast } from "heroui-native";

import { useOffline } from "~/hooks/use-offline";

import { Text } from "../ui";

type AppleSignInButtonProps = {
  onSignInComplete?: () => void;
};

export default function AppleSignInButton({
  onSignInComplete,
}: AppleSignInButtonProps) {
  const [isAttempting, setIsAttempting] = React.useState(false);

  const { startAppleAuthenticationFlow } = useSignInWithApple();
  const { toast } = useToast();
  const isOffline = useOffline();
  const colorScheme = useColorScheme();

  async function handleAppleSignIn() {
    if (isOffline) return;

    try {
      setIsAttempting(true);
      const result = await startAppleAuthenticationFlow();
      const { createdSessionId, setActive } = result;

      if (createdSessionId && setActive) {
        await setActive({ session: createdSessionId });
        console.log("[auth] Apple session activated");

        onSignInComplete?.();
      } else {
        console.warn("[auth] Apple flow returned without a session");
      }
    } catch (error) {
      if (isAppleSignInCancellation(error)) return;

      console.error("[auth] Apple sign-in failed", getErrorDetails(error));
      toast.show({
        label: "Couldn't sign in with Apple",
        description: getErrorMessage(error, "Please try again."),
        variant: "danger",
      });
    } finally {
      setIsAttempting(false);
    }
  }

  if (Platform.OS !== "ios") return null;

  return (
    <PressableFeedback
      className="h-13 flex-row items-center justify-center gap-2 rounded-full border border-black bg-black dark:border-white dark:bg-white"
      onPress={handleAppleSignIn}
      isDisabled={isAttempting || isOffline}
    >
      <Ionicons
        name="logo-apple"
        size={24}
        color={colorScheme === "dark" ? "black" : "white"}
      />
      <Text className="font-medium text-white dark:text-black">
        Sign in with Apple
      </Text>
    </PressableFeedback>
  );
}

function getErrorDetails(error: unknown) {
  if (error instanceof Error) {
    return {
      name: error.name,
      message: error.message,
      code: "code" in error ? error.code : undefined,
    };
  }

  return { message: String(error) };
}

function getErrorMessage(error: unknown, fallback: string) {
  return error instanceof Error && error.message ? error.message : fallback;
}

function isAppleSignInCancellation(error: unknown) {
  return (
    error !== null &&
    typeof error === "object" &&
    "code" in error &&
    error.code === "ERR_REQUEST_CANCELED"
  );
}
