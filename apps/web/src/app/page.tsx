import Image from "next/image";
import Link from "next/link";

import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { APP_STORE_URL } from "@/lib/constants";
import {
  AppleLogoIcon,
  ArrowUpRightIcon,
} from "@phosphor-icons/react/dist/ssr";

export default function Home() {
  return (
    <main className="bg-background text-foreground selection:text-background min-h-screen selection:bg-[#d7f26b]">
      <div className="mx-auto max-w-[780px] px-5 pb-12 sm:px-8 sm:pb-16">
        <SiteHeader />

        <section id="top" className="pt-8 sm:pt-11">
          <div
            className="border-border bg-card relative aspect-[1.35] overflow-hidden rounded-[23px] border shadow-[0_16px_60px_rgba(0,0,0,0.25)] sm:rounded-[25px]"
            data-hero-image
          >
            <Image
              src="/hero-banner.webp"
              alt="Swipe Go app preview"
              fill
              priority
              sizes="(max-width: 780px) 100vw, 780px"
              className="object-cover"
            />
          </div>
        </section>

        <section
          id="story"
          className="text-muted-foreground pt-14 text-[18px] leading-[1.65] tracking-[-0.02em] sm:pt-16 sm:text-[19px] sm:leading-[1.62]"
        >
          <h1 className="text-foreground mb-8 text-[19px] font-medium tracking-[-0.035em] sm:text-[20px]">
            Swipe your way to a lighter camera roll.
          </h1>
          <p className="mb-8">Hi there,</p>
          <p className="mb-8">
            I built Swipe Go for anyone who has a camera roll full of
            screenshots, duplicates, and moments they forgot to revisit. It is a
            small, quiet tool for keeping the photos that still feel like you.
          </p>
          <p className="mb-8">
            The rules are simple: swipe right to keep a photo, swipe left to let
            it go. That&apos;s it. No folders to organize, no endless settings,
            and no pressure to get through everything at once.
          </p>
          <p className="mb-8">
            When you have a spare minute, open Swipe Go and make a few
            decisions. The photos worth remembering stay close. The rest
            disappear with a satisfying little gesture.
          </p>
          <p className="mb-8">
            Your gallery should feel like a collection of memories, not a
            storage unit. Swipe Go helps you get there one swipe at a time.
          </p>
          <p>That&apos;s all. I hope you like it.</p>
        </section>

        <section id="download" className="pt-10 sm:pt-11">
          <div>
            <Link
              href={APP_STORE_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="bg-primary text-primary-foreground hover:bg-primary/90 flex items-center justify-center gap-3 rounded-full px-6 py-3.5 text-[15px] font-medium transition-colors sm:px-7"
            >
              <AppleLogoIcon weight="fill" className="size-[18px]" />
              Download for iPhone
              <ArrowUpRightIcon className="size-4" />
            </Link>
          </div>
        </section>

        <SiteFooter />
      </div>
    </main>
  );
}
