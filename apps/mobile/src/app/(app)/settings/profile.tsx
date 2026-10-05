import { useState } from "react";

import { Pressable, ScrollView } from "react-native";

import { useUser } from "@clerk/expo";
import { Ionicons } from "@expo/vector-icons";
import { File } from "expo-file-system";
import * as ImagePicker from "expo-image-picker";
import { router } from "expo-router";
import { Input, Label, TextField, useToast } from "heroui-native";
import { useCSSVariable } from "uniwind";

import { OfflineAlert } from "~/components/offline-alert";
import { SettingsCard } from "~/components/settings";
import { Button, ButtonLabel, Image, Text, View } from "~/components/ui";
import { useOffline } from "~/hooks/use-offline";

export default function ProfileScreen() {
  const { user } = useUser();
  const { toast } = useToast();
  const isOffline = useOffline();
  const backgroundColor = useCSSVariable("--background") as string;

  const [firstName, setFirstName] = useState(user?.firstName ?? "");
  const [lastName, setLastName] = useState(user?.lastName ?? "");
  const [isSaving, setIsSaving] = useState(false);
  const [isUploadingImage, setIsUploadingImage] = useState(false);

  const email = user?.primaryEmailAddress?.emailAddress ?? "";
  const initials =
    [user?.firstName?.[0], user?.lastName?.[0]]
      .filter(Boolean)
      .join("")
      .toUpperCase() || "U";

  const hasNameChanged =
    firstName.trim() !== (user?.firstName ?? "") ||
    lastName.trim() !== (user?.lastName ?? "");

  const canSave =
    firstName.trim().length > 0 && hasNameChanged && !isSaving && !isOffline;

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

  async function handlePickImage() {
    if (isOffline) {
      toast.show({
        label: "You're offline",
        description: "Connect to the internet to update your profile picture.",
        variant: "warning",
      });
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (result.canceled) return;

    const asset = result.assets[0];

    if (!user) return;

    setIsUploadingImage(true);
    try {
      await user.setProfileImage({ file: new File(asset.uri) });
      toast.show({ label: "Profile picture updated", variant: "success" });
    } catch (error) {
      console.error("[ProfileImage] Failed to set profile image:", error);
      toast.show({
        label: "Couldn't update your profile picture",
        variant: "danger",
      });
    } finally {
      setIsUploadingImage(false);
    }
  }

  return (
    <ScrollView
      className="bg-background flex-1"
      contentContainerClassName="px-safe-offset-4 pb-safe-offset-6 pt-4"
    >
      {isOffline && (
        <View className="mb-4">
          <OfflineAlert description="Your name and profile picture can't be updated while you're offline." />
        </View>
      )}

      <View className="items-center py-2">
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Change profile picture"
          onPress={() => void handlePickImage()}
        >
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

            <View className="bg-foreground border-background absolute right-0 bottom-0 h-8 w-8 items-center justify-center rounded-full border-4">
              <Ionicons color={backgroundColor} name="camera" size={14} />
            </View>
          </View>
        </Pressable>

        <Text className="text-muted mt-2 text-sm">
          {isUploadingImage ? "Uploading..." : "Tap to change profile picture"}
        </Text>
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
