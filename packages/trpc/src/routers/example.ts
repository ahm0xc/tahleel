import { z } from "zod";

import {
  createTRPCRouter,
  protectedProcedure,
  publicProcedure,
} from "../trpc.js";

export const exampleRouter = createTRPCRouter({
  hello: publicProcedure
    .input(
      z.object({
        text: z.string(),
      })
    )
    .query(({ input }) => {
      const result = {
        greeting: `Hello ${input.text}`,
        time: new Date().toISOString(),
      };
      return result;
    }),

  add: publicProcedure
    .input(
      z.object({
        x: z.number(),
        y: z.number(),
      })
    )
    .mutation(({ input }) => {
      const sum = input.x + input.y;
      return sum;
    }),

  /**
   * Public on purpose: lets a client confirm whether the server picked up its session token
   * without needing access to a protected resource.
   */
  whoami: publicProcedure.query(({ ctx }) => {
    const { isAuthenticated, userId, sessionId } = ctx.auth;
    return { isAuthenticated, userId, sessionId };
  }),

  /**
   * Anonymous callers get `UNAUTHORIZED` before the resolver runs.
   */
  secret: protectedProcedure.query(({ ctx }) => {
    return {
      userId: ctx.auth.userId,
      sessionId: ctx.auth.sessionId,
      secret: `${ctx.auth.userId} is using a protected procedure`,
    };
  }),
});
