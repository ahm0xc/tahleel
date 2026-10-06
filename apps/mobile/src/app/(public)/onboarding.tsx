import React from "react";

import { useRouter } from "expo-router";

import { ConvenienceStep } from "~/components/onboarding/convenience-step";
import { FontSizeStep } from "~/components/onboarding/font-size-step";
import { GoalStep } from "~/components/onboarding/goal-step";
import { IntroductionStep } from "~/components/onboarding/introduction-step";
import { NameStep } from "~/components/onboarding/name-step";
import { ReminderStep } from "~/components/onboarding/reminder-step";
import { ScriptStep } from "~/components/onboarding/script-step";
import { View } from "~/components/ui";
import { useOnboarding } from "~/store/onboarding-store";

const LAST_STEP = 6;

export default function OnboardingScreen() {
  const [step, setStep] = React.useState(0);

  const router = useRouter();
  const { setCompleted } = useOnboarding();

  function handleContinue() {
    if (step < LAST_STEP) {
      setStep(step + 1);
      return;
    }

    setCompleted(true);
    router.replace("/auth");
  }

  return (
    <View className="bg-background flex-1">
      {step === 0 && <IntroductionStep onContinue={handleContinue} />}
      {step === 1 && <ConvenienceStep onContinue={handleContinue} />}
      {step === 2 && <NameStep onContinue={handleContinue} />}
      {step === 3 && <GoalStep onContinue={handleContinue} />}
      {step === 4 && <ScriptStep onContinue={handleContinue} />}
      {step === 5 && <FontSizeStep onContinue={handleContinue} />}
      {step === 6 && (
        <ReminderStep onContinue={handleContinue} onSkip={handleContinue} />
      )}
    </View>
  );
}
