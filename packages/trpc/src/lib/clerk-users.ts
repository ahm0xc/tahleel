import { type User, createClerkClient } from "@clerk/backend";

export interface UserProfile {
  userId: string;
  displayName: string;
  imageUrl: string | null;
}

function toUserProfile(user: User): UserProfile {
  const displayName =
    user.fullName ||
    [user.firstName, user.lastName].filter(Boolean).join(" ") ||
    user.username ||
    "Tahleel user";

  return {
    userId: user.id,
    displayName,
    imageUrl: user.imageUrl || null,
  };
}

function getClerkClient() {
  const secretKey = process.env.CLERK_SECRET_KEY;
  if (!secretKey) return null;

  return createClerkClient({ secretKey });
}

export async function getUserProfile(
  userId: string
): Promise<UserProfile | null> {
  const clerkClient = getClerkClient();
  if (!clerkClient) return null;

  try {
    const user = await clerkClient.users.getUser(userId);
    return toUserProfile(user);
  } catch {
    return null;
  }
}

export async function getUsersProfiles(
  userIds: string[]
): Promise<UserProfile[]> {
  if (userIds.length === 0) return [];

  const clerkClient = getClerkClient();
  if (!clerkClient) return [];

  try {
    const { data } = await clerkClient.users.getUserList({ userId: userIds });
    return data.map(toUserProfile);
  } catch {
    return [];
  }
}
