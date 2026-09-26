import React from "react";

import { useRouter } from "expo-router";

import { ConvenienceStep } from "~/components/onboarding/convenience-step";
import { IntroductionStep } from "~/components/onboarding/introduction-step";
import { View } from "~/components/ui";
import { useOnboarding } from "~/store/onboarding-store";

export default function OnboardingScreen() {
  const [step, setStep] = React.useState(0);

  const router = useRouter();
  const { setCompleted } = useOnboarding();

  function handleContinue() {
    if (step === 0) {
      setStep(1);
      return;
    }

    setCompleted(true);
    router.replace("/auth");
  }

  return (
    <View className="bg-background flex-1">
      {step === 0 && <IntroductionStep onContinue={handleContinue} />}
      {step === 1 && <ConvenienceStep onContinue={handleContinue} />}
    </View>
  );
}
