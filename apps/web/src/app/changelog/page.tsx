import type { Metadata } from "next";

import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";

export const metadata: Metadata = {
  title: "Changelog",
  description:
    "A record of what shipped in Tahleel, the daily Quran reading app, and when.",
};

const release = {
  version: "1.0.0",
  date: "September 30, 2026",
  sections: [
    {
      title: "Daily Reading",
      items: [
        "Scroll through the Quran a verse at a time, at whatever pace suits you.",
        "Read the translation alongside the Arabic, verse by verse.",
        "Pick up exactly where you left off every time you open the app.",
        "Read offline, wherever you happen to be.",
      ],
    },
    {
      title: "Hasanaat",
      items: [
        "Every ayah you read earns you hasanaat.",
        "Watch your hasanaat add up day by day.",
        "A running total of everything you have read so far.",
      ],
    },
    {
      title: "Friends",
      items: [
        "Add the people you read with and keep them in your list.",
        "See how many hasanaat you have and how many they have.",
        "A little friendly competition goes a long way.",
      ],
    },
    {
      title: "Rankings",
      items: [
        "A global leaderboard of readers around the world.",
        "A separate ranking between you and your friends.",
        "Every reader is counted the same way, with nothing to skip.",
      ],
    },
    {
      title: "Getting Started",
      items: [
        "A short introduction to how scrolling and hasanaat work.",
        "Set the app up once and get straight to reading.",
      ],
    },
    {
      title: "Settings",
      items: [
        "Send feedback directly from the app.",
        "Request account deletion at any time.",
        "View device and app info at a glance.",
      ],
    },
  ],
};

export default function ChangelogPage() {
  return (
    <main className="bg-background text-foreground min-h-screen">
      <div className="mx-auto max-w-[780px] px-5 pb-16 sm:px-8">
        <SiteHeader />
        <header className="border-border border-b pt-14 pb-12 sm:pt-20">
          <h1 className="font-heading text-[clamp(2.25rem,5.5vw,4rem)] leading-[0.9] font-semibold tracking-[-0.07em]">
            Changelog
          </h1>
          <p className="text-muted-foreground mt-4 text-[14px]">
            A record of what shipped and when.
          </p>
        </header>
        <article className="pt-12 sm:pt-14">
          <div className="border-border mb-10 flex items-baseline justify-between border-b pb-6">
            <h2 className="font-heading text-[28px] font-semibold tracking-[-0.04em] sm:text-[32px]">
              {release.version}
            </h2>
            <p className="text-muted-foreground text-[14px]">{release.date}</p>
          </div>
          <div className="space-y-10">
            {release.sections.map((section) => (
              <section key={section.title}>
                <h3 className="text-foreground mb-4 text-[18px] font-medium tracking-[-0.03em]">
                  {section.title}
                </h3>
                <ul className="text-muted-foreground space-y-2.5 text-[16px] leading-[1.6] tracking-[-0.01em]">
                  {section.items.map((item) => (
                    <li key={item} className="flex gap-3">
                      <span className="text-muted-foreground/50 mt-1.5 size-1.5 shrink-0 rounded-full bg-current" />
                      {item}
                    </li>
                  ))}
                </ul>
              </section>
            ))}
          </div>
        </article>
        <SiteFooter />
      </div>
    </main>
  );
}
