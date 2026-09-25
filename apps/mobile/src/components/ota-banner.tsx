import React from "react";

import { BlurView } from "expo-blur";
import * as Updates from "expo-updates";

import { Button, ButtonLabel, Text, View } from "~/components/ui";

export default function OtaBanner() {
  const [isFetching, setIsFetching] = React.useState(false);

  const {
    isUpdateAvailable,
    isUpdatePending,
    isDownloading,
    downloadProgress,
  } = Updates.useUpdates();

  async function handleUpdate() {
    if (isFetching) return;
    setIsFetching(true);
    try {
      await Updates.fetchUpdateAsync();
    } catch (error) {
      console.error("[OtaBanner] Failed to fetch update:", error);
    } finally {
      setIsFetching(false);
    }
  }

  async function handleRestart() {
    try {
      await Updates.reloadAsync();
    } catch (error) {
      console.error("[OtaBanner] Failed to reload app:", error);
    }
  }

  if (!isUpdateAvailable && !isUpdatePending) return null;

  const progress = Math.round((downloadProgress ?? 0) * 100);

  return (
    <View className="px-safe-offset-4 pt-2">
      <BlurView
        intensity={60}
        tint="dark"
        className="overflow-hidden rounded-3xl border border-white/5"
      >
        <View className="flex-row items-center justify-between gap-3 p-3">
          <View className="flex-1 gap-0.5">
            <Text className="text-sm font-semibold text-white">
              {isUpdatePending
                ? "Update downloaded"
                : isDownloading
                  ? "Downloading update..."
                  : "A new update is available"}
            </Text>
            <Text className="text-xs text-white/70">
              {isUpdatePending
                ? "Restart the app to apply the latest update."
                : isDownloading
                  ? "Please wait while we download the update."
                  : "Get the latest features and improvements."}
            </Text>
          </View>

          {isDownloading ? (
            <Text className="text-sm font-semibold text-white">
              {progress}%
            </Text>
          ) : isUpdatePending ? (
            <Button
              variant="primary"
              size="sm"
              className="bg-white"
              onPress={handleRestart}
            >
              <ButtonLabel className="text-black">Restart</ButtonLabel>
            </Button>
          ) : (
            <Button
              variant="primary"
              size="sm"
              className="bg-white"
              onPress={handleUpdate}
              isDisabled={isFetching}
            >
              <ButtonLabel className="text-black">
                {isFetching ? "..." : "Update"}
              </ButtonLabel>
            </Button>
          )}
        </View>
      </BlurView>
    </View>
  );
}
