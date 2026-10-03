import { db, schema } from "@repo/db";
import { TRPCError } from "@trpc/server";
import { and, eq, inArray, or } from "drizzle-orm";
import { customAlphabet } from "nanoid";
import { z } from "zod";

import { getUserProfile, getUsersProfiles } from "../lib/clerk-users.js";
import { todayInUTC } from "../lib/days.js";
import { notifyUser } from "../lib/notification.js";
import {
  createTRPCRouter,
  protectedProcedure,
  publicProcedure,
} from "../trpc.js";

const { dailyProgress, friendships, invites } = schema;

const INVITE_CODE_ALPHABET =
  "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
const INVITE_CODE_LENGTH = 10;
const INVITE_CODE_ATTEMPTS = 3;

const generateInviteCode = customAlphabet(
  INVITE_CODE_ALPHABET,
  INVITE_CODE_LENGTH
);

function sortPair(first: string, second: string): [string, string] {
  return first < second ? [first, second] : [second, first];
}

async function ensureInviteCode(userId: string): Promise<string> {
  const existing = await db.query.invites.findFirst({ where: { userId } });
  if (existing) return existing.code;

  for (let attempt = 0; attempt < INVITE_CODE_ATTEMPTS; attempt++) {
    const code = generateInviteCode();

    const [row] = await db
      .insert(invites)
      .values({ code, userId })
      .onConflictDoNothing()
      .returning();

    if (row) return row.code;
  }

  const created = await db.query.invites.findFirst({ where: { userId } });
  if (created) return created.code;

  throw new TRPCError({
    code: "INTERNAL_SERVER_ERROR",
    message: "Failed to create invite code.",
  });
}

async function findFriendship(firstUserId: string, secondUserId: string) {
  const [user1Id, user2Id] = sortPair(firstUserId, secondUserId);

  return db.query.friendships.findFirst({
    where: { user1Id, user2Id },
  });
}

export const friendsRouter = createTRPCRouter({
  getMyInvite: protectedProcedure.query(async ({ ctx }) => {
    const code = await ensureInviteCode(ctx.auth.userId);
    return { code };
  }),

  getInvitePreview: publicProcedure
    .input(z.object({ code: z.string().min(1) }))
    .query(async ({ input }) => {
      const invite = await db.query.invites.findFirst({
        where: { code: input.code },
      });
      if (!invite) return null;

      const profile = await getUserProfile(invite.userId);
      return profile ? { displayName: profile.displayName } : null;
    }),

  getInviteInfo: protectedProcedure
    .input(z.object({ code: z.string().min(1) }))
    .query(async ({ ctx, input }) => {
      const invite = await db.query.invites.findFirst({
        where: { code: input.code },
      });
      if (!invite) return null;

      const profile = await getUserProfile(invite.userId);
      if (!profile) return null;

      const isSelf = invite.userId === ctx.auth.userId;

      return {
        ...profile,
        isSelf,
        isConnected: isSelf
          ? false
          : (await findFriendship(ctx.auth.userId, invite.userId)) != null,
      };
    }),

  connect: protectedProcedure
    .input(z.object({ code: z.string().min(1) }))
    .mutation(async ({ ctx, input }) => {
      const invite = await db.query.invites.findFirst({
        where: { code: input.code },
      });
      if (!invite) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Invite not found.",
        });
      }

      if (invite.userId === ctx.auth.userId) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "You can't connect with yourself.",
        });
      }

      const existing = await findFriendship(ctx.auth.userId, invite.userId);
      if (!existing) {
        const [user1Id, user2Id] = sortPair(ctx.auth.userId, invite.userId);
        await db.insert(friendships).values({ user1Id, user2Id });

        const friendProfile = await getUserProfile(ctx.auth.userId);
        if (friendProfile) {
          void notifyUser(invite.userId, {
            title: "New connection",
            body: `You and ${friendProfile.displayName} are now connected`,
            data: { deepLink: "/friends" },
          });
        }
      }

      const profile = await getUserProfile(invite.userId);
      if (!profile) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to load the invited user.",
        });
      }

      return { friend: profile };
    }),

  list: protectedProcedure.query(async ({ ctx }) => {
    const me = ctx.auth.userId;

    const rows = await db
      .select()
      .from(friendships)
      .where(or(eq(friendships.user1Id, me), eq(friendships.user2Id, me)));

    const friendIds = rows.map((row) =>
      row.user1Id === me ? row.user2Id : row.user1Id
    );

    const profiles = await getUsersProfiles(friendIds);
    const profileByUserId = new Map(
      profiles.map((profile) => [profile.userId, profile])
    );

    return friendIds
      .map((userId) => profileByUserId.get(userId))
      .filter(
        (profile): profile is NonNullable<typeof profile> => profile != null
      );
  }),

  leaderboard: protectedProcedure.query(async ({ ctx }) => {
    const me = ctx.auth.userId;

    const rows = await db
      .select()
      .from(friendships)
      .where(or(eq(friendships.user1Id, me), eq(friendships.user2Id, me)));

    const friendIds = rows.map((row) =>
      row.user1Id === me ? row.user2Id : row.user1Id
    );

    const userIds = [me, ...friendIds];
    const today = todayInUTC();

    const progressRows =
      userIds.length > 0
        ? await db
            .select()
            .from(dailyProgress)
            .where(
              and(
                eq(dailyProgress.day, today),
                inArray(dailyProgress.userId, userIds)
              )
            )
        : [];

    const hasanatByUserId = new Map(
      progressRows.map((row) => [row.userId, row.hasanatEarned])
    );

    const profiles = await getUsersProfiles(userIds);
    const profileByUserId = new Map(
      profiles.map((profile) => [profile.userId, profile])
    );

    const entries = userIds.map((userId) => ({
      userId,
      displayName: profileByUserId.get(userId)?.displayName ?? "Unknown",
      imageUrl: profileByUserId.get(userId)?.imageUrl ?? null,
      hasanat: hasanatByUserId.get(userId) ?? 0,
      isCurrentUser: userId === me,
    }));

    return entries.sort((first, second) => second.hasanat - first.hasanat);
  }),

  remove: protectedProcedure
    .input(z.object({ friendUserId: z.string().min(1) }))
    .mutation(async ({ ctx, input }) => {
      const [user1Id, user2Id] = sortPair(ctx.auth.userId, input.friendUserId);

      await db
        .delete(friendships)
        .where(
          and(
            eq(friendships.user1Id, user1Id),
            eq(friendships.user2Id, user2Id)
          )
        );

      return { success: true };
    }),
});
