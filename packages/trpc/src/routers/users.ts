import { z } from "zod";

import { getUserProfile, getUsersProfiles } from "../lib/clerk-users.js";
import { createTRPCRouter, protectedProcedure } from "../trpc.js";

export const usersRouter = createTRPCRouter({
  me: protectedProcedure.query(async ({ ctx }) => {
    return getUserProfile(ctx.auth.userId);
  }),

  byId: protectedProcedure
    .input(z.object({ userId: z.string().min(1) }))
    .query(async ({ input }) => {
      return getUserProfile(input.userId);
    }),

  getMany: protectedProcedure
    .input(z.object({ userIds: z.array(z.string().min(1)).max(100) }))
    .query(async ({ input }) => {
      return getUsersProfiles(input.userIds);
    }),
});
