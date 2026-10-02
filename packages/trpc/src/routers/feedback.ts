import { TRPCError } from "@trpc/server";
import { z } from "zod";

import { createTRPCRouter, publicProcedure } from "../trpc.js";

const EMBED_FIELD_MAX_LENGTH = 1024;

export const feedbackRouter = createTRPCRouter({
  send: publicProcedure
    .input(
      z.object({
        feedback: z.string().trim().min(1).max(4000),
        email: z
          .union([z.string().trim().email().max(254), z.literal("")])
          .optional(),
        metadata: z.record(z.string(), z.string()).optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const webhookUrl = process.env.DISCORD_FEEDBACK_WEBHOOK_URL;
      if (!webhookUrl) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Feedback is not configured.",
        });
      }

      const fields: { name: string; value: string }[] = [
        {
          name: "Feedback",
          value: input.feedback.slice(0, EMBED_FIELD_MAX_LENGTH),
        },
      ];

      if (input.email) {
        fields.push({ name: "Email", value: input.email });
      }

      if (ctx.auth.isAuthenticated) {
        fields.push({ name: "User ID", value: ctx.auth.userId });
      }

      if (input.metadata && Object.keys(input.metadata).length > 0) {
        fields.push({
          name: "Metadata",
          value: JSON.stringify(input.metadata).slice(
            0,
            EMBED_FIELD_MAX_LENGTH
          ),
        });
      }

      const response = await fetch(webhookUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          embeds: [
            {
              title: "New Feedback",
              color: 0x4f8cc9,
              timestamp: new Date().toISOString(),
              fields,
            },
          ],
        }),
      });

      if (!response.ok) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to send feedback.",
        });
      }

      return { success: true };
    }),
});
