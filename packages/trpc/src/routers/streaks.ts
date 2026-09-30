import { db, schema } from "@repo/db";
import { TRPCError } from "@trpc/server";
import { and, asc, eq, gte, lte } from "drizzle-orm";
import { z } from "zod";

import { daySchema, diffInDays, todayInUTC } from "../lib/days.js";
import {
  EMPTY_STREAK,
  type StreakState,
  advanceStreak,
  isStreakAlive,
  readStreak,
} from "../lib/streaks.js";
import { createTRPCRouter, protectedProcedure } from "../trpc.js";

const { dailyProgress, userStreaks } = schema;

const MAX_HISTORY_DAYS = 7;
const GRACE_DAYS = 2;

function toStreakState(row: typeof userStreaks.$inferSelect): StreakState {
  return {
    currentStreak: row.currentStreak,
    longestStreak: row.longestStreak,
    lastCompletedDay: row.lastCompletedDay,
  };
}

function toTodayProgress(row: typeof dailyProgress.$inferSelect) {
  return {
    day: row.day,
    goalSnapshot: row.goalSnapshot,
    versesRead: row.versesRead,
    hasanatEarned: row.hasanatEarned,
    timeSpent: row.timeSpent,
    completed: row.completed,
  };
}

export const streaksRouter = createTRPCRouter({
  get: protectedProcedure
    .input(z.object({ today: daySchema.optional() }).optional())
    .query(async ({ ctx, input }) => {
      const today = input?.today ?? todayInUTC();

      const streakRow = await db.query.userStreaks.findFirst({
        where: { userId: ctx.auth.userId },
      });

      const stored = streakRow ? toStreakState(streakRow) : EMPTY_STREAK;

      const progressRow = await db.query.dailyProgress.findFirst({
        where: { userId: ctx.auth.userId, day: today },
      });

      return {
        ...readStreak(stored, today),
        isAlive: isStreakAlive(stored, today),
        todayProgress: progressRow ? toTodayProgress(progressRow) : null,
      };
    }),

  update: protectedProcedure
    .input(
      z.object({
        day: daySchema,
        today: daySchema.optional(),
        goalSnapshot: z.number().int().nonnegative(),

        hasanatEarned: z.number().int().nonnegative().optional(),
        versesRead: z.number().int().nonnegative().optional(),
        timeSpent: z.number().int().nonnegative().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      if (
        input.hasanatEarned === undefined &&
        input.versesRead === undefined &&
        input.timeSpent === undefined
      ) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message:
            "Provide at least one of hasanatEarned, versesRead or timeSpent.",
        });
      }

      const today = input.today ?? todayInUTC();

      if (Math.abs(diffInDays(today, input.day)) > GRACE_DAYS) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: `Day ${input.day} is too far from today.`,
        });
      }

      const now = new Date();

      const existing = await db.query.dailyProgress.findFirst({
        where: { userId: ctx.auth.userId, day: input.day },
      });

      const goalSnapshot = existing?.goalSnapshot ?? input.goalSnapshot;
      const versesRead = input.versesRead ?? existing?.versesRead ?? 0;
      const completed = versesRead >= goalSnapshot;

      const values = {
        goalSnapshot,
        hasanatEarned: input.hasanatEarned ?? existing?.hasanatEarned ?? 0,
        versesRead,
        timeSpent: input.timeSpent ?? existing?.timeSpent ?? 0,
        completed,
        completedAt: completed ? (existing?.completedAt ?? now) : null,
        updatedAt: now,
      };

      const [progress] = await db
        .insert(dailyProgress)
        .values({ userId: ctx.auth.userId, day: input.day, ...values })
        .onConflictDoUpdate({
          target: [dailyProgress.userId, dailyProgress.day],
          set: values,
        })
        .returning();

      if (!progress) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to save progress.",
        });
      }

      const streakRow = await db.query.userStreaks.findFirst({
        where: { userId: ctx.auth.userId },
      });

      const previous = streakRow ? toStreakState(streakRow) : EMPTY_STREAK;
      const next = progress.completed
        ? advanceStreak(previous, input.day)
        : previous;

      const [streak] = await db
        .insert(userStreaks)
        .values({
          userId: ctx.auth.userId,
          currentStreak: next.currentStreak,
          longestStreak: next.longestStreak,
          lastCompletedDay: next.lastCompletedDay,
          updatedAt: now,
        })
        .onConflictDoUpdate({
          target: userStreaks.userId,
          set: {
            currentStreak: next.currentStreak,
            longestStreak: next.longestStreak,
            lastCompletedDay: next.lastCompletedDay,
            updatedAt: now,
          },
        })
        .returning();

      return { progress, streak };
    }),

  history: protectedProcedure
    .input(
      z.object({
        from: daySchema,
        to: daySchema,
      })
    )
    .query(async ({ ctx, input }) => {
      const span = diffInDays(input.from, input.to);

      if (span < 0) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "`from` must not be after `to`.",
        });
      }

      if (span > MAX_HISTORY_DAYS) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: `Range is too large. Maximum is ${MAX_HISTORY_DAYS} days.`,
        });
      }

      return db
        .select()
        .from(dailyProgress)
        .where(
          and(
            eq(dailyProgress.userId, ctx.auth.userId),
            gte(dailyProgress.day, input.from),
            lte(dailyProgress.day, input.to)
          )
        )
        .orderBy(asc(dailyProgress.day));
    }),
});
