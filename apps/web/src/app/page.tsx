import { DownloadCta } from "@/components/download-cta";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";

export default function Home() {
  return (
    <main className="bg-background text-foreground selection:text-background min-h-screen selection:bg-emerald-200 dark:selection:bg-emerald-900">
      <div className="mx-auto max-w-[780px] px-5 pb-12 sm:px-8 sm:pb-16">
        <SiteHeader />

        <section id="top" className="pt-8 sm:pt-11">
          <div className="border-border bg-card relative flex aspect-[1.35] flex-col items-center justify-center gap-4 overflow-hidden rounded-[23px] border px-8 text-center shadow-[0_16px_60px_rgba(0,0,0,0.25)] sm:rounded-[25px]">
            <div
              aria-hidden
              className="pointer-events-none absolute inset-0 bg-[radial-gradient(120%_90%_at_50%_0%,rgb(16_185_129/0.18),transparent_65%)] dark:bg-[radial-gradient(120%_90%_at_50%_0%,rgb(16_185_129/0.28),transparent_65%)]"
            />
            <p className="font-heading relative text-[clamp(2.5rem,9vw,4.25rem)] leading-[0.9] font-semibold tracking-[-0.06em]">
              Tahleel
            </p>
            <p className="text-muted-foreground relative max-w-[30ch] text-[15px] leading-[1.5] tracking-[-0.02em] sm:text-[16px]">
              Read a little Quran, every day.
            </p>
          </div>
        </section>

        <section
          id="story"
          className="text-muted-foreground pt-14 text-[18px] leading-[1.65] tracking-[-0.02em] sm:pt-16 sm:text-[19px] sm:leading-[1.62]"
        >
          <h1 className="text-foreground mb-8 text-[19px] font-medium tracking-[-0.035em] sm:text-[20px]">
            A few verses a day, and a reason to keep going.
          </h1>
          <p className="mb-8">Hi there,</p>
          <p className="mb-8">
            I built Tahleel for anyone who loves the Quran but never seems to
            find the time for it. It is a small, quiet app for reading a little
            every day, the way you would read a few pages of a book you never
            want to put down.
          </p>
          <p className="mb-8">
            Open the app and scroll. Verses move at your own pace, with the
            translation right underneath. There is nothing to set up, no plan to
            choose, and no guilt when a day slips away. You read what you can,
            and that is enough to keep the habit alive.
          </p>
          <p className="mb-8">
            Every ayah you read earns you hasanaat. Watch them add up slowly,
            until reading becomes the habit instead of the intention.
          </p>
          <p className="mb-8">
            Reading on your own is good. Reading alongside the people you care
            about is better. Add your friends, compare hasanaat, and see who is
            ahead of you this week.
          </p>
          <p className="mb-8">
            And if you want a little friendly pressure, there is a global
            ranking too. Every reader in the world, counted the same way, with
            nothing to skip and nothing to fake.
          </p>
          <p className="mb-8">
            The Quran was sent to be read, a little at a time. Tahleel is only
            here to help you keep showing up for it.
          </p>
          <p>That&apos;s all. I hope you like it.</p>
        </section>

        <section id="download" className="pt-10 sm:pt-11">
          <div>
            <DownloadCta className="px-6 py-3.5 text-[15px] sm:px-7" />
          </div>
        </section>

        <SiteFooter />
      </div>
    </main>
  );
}
