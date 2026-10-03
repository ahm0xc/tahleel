import { db } from "@repo/db";

const EXPO_PUSH_ENDPOINT = "https://exp.host/--/api/v2/push/send";

interface PushMessage {
  to: string;
  title: string;
  body: string;
  data?: Record<string, unknown>;
}

async function getPushToken(userId: string): Promise<string | null> {
  const row = await db.query.pushTokens.findFirst({ where: { userId } });
  return row?.expoPushToken ?? null;
}

export async function sendPushNotification(message: PushMessage) {
  try {
    const response = await fetch(EXPO_PUSH_ENDPOINT, {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Accept-encoding": "gzip, deflate",
        "Content-Type": "application/json",
      },
      body: JSON.stringify(message),
    });

    if (!response.ok) {
      console.error(
        "[Push] Expo push request failed",
        response.status,
        await response.text()
      );
    }
  } catch (error) {
    console.error("[Push] Failed to send push notification", error);
  }
}

export async function notifyUser(
  userId: string,
  message: Omit<PushMessage, "to">
) {
  const token = await getPushToken(userId);
  if (!token) return;

  await sendPushNotification({ to: token, ...message });
}
