import React from "react";

import { Keyboard, KeyboardAvoidingView, Platform } from "react-native";

import { Input, TextField } from "heroui-native";

import { Button, ButtonLabel, Image, Text, View } from "~/components/ui";

interface NameStepProps {
  onContinue: () => void;
}

export function NameStep({ onContinue }: NameStepProps) {
  const [name, setName] = React.useState("");

  React.useEffect(() => Keyboard.dismiss, []);

  const isValid = name.trim().length >= 4;

  function handleContinue() {
    if (!isValid) return;

    onContinue();
  }

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : undefined}
      className="flex-1"
    >
      <View className="pt-safe-offset-4 flex-1 px-6">
        <View className="w-full flex-row justify-center">
          <Image
            source={{
              light: require("~/../assets/images/logo-long.png"),
              dark: require("~/../assets/images/logo-long-dark.png"),
            }}
            height={34}
          />
        </View>

        <View className="pb-safe-offset-4 mt-8 flex-1 justify-between gap-8">
          <View>
            <Text className="text-4xl font-bold tracking-[-1.5px]">
              What should we call you?
            </Text>

            <View className="mt-8">
              <TextField>
                <Input
                  autoFocus
                  className="h-16 rounded-2xl text-2xl"
                  autoCapitalize="words"
                  autoComplete="name"
                  onChangeText={setName}
                  placeholder="Your name"
                  returnKeyType="done"
                  value={name}
                  onSubmitEditing={handleContinue}
                />
              </TextField>
            </View>
          </View>

          <View>
            <Button
              className="h-14 w-full"
              haptics="Medium"
              isDisabled={!isValid}
              onPress={handleContinue}
            >
              <ButtonLabel className="text-base font-semibold">
                Continue
              </ButtonLabel>
            </Button>
          </View>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}
