"use server";

import { serverCaller } from "@/trpc/server-caller";

export interface FeedbackSubmitState {
  status: "idle" | "success" | "error";
  message?: string;
}

const METADATA_KEYS = [
  "userId",
  "name",
  "platform",
  "osVersion",
  "deviceModel",
  "appVersion",
] as const;

export async function submitFeedback(
  _prev: FeedbackSubmitState,
  formData: FormData
): Promise<FeedbackSubmitState> {
  const feedback = String(formData.get("feedback") ?? "").trim();
  const email = String(formData.get("email") ?? "").trim();

  if (!feedback) {
    return {
      status: "error",
      message: "Please enter your feedback before sending.",
    };
  }

  const metadataEntries = METADATA_KEYS.map(
    (key) => [key, String(formData.get(key) ?? "")] as const
  ).filter(([, value]) => value.length > 0);

  try {
    await serverCaller.feedback.send({
      feedback,
      email: email || undefined,
      metadata:
        metadataEntries.length > 0
          ? Object.fromEntries(metadataEntries)
          : undefined,
    });
    return { status: "success" };
  } catch {
    return {
      status: "error",
      message: "Something went wrong sending your feedback. Please try again.",
    };
  }
}
