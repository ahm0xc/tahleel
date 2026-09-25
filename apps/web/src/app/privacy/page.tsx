import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";

const sections = [
  [
    "Information we collect",
    <>
      <p key="account">
        When you sign in with Apple, we receive and store the Apple user
        identifier needed to create and maintain your Swipe Go account. We do
        not need your Apple password.
      </p>
      <p key="local">
        Your photos, videos, swipe decisions, and deletion history stay on your
        device. Swipe Go does not upload your photos or videos to our servers.
      </p>
      <p key="analytics">
        We use PostHog for anonymous product analytics. Analytics events are not
        intentionally tied to your Swipe Go account, Apple user identifier,
        photos, or videos.
      </p>
    </>,
  ],
  [
    "How we use information",
    <>
      <p key="service">
        We use account information to authenticate you, provide access to Swipe
        Go, secure the service, and respond to support requests.
      </p>
      <p key="improve">
        We use anonymous analytics to understand product performance, identify
        issues, and improve the Swipe Go experience. We do not sell your
        personal information.
      </p>
    </>,
  ],
  [
    "Advertising",
    <p key="ads">
      The free version of Swipe Go may display ads provided by Google AdMob.
      AdMob may collect device, advertising, and usage information to deliver
      and measure personalized advertising, subject to your device settings,
      applicable permissions, and Google&apos;s own policies. Ads do not access,
      receive, or analyze your photos or videos. A paid subscription is intended
      to remove ads.
    </p>,
  ],
  [
    "Photos and videos",
    <p key="photos">
      Swipe Go requests access to your device photo library so you can review
      photos and videos. The app processes this content on your device. When you
      swipe left, Swipe Go marks the item for deletion; you remain in control of
      confirming or completing deletion through your device. We do not use your
      photos or videos for advertising, training, or any purpose unrelated to
      the app.
    </p>,
  ],
  [
    "Sharing and service providers",
    <p key="sharing">
      We share information only with service providers that help us operate
      Swipe Go, such as Apple for authentication and app distribution and
      PostHog for anonymous analytics. We may also disclose information when
      required by law, to protect the rights and safety of users or the service,
      or as part of a business transfer.
    </p>,
  ],
  [
    "Subscriptions and purchases",
    <p key="purchases">
      Swipe Go may offer a free, ad-supported version and paid subscriptions
      through Apple&apos;s App Store. A subscription may remove ads and unlock
      additional features such as advanced cleanup tools and customization.
      Subscriptions, free trials, payments, renewals, and refunds are processed
      by Apple. Apple&apos;s terms and policies apply to those transactions.
      Current pricing, duration, and renewal details are shown by Apple before
      you complete a purchase.
    </p>,
  ],
  [
    "Your choices and deletion requests",
    <p key="choices">
      You can manage photo-library permissions through your device settings. To
      request deletion of your Swipe Go account and associated account
      information, email{" "}
      <a
        className="underline underline-offset-4"
        href="mailto:swipegoapp@gmail.com"
      >
        swipegoapp@gmail.com
      </a>
      . Information may be retained where required by law or reasonably
      necessary for security, fraud prevention, or resolving disputes.
    </p>,
  ],
  [
    "Children",
    <p key="children">
      Swipe Go is intended to be usable by people of all ages. Children should
      use the app with the involvement and permission of a parent or guardian
      where required by applicable law. If you believe a child has provided
      personal information in a way that is not permitted, contact{" "}
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
    "Changes and contact",
    <>
      <p key="changes">
        We may update this Privacy Policy as Swipe Go changes. We will post the
        updated version on this page and update the effective date.
      </p>
      <p key="contact">
        Questions about privacy can be sent to{" "}
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

export default function PrivacyPage() {
  return (
    <main className="bg-background text-foreground min-h-screen">
      <div className="mx-auto max-w-[780px] px-5 pb-16 sm:px-8">
        <SiteHeader />
        <header className="border-border border-b pt-14 pb-12 sm:pt-20">
          <h1 className="font-heading text-[clamp(2.25rem,5.5vw,4rem)] leading-[0.9] font-semibold tracking-[-0.07em]">
            Privacy Policy
          </h1>
          <p className="text-muted-foreground mt-4 text-[14px]">
            Effective September 21, 2026
          </p>
        </header>
        <article className="text-muted-foreground space-y-11 pt-12 text-[17px] leading-[1.65] tracking-[-0.015em] sm:pt-14">
          <p className="text-foreground">
            Swipe Go is made by Podexpand LLC. This Privacy Policy explains what
            information we collect, how we use it, and the choices available to
            you when you use Swipe Go.
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
