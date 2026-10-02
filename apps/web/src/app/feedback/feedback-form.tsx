"use client";

import { useActionState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

import { type FeedbackSubmitState, submitFeedback } from "./actions";

interface FeedbackFormProps {
  email?: string;
  metadata?: Record<string, string>;
}

const INITIAL_STATE: FeedbackSubmitState = { status: "idle" };

export function FeedbackForm({ email, metadata }: FeedbackFormProps) {
  const [state, formAction, pending] = useActionState(
    submitFeedback,
    INITIAL_STATE
  );

  if (state.status === "success") {
    return (
      <div className="border-border bg-card rounded-[24px] border p-8 text-center shadow-[0_16px_60px_rgba(0,0,0,0.12)]">
        <p className="text-foreground text-[19px] font-medium tracking-[-0.035em]">
          Thank you for your feedback.
        </p>
        <p className="text-muted-foreground mt-2 text-[15px] leading-[1.6]">
          We read every message, and your note is on its way to us.
        </p>
      </div>
    );
  }

  return (
    <form
      action={formAction}
      className="border-border bg-card rounded-[24px] border p-6 shadow-[0_16px_60px_rgba(0,0,0,0.12)] sm:p-8"
    >
      {Object.entries(metadata ?? {}).map(([key, value]) => (
        <input key={key} name={key} type="hidden" value={value} />
      ))}

      <div className="space-y-5">
        <div className="space-y-2">
          <label
            htmlFor="feedback"
            className="text-foreground block text-[15px] font-medium"
          >
            Your feedback
          </label>
          <Textarea
            id="feedback"
            name="feedback"
            autoFocus
            placeholder="What would you like to tell us?"
          />
        </div>

        <div className="space-y-2">
          <label
            htmlFor="email"
            className="text-foreground block text-[15px] font-medium"
          >
            Email{" "}
            <span className="text-muted-foreground font-normal">
              (optional)
            </span>
          </label>
          <Input
            id="email"
            name="email"
            type="email"
            placeholder="you@example.com"
            defaultValue={email ?? ""}
          />
        </div>

        {state.status === "error" ? (
          <p className="text-destructive text-[14px]" role="alert">
            {state.message}
          </p>
        ) : null}

        <Button
          className="h-11 w-full"
          disabled={pending}
          type="submit"
          variant="default"
        >
          {pending ? "Sending..." : "Send feedback"}
        </Button>
      </div>
    </form>
  );
}
