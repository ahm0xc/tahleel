import React from "react";

import { Platform } from "react-native";

import { useSignInWithGoogle } from "@clerk/expo/google";
import { PressableFeedback, useToast } from "heroui-native";
import Svg, { Path } from "react-native-svg";

import { Text } from "../ui";

type GoogleSignInButtonProps = {
  onSignInComplete?: () => void;
};

export default function GoogleSignInButton({
  onSignInComplete,
}: GoogleSignInButtonProps) {
  const [isAttempting, setIsAttempting] = React.useState(false);
  const { startGoogleAuthenticationFlow } = useSignInWithGoogle();
  const { toast } = useToast();

  async function handleGoogleSignIn() {
    try {
      setIsAttempting(true);
      const { createdSessionId, setActive } =
        await startGoogleAuthenticationFlow();

      if (!createdSessionId || !setActive) return;

      await setActive({ session: createdSessionId });
      onSignInComplete?.();
    } catch (error) {
      if (isGoogleSignInCancellation(error)) return;

      console.error("[auth] Google sign-in failed", error);
      toast.show({
        label: "Couldn't sign in with Google",
        description:
          error instanceof Error && error.message
            ? error.message
            : "Please try again.",
        variant: "danger",
      });
    } finally {
      setIsAttempting(false);
    }
  }

  if (Platform.OS !== "ios" && Platform.OS !== "android") return null;

  return (
    <PressableFeedback
      className="h-13 flex-row items-center justify-center gap-2 rounded-full border border-black/5 bg-white"
      onPress={handleGoogleSignIn}
      isDisabled={isAttempting}
    >
      <GoogleIcon />
      <Text className="font-medium text-black">Sign in with Google</Text>
    </PressableFeedback>
  );
}

function isGoogleSignInCancellation(error: unknown) {
  if (!error || typeof error !== "object" || !("code" in error)) return false;

  return (
    error.code === "ERR_REQUEST_CANCELED" ||
    error.code === "SIGN_IN_CANCELLED" ||
    error.code === "-5"
  );
}

function GoogleIcon() {
  return (
    <Svg width={24} height={24} viewBox="0 0 48 48">
      <Path
        fill="#EA4335"
        d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"
      />
      <Path
        fill="#4285F4"
        d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"
      />
      <Path
        fill="#FBBC05"
        d="M10.53 28.59A14.5 14.5 0 0 1 9.75 24c0-1.59.27-3.13.76-4.59l-7.98-6.19A23.94 23.94 0 0 0 0 24c0 3.87.93 7.53 2.56 10.78l7.97-6.19z"
      />
      <Path
        fill="#34A853"
        d="M24 48c6.48 0 11.93-2.13 15.89-5.8l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"
      />
    </Svg>
  );
}
