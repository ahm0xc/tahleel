import { z } from "zod";

import { createTRPCRouter, publicProcedure } from "../trpc.js";

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
});
