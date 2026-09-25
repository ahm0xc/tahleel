import { Alert } from "react-native";

import * as MailComposer from "expo-mail-composer";

export interface MailConfig {
  to: string;
  subject: string;
  body: string;
}

export async function openMail(config: MailConfig) {
  try {
    const isAvailable = await MailComposer.isAvailableAsync();

    if (!isAvailable) {
      console.warn("[Mail] Mail composer not available on this device");
      Alert.alert("No mail app configured");
      return;
    }

    await MailComposer.composeAsync({
      recipients: [config.to],
      subject: config.subject,
      body: config.body,
    });
  } catch (err) {
    console.error("[Mail] Failed to open mail composer:", err);
    Alert.alert("Error", "Failed to open mail composer. Please try again.");
  }
}
