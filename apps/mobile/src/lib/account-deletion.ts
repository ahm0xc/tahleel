import { Platform } from "react-native";

import Constants from "expo-constants";
import * as Device from "expo-device";

import { MailConfig, openMail } from "./mail";

interface AccountDetails {
  id: string;
  firstName: string | null;
  lastName: string | null;
  email: string | null;
}

const ACCOUNT_DELETION_RECIPIENT = "swipegoapp@gmail.com";

export function createAccountDeletionRequest(user: AccountDetails): MailConfig {
  const name = [user.firstName, user.lastName].filter(Boolean).join(" ");

  return {
    to: ACCOUNT_DELETION_RECIPIENT,
    subject: "Account deletion request",
    body: `Hello Swipe Go team,

Please delete my Swipe Go account and associated data.

Account details:
Name: ${name || "Not provided"}
Email: ${user.email ?? "Not provided"}
Clerk user ID: ${user.id}

-----------------------------
Additional Information
-----------------------------
App Version: ${Constants.expoConfig?.version ?? "unknown"}
Platform: ${Platform.OS}
OS Version: ${Device.osVersion ?? "unknown"}
Device: ${Device.modelName ?? "unknown"}
`,
  };
}

export async function openAccountDeletionRequest(user: AccountDetails) {
  await openMail(createAccountDeletionRequest(user));
}
