import { useState } from "react";

import { ScrollView } from "react-native";

import { useUser } from "@clerk/expo";
import { router } from "expo-router";
import { Input, Label, TextField, useToast } from "heroui-native";

import { SettingsCard } from "~/components/settings";
import { Button, ButtonLabel, Image, Text, View } from "~/components/ui";

export default function ProfileScreen() {
  const { user } = useUser();
  const { toast } = useToast();

  const [firstName, setFirstName] = useState(user?.firstName ?? "");
  const [lastName, setLastName] = useState(user?.lastName ?? "");
  const [isSaving, setIsSaving] = useState(false);

  const email = user?.primaryEmailAddress?.emailAddress ?? "";
  const initials =
    [user?.firstName?.[0], user?.lastName?.[0]]
      .filter(Boolean)
      .join("")
      .toUpperCase() || "U";

  const canSave = firstName.trim().length > 0 && !isSaving;

  async function handleSave() {
    if (!user || !canSave) return;

    setIsSaving(true);
    try {
      await user.update({
        firstName: firstName.trim(),
        lastName: lastName.trim(),
      });
      toast.show({ label: "Name updated", variant: "success" });
      router.back();
    } catch {
      toast.show({ label: "Couldn't update your name", variant: "danger" });
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <ScrollView
      className="bg-background flex-1"
      contentContainerClassName="px-safe-offset-4 pb-safe-offset-6 pt-4"
    >
      <View className="items-center py-2">
        <View className="bg-accent h-24 w-24 items-center justify-center overflow-hidden rounded-full">
          {user?.imageUrl ? (
            <Image
              source={user.imageUrl}
              contentFit="cover"
              style={{ height: 96, width: 96 }}
            />
          ) : (
            <Text className="text-accent-foreground text-3xl font-semibold">
              {initials}
            </Text>
          )}
        </View>
      </View>

      <View className="mt-6">
        <SettingsCard>
          <View className="gap-4 px-4 py-4">
            <TextField>
              <Label>
                <Label.Text>First name</Label.Text>
              </Label>
              <Input
                autoCapitalize="words"
                autoComplete="given-name"
                placeholder="First name"
                value={firstName}
                onChangeText={setFirstName}
              />
            </TextField>

            <TextField>
              <Label>
                <Label.Text>Last name</Label.Text>
              </Label>
              <Input
                autoCapitalize="words"
                autoComplete="family-name"
                placeholder="Last name"
                value={lastName}
                onChangeText={setLastName}
              />
            </TextField>

            <TextField isDisabled>
              <Label>
                <Label.Text>Email</Label.Text>
              </Label>
              <Input
                autoComplete="email"
                keyboardType="email-address"
                placeholder="Email"
                value={email}
              />
            </TextField>
          </View>
        </SettingsCard>
      </View>

      <View className="mt-6">
        <Button
          className="h-14 w-full"
          haptics="Light"
          isDisabled={!canSave}
          onPress={() => void handleSave()}
        >
          <ButtonLabel className="text-base font-semibold">
            {isSaving ? "Saving..." : "Save"}
          </ButtonLabel>
        </Button>
      </View>
    </ScrollView>
  );
}