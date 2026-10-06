import React from "react";
import { Alert } from "react-native";

import * as Updates from "expo-updates";

export default function UpdateAlert() {
  const { isUpdatePending } = Updates.useUpdates();

  const notifiedRef = React.useRef(false);

  async function handleRestart() {
    try {
      await Updates.reloadAsync();
    } catch (error) {
      console.error("[UpdateAlert] Failed to reload app:", error);
    }
  }

  React.useEffect(() => {
    if (!isUpdatePending || notifiedRef.current) return;
    notifiedRef.current = true;
    Alert.alert(
      "Update downloaded",
      "Restart the app to apply the latest update.",
      [{ text: "Cancel", style: "cancel" }, { text: "Update", onPress: handleRestart }],
    );
  }, [isUpdatePending]);

  return null;
}