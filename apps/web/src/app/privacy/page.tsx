import type { ReactNode } from "react";

import type { Metadata } from "next";

import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description:
    "What the Tahleel mobile app collects, why we collect it, and what you can do about it.",
};

const CONTACT_EMAIL = "tahleelapp@gmail.com";

interface Section {
  title: string;
  paragraphs?: readonly ReactNode[];
  list?: readonly ReactNode[];
}

const sections: readonly Section[] = [
  {
    title: "What this policy covers",
    paragraphs: [
      "This policy explains what information the Tahleel mobile app collects, why we collect it, and what you can do about it. Tahleel is made by Podexpand LLC.",
      "It covers the Tahleel app on iPhone and Android. It also covers the invite link pages at tahleel.ahm0xc.me/invite, because those pages exist only to let someone accept a friend request that you start in the app. It does not cover third-party apps or websites that we do not operate.",
    ],
  },
  {
    title: "Information you give us",
    list: [
      <>
        <strong className="text-foreground">Account details.</strong> Your first
        name, your email address, and your profile photo. These come from Apple
        or Google when you sign in, and you can change them in Settings. We are
        also given a unique user ID that connects your app activity to your
        account.
      </>,
      <>
        <strong className="text-foreground">Reading activity.</strong> For each
        day you use the app we store the calendar date on your device, your
        daily verse goal, how many verses you read, how many hasanaat you
        earned, how long you spent reading, and whether you finished your goal.
        We also keep your current streak, your longest streak, and the last day
        you completed a goal.
      </>,
      <>
        <strong className="text-foreground">Friends.</strong> The connections
        you make, stored as a pair of user IDs with the date you connected. We
        also generate a short invite code for you.
      </>,
      <>
        <strong className="text-foreground">Push notifications.</strong> A
        device token from Expo, and whether you use iPhone or Android. This is
        how a notification reaches your phone and nobody else.
      </>,
      <>
        <strong className="text-foreground">
          Information you choose to send.
        </strong>{" "}
        When you send feedback or request account deletion, the app prepares an
        email draft containing your name, your email address, your user ID, the
        app version, your platform, your OS version, and your device model. The
        email is not sent until you send it.
      </>,
    ],
  },
  {
    title: "Your Quran reading stays on your phone",
    paragraphs: [
      "The Quranic text, the translations, and the fonts are bundled inside the app. They work with no internet connection at all.",
      "We never receive which ayahs you actually read. We receive a number. We do not see the verse text, your translation choice, your reading position, or your saved verses, and none of that ever leaves your device.",
      "Your reading position, saved verses, script and font preferences, and the first name you type during setup are stored only on your device.",
    ],
  },
  {
    title: "What your friends can see",
    list: [
      "People you have connected with can see your display name, your profile photo, and today's hasanaat total.",
      "They cannot see which verses you read, how long you read for, your streaks, or your email address.",
      "Your display name is your full name, your first and last name, or your username. If you have not set any of those, it is shown as “Tahleel user”.",
    ],
  },
  {
    title: "Invite links are visible to anyone who has them",
    paragraphs: [
      "Each invite link contains a random code. When someone opens your link, our server shows them your display name so they know who invited them. This happens even if they have not signed in.",
      "Your display name is therefore visible to anyone who has your link. Your profile photo is not shown on the invite page.",
      "There is currently no way to rotate your invite code, so treat a link you have shared as lasting for as long as your account exists. If you have posted it somewhere public, you can stop sharing it and remove the app.",
    ],
  },
  {
    title: "What we do not collect",
    list: [
      "We do not collect your location, your contacts, your camera or microphone input, your photos library, your advertising identifier, your browsing history, or your messages.",
      "We do not run advertising. We do not sell your information, and we do not share it for cross-context behavioural advertising.",
      "We do not collect analytics, and we do not collect crash reports. We do not track you inside the app or outside it.",
      "Tahleel is free. We never ask for payment details or card information.",
    ],
  },
  {
    title: "How we use your information",
    paragraphs: [
      "Under the GDPR and UK GDPR we must have a lawful reason for each use. We rely on these:",
    ],
    list: [
      <>
        <strong className="text-foreground">To run your account</strong> and
        show your streak, your hasanaat, and your progress. This is necessary to
        provide the service you asked for.
      </>,
      <>
        <strong className="text-foreground">
          To show friends their leaderboard.
        </strong>{" "}
        This is our legitimate interest. You can object and we will stop, as
        described below.
      </>,
      <>
        <strong className="text-foreground">To send push notifications</strong>{" "}
        that you agreed to receive. This is your consent, and you can withdraw
        it by turning notifications off.
      </>,
      <>
        <strong className="text-foreground">To keep the app secure</strong> and
        to investigate problems you report. This is our legitimate interest and,
        where relevant, our legal obligation.
      </>,
      <>
        <strong className="text-foreground">
          To answer privacy and deletion requests.
        </strong>{" "}
        This is our legal obligation.
      </>,
    ],
  },
  {
    title: "Service providers we rely on",
    list: [
      "Clerk, which handles sign-in and stores your account details.",
      "Neon, which hosts our Postgres database holding your reading history, friendships, and push token.",
      "Vercel, which hosts the app's backend and the website that hosts this page.",
      "Expo, which delivers push notifications and app updates.",
      "Apple and Google, which provide sign-in. They share the details listed above with us, and they also see that you used Tahleel.",
    ],
    paragraphs: [
      "The Quran fonts bundled in the app are works of the King Fahd Glorious Quran Printing Complex, Noto, and Hind Siliguri, used under their own licences.",
    ],
  },
  {
    title: "International transfers",
    paragraphs: [
      "Some of the providers above process data in the United States. Where personal data is transferred out of the European Economic Area or the United Kingdom, the transfer relies on that provider's standard transfer mechanisms, including the European Commission's Standard Contractual Clauses where they apply.",
    ],
  },
  {
    title: "How long we keep your data",
    list: [
      "While your account is open: your account details, your reading history, your streaks, and your friendships.",
      "Friendship records are deleted when you remove a friend. Your push token is deleted when your account is deleted.",
      "After you send an approved deletion request: within 30 days. Deleted data is removed from our live database, and then from backups as those backups age out.",
      "Emails you send us are kept for as long as we need them to handle your request and any follow-up.",
    ],
  },
  {
    title: "Your rights",
    paragraphs: [
      "If you are in the EEA, the UK, or Switzerland, you have the right to ask us to give you a copy of your data, correct it, delete it, restrict how we use it, object to our use of it, or receive it in a portable format. You can also withdraw consent at any time, which in practice means turning notifications off. You can appeal a decision, and we will respond within a reasonable time.",
      "Where we rely on legitimate interest, you can object and we will stop unless we have a compelling reason that overrides your objection. For the friends leaderboard, removing the connection stops the sharing immediately.",
      "If you are unhappy with how we handle your data, you can complain to your local data protection authority in the EEA, or to the Information Commissioner's Office at ico.org.uk in the UK.",
    ],
    list: [
      "In California, we do not sell or share personal information as those terms are defined by the CCPA/CPRA, so we do not honour a “Do Not Sell or Share My Personal Information” request through a dedicated link. You may still ask us to delete your data.",
      "In Colorado, Virginia, Connecticut, Utah, and any other state with a universal opt-out law, we honour an opt-out preference. We do not conduct targeted advertising, so there is nothing to opt out of.",
      "Other state privacy rights apply to residents of those states where they apply.",
    ],
  },
  {
    title: "Children",
    paragraphs: [
      "Tahleel is intended for a general audience and is not directed at children under 13.",
      "Because sign-in is handled by Apple or Google, we do not receive or verify your date of birth, so we do not know how old you are. If you are below the age at which you can lawfully consent to data processing where you live — 16 in much of the EU and the UK, 13 in the US — you should use Tahleel only with a parent or guardian, who supervises the account and agrees to these terms on your behalf. We do not knowingly collect personal data directly from children below that age.",
      "If you believe a child under 13 has created an account, email us and we will delete it.",
    ],
  },
  {
    title: "Security",
    list: [
      "Traffic between the app and our servers is encrypted in transit.",
      "Your session token is held in the iOS keychain and the Android keystore, not in ordinary app storage.",
      "The providers we rely on are established companies with their own security practices.",
      "No method of transmission or storage is completely secure, and we cannot guarantee absolute security.",
    ],
  },
  {
    title: "Deleting your account",
    paragraphs: [
      "You can request deletion from Settings, which opens a prefilled email to us. Once we confirm the request, we delete your account and its data within 30 days.",
      "That includes your Clerk account, all reading history, streaks and hasanaat, friendships, invite code, and push token. We cannot recover any of it afterwards, and people you were connected with will no longer see you.",
      "This process does not clear data already on your own device. Removing the app from your phone clears that.",
    ],
  },
  {
    title: "Changes to this policy",
    paragraphs: [
      "If we change this policy materially, we will update the date on this page and, where it matters, tell you in the app before the change takes effect. Continuing to use Tahleel after that means you accept the updated policy.",
    ],
  },
  {
    title: "Contact",
    paragraphs: [
      <>
        Podexpand LLC, Wyoming, United States. For any privacy question,
        request, or complaint, email{" "}
        <a
          className="text-foreground underline underline-offset-4"
          href={`mailto:${CONTACT_EMAIL}`}
        >
          {CONTACT_EMAIL}
        </a>
        .
      </>,
    ],
  },
];

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
            Effective date: October 2, 2026
          </p>
        </header>
        <article className="text-muted-foreground space-y-11 pt-12 text-[17px] leading-[1.65] tracking-[-0.015em] sm:pt-14">
          <p className="text-foreground">
            This policy covers the Tahleel mobile app for iPhone and Android. It
            is written to be read, not to be skimmed past.
          </p>
          {sections.map((section) => (
            <section key={section.title}>
              <h2 className="text-foreground mb-3 text-[19px] font-medium tracking-[-0.035em]">
                {section.title}
              </h2>
              <div className="space-y-4">
                {section.paragraphs?.map((paragraph, index) => (
                  <p key={index}>{paragraph}</p>
                ))}
                {section.list && (
                  <ul className="space-y-2.5">
                    {section.list.map((item, index) => (
                      <li key={index} className="flex gap-3">
                        <span className="text-muted-foreground/50 mt-1.5 size-1.5 shrink-0 rounded-full bg-current" />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </section>
          ))}
        </article>
        <SiteFooter />
      </div>
    </main>
  );
}
