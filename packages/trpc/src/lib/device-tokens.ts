import { db, schema } from "@repo/db";
import { and, eq, gt, isNotNull, isNull, lt, or } from "drizzle-orm";

import { getClerkClient } from "./clerk-users.js";

const { deviceTokens } = schema;

const TOKEN_TTL_MS = 180 * 24 * 60 * 60 * 1000;
const RESTORE_THROTTLE_MS = 5 * 1000;
const SIGN_IN_TICKET_TTL_SECONDS = 120;
const SESSION_LOOKBACK_LIMIT = 20;
const BLOCKED_SESSION_STATUSES = new Set(["revoked", "removed"]);
const textEncoder = new TextEncoder();

type ClerkClient = NonNullable<ReturnType<typeof getClerkClient>>;

async function hashDeviceToken(token: string) {
  const digest = await crypto.subtle.digest(
    "SHA-256",
    textEncoder.encode(token)
  );

  return Array.from(new Uint8Array(digest), (byte) =>
    byte.toString(16).padStart(2, "0")
  ).join("");
}

function generateDeviceToken() {
  const bytes = new Uint8Array(32);
  crypto.getRandomValues(bytes);

  return btoa(String.fromCharCode(...bytes))
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");
}

async function hasBlockedSession(clerkClient: ClerkClient, userId: string) {
  const { data } = await clerkClient.sessions.getSessionList({
    userId,
    limit: SESSION_LOOKBACK_LIMIT,
  });

  if (data.length === 0) return false;

  let latest = data[0]!;
  for (const session of data) {
    if (session.createdAt > latest.createdAt) latest = session;
  }

  return BLOCKED_SESSION_STATUSES.has(latest.status);
}

export async function createDeviceToken(userId: string, platform?: string) {
  const now = new Date();
  const token = generateDeviceToken();
  const expiresAt = new Date(now.getTime() + TOKEN_TTL_MS);

  await db
    .delete(deviceTokens)
    .where(
      and(
        eq(deviceTokens.userId, userId),
        or(lt(deviceTokens.expiresAt, now), isNotNull(deviceTokens.revokedAt))
      )
    );

  await db.insert(deviceTokens).values({
    id: crypto.randomUUID(),
    userId,
    tokenHash: await hashDeviceToken(token),
    platform: platform ?? null,
    expiresAt,
  });

  return { token, expiresAt };
}

export type RestoreDeviceSessionResult =
  | { ok: true; ticket: string }
  | {
      ok: false;
      reason:
        "invalid" | "revoked" | "throttled" | "unavailable" | "unverified";
    };

export async function restoreDeviceSession(
  token: string
): Promise<RestoreDeviceSessionResult> {
  const now = new Date();

  const [record] = await db
    .select()
    .from(deviceTokens)
    .where(
      and(
        eq(deviceTokens.tokenHash, await hashDeviceToken(token)),
        isNull(deviceTokens.revokedAt),
        gt(deviceTokens.expiresAt, now)
      )
    )
    .limit(1);

  if (!record) return { ok: false, reason: "invalid" };

  if (
    record.lastUsedAt &&
    now.getTime() - record.lastUsedAt.getTime() < RESTORE_THROTTLE_MS
  ) {
    return { ok: false, reason: "throttled" };
  }

  const clerkClient = getClerkClient();
  if (!clerkClient) return { ok: false, reason: "unavailable" };

  let blocked: boolean;
  try {
    blocked = await hasBlockedSession(clerkClient, record.userId);
  } catch (error) {
    console.warn("[trpc] Failed to verify Clerk sessions:", error);
    return { ok: false, reason: "unverified" };
  }

  if (blocked) {
    await revokeUserDeviceTokens(record.userId);
    return { ok: false, reason: "revoked" };
  }

  const signInToken = await clerkClient.signInTokens.createSignInToken({
    userId: record.userId,
    expiresInSeconds: SIGN_IN_TICKET_TTL_SECONDS,
  });

  await db
    .update(deviceTokens)
    .set({ lastUsedAt: now, expiresAt: new Date(now.getTime() + TOKEN_TTL_MS) })
    .where(eq(deviceTokens.id, record.id));

  return { ok: true, ticket: signInToken.token };
}

export async function revokeDeviceToken(token: string) {
  await db
    .update(deviceTokens)
    .set({ revokedAt: new Date() })
    .where(
      and(
        eq(deviceTokens.tokenHash, await hashDeviceToken(token)),
        isNull(deviceTokens.revokedAt)
      )
    );
}

async function revokeUserDeviceTokens(userId: string) {
  await db
    .update(deviceTokens)
    .set({ revokedAt: new Date() })
    .where(
      and(eq(deviceTokens.userId, userId), isNull(deviceTokens.revokedAt))
    );
}
