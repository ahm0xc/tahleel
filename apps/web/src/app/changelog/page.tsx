import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";

const release = {
  version: "1.0.0",
  date: "September 22, 2026",
  sections: [
    {
      title: "Gallery Cleanup",
      items: [
        "Swipe right to keep photos, swipe left to delete them.",
        "Browse your photo library by month, going back up to 5 years.",
        "Quick access to your 50 most recent photos.",
        "Review all deletion choices in a grid before confirming.",
        "Undo any swipe decision before you finalize.",
        "Images preloaded in the background for smooth transitions.",
      ],
    },
    {
      title: "Authentication",
      items: [
        "Sign in with Apple for a quick, secure account setup.",
        "Your credentials are stored securely on device.",
      ],
    },
    {
      title: "Getting Started",
      items: [
        "Two-step onboarding that explains how swiping works.",
        "Progress remembered so you only see it once.",
      ],
    },
    {
      title: "Notifications",
      items: [
        "Gentle reminders to come back and sort a few photos.",
        "Tap a notification to jump straight into the app.",
      ],
    },
    {
      title: "Settings",
      items: [
        "Send feedback directly from the app.",
        "Quick access to privacy policy and terms of use.",
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
