import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";

const sections = [
  [
    "Using Swipe Go",
    <p key="use">
      You may use Swipe Go only in compliance with these Terms and applicable
      law. You are responsible for the device, Apple account, and permissions
      needed to use the app. You must not misuse the service, interfere with its
      operation, attempt unauthorized access, or use it to violate another
      person&apos;s rights.
    </p>,
  ],
  [
    "Your photos and videos",
    <p key="photos">
      Swipe Go accesses photos and videos only with your permission. The app is
      designed to process this content on your device. Swipe Go does not claim
      ownership of your content. You are responsible for reviewing items marked
      for deletion and confirming deletion through your device when you are
      ready.
    </p>,
  ],
  [
    "Accounts",
    <p key="accounts">
      Swipe Go requires Sign in with Apple. You are responsible for maintaining
      access to your Apple account and for activity associated with your Swipe
      Go account. If you believe your account has been used without permission,
      contact{" "}
      <a
        className="underline underline-offset-4"
        href="mailto:swipegoapp@gmail.com"
      >
        swipegoapp@gmail.com
      </a>
      .
    </p>,
  ],
  [
    "Free and premium versions",
    <p key="free">
      Swipe Go may offer a free version supported by advertising. The free
      version may also limit access to certain features. We may offer a paid
      subscription through Apple&apos;s App Store that removes ads and unlocks
      additional features, which may include advanced cleanup tools and
      customization. The exact features available in each version may change
      over time.
    </p>,
  ],
  [
    "Subscriptions and free trials",
    <p key="subscriptions">
      Apple handles billing, payment, renewal, cancellation, and refunds for
      Swipe Go subscriptions and free trials. The applicable price, trial
      period, renewal terms, and other purchase details are shown in the App
      Store or purchase flow before you subscribe. You can manage or cancel
      subscriptions through your Apple account settings.
    </p>,
  ],
  [
    "Intellectual property",
    <p key="property">
      Swipe Go, including its software, design, branding, text, and other
      materials, is owned by Podexpand LLC or its licensors. These Terms give
      you a limited, personal, non-transferable license to use the app for its
      intended purpose. No other rights are granted.
    </p>,
  ],
  [
    "Availability and disclaimers",
    <p key="availability">
      Swipe Go is provided on an “as available” basis. To the maximum extent
      permitted by law, Podexpand LLC disclaims warranties that the app will
      always be available, error-free, or meet every expectation. You should
      keep your own backups of important photos and videos. Swipe Go should not
      be your only copy of important content.
    </p>,
  ],
  [
    "Limitation of liability",
    <p key="liability">
      To the maximum extent permitted by law, Podexpand LLC will not be liable
      for indirect, incidental, special, consequential, or exemplary damages, or
      for loss of data, profits, or opportunities arising from your use of or
      inability to use Swipe Go. Nothing in these Terms limits liability that
      cannot legally be limited.
    </p>,
  ],
  [
    "Changes and termination",
    <p key="termination">
      We may change, suspend, or discontinue features of Swipe Go at any time.
      We may suspend or terminate access if you materially violate these Terms
      or if necessary to protect the service or its users. We may update these
      Terms as the app changes; continued use after an update means you accept
      the revised Terms.
    </p>,
  ],
  [
    "Governing law and contact",
    <>
      <p key="law">
        These Terms are governed by the laws of the State of Wyoming, without
        regard to conflict-of-law rules.
      </p>
      <p key="contact">
        Questions about these Terms can be sent to{" "}
        <a
          className="underline underline-offset-4"
          href="mailto:swipegoapp@gmail.com"
        >
          swipegoapp@gmail.com
        </a>
        .
      </p>
    </>,
  ],
] as const;

export default function TermsPage() {
  return (
    <main className="bg-background text-foreground min-h-screen">
      <div className="mx-auto max-w-[780px] px-5 pb-16 sm:px-8">
        <SiteHeader />
        <header className="border-border border-b pt-14 pb-12 sm:pt-20">
          <h1 className="font-heading text-[clamp(2.25rem,5.5vw,4rem)] leading-[0.9] font-semibold tracking-[-0.07em]">
            Terms of Use
          </h1>
          <p className="text-muted-foreground mt-4 text-[14px]">
            Effective September 21, 2026
          </p>
        </header>
        <article className="text-muted-foreground space-y-11 pt-12 text-[17px] leading-[1.65] tracking-[-0.015em] sm:pt-14">
          <p className="text-foreground">
            These Terms of Use govern your use of Swipe Go, provided by
            Podexpand LLC. By using Swipe Go, you agree to these Terms.
          </p>
          {sections.map(([title, body]) => (
            <section key={title}>
              <h2 className="text-foreground mb-3 text-[19px] font-medium tracking-[-0.035em]">
                {title}
              </h2>
              <div className="space-y-4">{body}</div>
            </section>
          ))}
        </article>
        <SiteFooter />
      </div>
    </main>
  );
}
