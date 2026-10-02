import type { Metadata } from "next";

import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";

import { FeedbackForm } from "./feedback-form";

export const metadata: Metadata = {
  title: "Send Feedback",
  description:
    "Tell us what you think about Tahleel, the daily Quran reading app.",
};

interface FeedbackPageProps {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

function readParam(value: string | string[] | undefined): string | undefined {
  return typeof value === "string" && value.length > 0 ? value : undefined;
}

export default async function FeedbackPage({
  searchParams,
}: FeedbackPageProps) {
  const params = await searchParams;

  const metadataEntries = {
    userId: readParam(params.userId),
    name: readParam(params.name),
    platform: readParam(params.platform),
    osVersion: readParam(params.osVersion),
    deviceModel: readParam(params.deviceModel),
    appVersion: readParam(params.appVersion),
  };

  const metadata = Object.fromEntries(
    Object.entries(metadataEntries).filter(
      (entry): entry is [string, string] => entry[1] !== undefined
    )
  );

  return (
    <main className="bg-background text-foreground min-h-screen">
      <div className="mx-auto max-w-[780px] px-5 pb-16 sm:px-8">
        <SiteHeader />
        <header className="border-border border-b pt-14 pb-12 sm:pt-20">
          <h1 className="font-heading text-[clamp(2.25rem,5.5vw,4rem)] leading-[0.9] font-semibold tracking-[-0.07em]">
            Send Feedback
          </h1>
          <p className="text-muted-foreground mt-4 text-[14px]">
            What is working, what is not, and what you would love to see next.
          </p>
        </header>
        <div className="text-muted-foreground pt-10 text-[17px] leading-[1.65] tracking-[-0.015em]">
          <p className="mb-8">
            We read every note that comes in. It only takes a minute, and it
            helps us make Tahleel better for everyone.
          </p>
          <FeedbackForm email={readParam(params.email)} metadata={metadata} />
        </div>
        <div className="pt-10">
          <SiteFooter />
        </div>
      </div>
    </main>
  );
}
