import { Platform } from "react-native";

import Constants from "expo-constants";
import * as Device from "expo-device";

import { MailConfig, openMail } from "./mail";

export interface FeedbackConfig {
  mail: MailConfig;
}

export const DEFAULT_FEEDBACK_CONFIG: FeedbackConfig = {
  mail: {
    // TODO: create the email
    to: "swipegoapp@gmail.com",
    subject: "Feedback on Swipe Go",
    body: `
Please describe the issue or feedback here 👇



-----------------------------
Additional Information
-----------------------------
App Version: ${Constants.expoConfig?.version ?? "unknown"}
Platform: ${Platform.OS}
OS Version: ${Device.osVersion ?? "unknown"}
Device: ${Device.modelName ?? "unknown"}
`,
  },
};

export async function openFeedback(config = DEFAULT_FEEDBACK_CONFIG) {
  await openMail(config.mail);
}
