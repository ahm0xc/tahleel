import { db, schema } from "@repo/db";
import { z } from "zod";

import { createTRPCRouter, protectedProcedure } from "../trpc.js";

const { pushTokens } = schema;

export const notificationsRouter = createTRPCRouter({
  registerPushToken: protectedProcedure
    .input(
      z.object({
        expoPushToken: z.string().min(1),
        platform: z.enum(["ios", "android"]),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const now = new Date();

      await db
        .insert(pushTokens)
        .values({
          userId: ctx.auth.userId,
          expoPushToken: input.expoPushToken,
          platform: input.platform,
          updatedAt: now,
        })
        .onConflictDoUpdate({
          target: pushTokens.userId,
          set: {
            expoPushToken: input.expoPushToken,
            platform: input.platform,
            updatedAt: now,
          },
        });

      return { success: true };
    }),
});
