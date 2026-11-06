import { TRPCError } from "@trpc/server";
import { z } from "zod";

import { getDailyEngagementSummary } from "../lib/analytics.js";
import { daySchema } from "../lib/days.js";
import { createTRPCRouter, publicProcedure } from "../trpc.js";

export const adminRouter = createTRPCRouter({
  dailySummary: publicProcedure
    .input(
      z
        .object({
          date: daySchema.optional(),
          adminKey: z.string().optional(),
        })
        .optional()
    )
    .query(async ({ ctx, input }) => {
      const configuredKey = process.env.ADMIN_API_KEY;

      const isAuthedViaKey = configuredKey && input?.adminKey === configuredKey;
      const isAuthedViaSession = ctx.auth.isAuthenticated;

      if (!configuredKey || (!isAuthedViaKey && !isAuthedViaSession)) {
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "Valid admin key or authenticated session is required.",
        });
      }

      const summary = await getDailyEngagementSummary({
        date: input?.date,
      });

      return summary;
    }),
});
