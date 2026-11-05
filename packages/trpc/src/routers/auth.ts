import { TRPCError } from "@trpc/server";
import { z } from "zod";

import {
  createDeviceToken,
  restoreDeviceSession,
  revokeDeviceToken,
} from "../lib/device-tokens.js";
import {
  createTRPCRouter,
  protectedProcedure,
  publicProcedure,
} from "../trpc.js";

export const authRouter = createTRPCRouter({
  registerDevice: protectedProcedure
    .input(
      z.object({
        platform: z.enum(["ios", "android", "web"]).optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      return createDeviceToken(ctx.auth.userId, input.platform);
    }),

  restoreSession: publicProcedure
    .input(z.object({ deviceToken: z.string().min(20).max(256) }))
    .mutation(async ({ input }) => {
      const result = await restoreDeviceSession(input.deviceToken);

      if (result.ok) return { ticket: result.ticket };

      if (result.reason === "throttled") {
        throw new TRPCError({
          code: "TOO_MANY_REQUESTS",
          message: "A session restore was already attempted. Try again.",
        });
      }

      if (result.reason === "unavailable") {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Session restore is not configured.",
        });
      }

      if (result.reason === "unverified") {
        throw new TRPCError({
          code: "SERVICE_UNAVAILABLE",
          message: "Could not verify the account session. Try again.",
        });
      }

      if (result.reason === "revoked") {
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "Your sessions were ended. Sign in again to continue.",
        });
      }

      throw new TRPCError({
        code: "UNAUTHORIZED",
        message: "This device is no longer able to restore the session.",
      });
    }),

  revokeDevice: publicProcedure
    .input(z.object({ deviceToken: z.string().min(20).max(256) }))
    .mutation(async ({ input }) => {
      await revokeDeviceToken(input.deviceToken);
      return { success: true };
    }),
});
