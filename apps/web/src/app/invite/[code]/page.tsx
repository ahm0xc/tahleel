import type { Metadata } from "next";

import { BrandLogo } from "@/components/brand-logo";
import { createCaller } from "@repo/trpc/root";
import { createTRPCContext } from "@repo/trpc/trpc";

import { OpenInAppButton } from "./open-in-app-button";

export const dynamic = "force-dynamic";

interface InvitePageProps {
  params: Promise<{ code: string }>;
}

async function getInvitePreview(code: string) {
  const ctx = await createTRPCContext({ headers: new Headers() });
  const caller = createCaller(ctx);

  return caller.friends.getInvitePreview({ code });
}

export async function generateMetadata({
  params,
}: InvitePageProps): Promise<Metadata> {
  const { code } = await params;
  const preview = await getInvitePreview(code);

  return {
    title: preview
      ? `${preview.displayName} invited you to Tahleel`
      : "Invitation to Tahleel",
    description: "Build your hasanat circle together, one verse at a time.",
    robots: { index: false, follow: false },
  };
}

export default async function InvitePage({ params }: InvitePageProps) {
  const { code } = await params;
  const preview = await getInvitePreview(code);

  return (
    <main className="bg-background text-foreground flex min-h-screen flex-col items-center justify-center px-5 py-16 text-center">
      <div className="border-border bg-card relative flex w-full max-w-md flex-col items-center gap-5 overflow-hidden rounded-[24px] border px-8 py-10 shadow-[0_16px_60px_rgba(0,0,0,0.25)]">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(120%_90%_at_50%_0%,rgb(11_106_224/0.16),transparent_65%)] dark:bg-[radial-gradient(120%_90%_at_50%_0%,rgb(23_176_255/0.26),transparent_65%)]"
        />
        <BrandLogo height={44} priority />
        <p className="text-muted-foreground relative text-[15px] leading-[1.5]">
          {preview
            ? `${preview.displayName} invited you to read a little Quran together, every day.`
            : "Someone invited you to read a little Quran together, every day."}
        </p>
        <div className="relative w-full max-w-[280px]">
          <OpenInAppButton code={code} />
        </div>
        <p className="text-muted-foreground/70 relative text-[12px]">
          Don&apos;t have Tahleel yet? Search &quot;Tahleel&quot; on the App
          Store or Google Play.
        </p>
      </div>
    </main>
  );
}
