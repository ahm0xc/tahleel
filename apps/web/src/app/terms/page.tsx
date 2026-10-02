import type { ReactNode } from "react";

import type { Metadata } from "next";

import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";

export const metadata: Metadata = {
  title: "Terms of Use",
  description:
    "The terms you agree to when you use the Tahleel mobile app, written in plain English.",
};

const CONTACT_EMAIL = "tahleelapp@gmail.com";

interface Section {
  title: string;
  paragraphs?: readonly ReactNode[];
  list?: readonly ReactNode[];
}

const sections: readonly Section[] = [
  {
    title: "What these terms cover",
    paragraphs: [
      "These Terms are an agreement between you and Podexpand LLC, a limited liability company registered in Wyoming, United States. They apply when you use the Tahleel mobile app for iPhone and Android.",
      "They also apply to the invite link pages at tahleel.ahm0xc.me/invite, which exist only to complete a friend request that you start in the app. They do not cover third-party apps and websites, including Apple's App Store and Google Play, which have their own terms.",
      "Our Privacy Policy is separate from these Terms and explains how we handle your information. If you do not accept these Terms, please do not use Tahleel.",
    ],
  },
  {
    title: "Eligibility",
    paragraphs: [
      "To sign in you need an Apple or Google account, because that is how the app knows who you are.",
      "Tahleel is intended for a general audience and is not directed at children under 13. If you are below the age at which you can lawfully consent to a contract where you live, use Tahleel only with a parent or guardian who agrees to these Terms and supervises the account.",
    ],
  },
  {
    title: "Your account",
    list: [
      "One account per person. Please do not create more than one.",
      "You are responsible for everything that happens under your account, including if you let someone else use it.",
      "If you think someone else has accessed your account, tell us straight away.",
      "You can change your name and profile photo in Settings. Your display name is shown to people you connect with, and to anyone who opens your invite link.",
      "We may suspend or close an account that breaks these Terms, or that we are required to close by law. Where we can, we will tell you why.",
    ],
  },
  {
    title: "Reading progress, streaks, and hasanaat",
    paragraphs: [
      "Your streak, your hasanaat total, and your daily verse goal are tracking features designed to help you read consistently.",
      "Hasanaat in Tahleel is a counter the app adds as you read. It is a motivational feature inside the app. It is not a religious ruling, it is not a measure of your standing before Allah, and it is not a promise of any reward. Podexpand LLC is not qualified to issue religious rulings, and nothing in the app should be read as one.",
      "Progress is tied to the calendar date on your device. If you change your device's date or time zone, your streak may be affected. We may change how these features work in future versions, though we will not erase history already recorded for you.",
    ],
  },
  {
    title: "The Quranic text, translations, and religious content",
    paragraphs: [
      "The app bundles published Quranic text and translations. Attribution for the translators and fonts is included in the app.",
      "Translations are the work of particular scholars. Differences between translations are normal and sometimes meaningful.",
      "Tahleel is not a religious authority. We are not scholars of Islam, we do not issue fatwas, and we cannot confirm whether a reading, a translation, or a ruling is correct. Please check the Arabic text and consult a qualified scholar or a reliable printed mushaf for anything that matters to your faith or your practice.",
      "The bundled text may contain typographical or technical errors. If you find one, please tell us so we can look at it.",
    ],
  },
  {
    title: "Friends and leaderboards",
    list: [
      "You choose who to connect with, by sharing an invite code. Connecting does not share your contacts, your email address, or your reading activity beyond what is listed here.",
      "People you connect with can see your display name, your profile photo, and today's hasanaat. You can remove them at any time, and they can remove you.",
      "Invite links are not secret once you share them. Anyone who has yours can see your display name, even without an account. Please do not post your invite link somewhere public, and do not use an invite code that is not yours.",
      "We may add, change, or remove leaderboards, and we may change which numbers are shown on them.",
    ],
  },
  {
    title: "Acceptable use",
    list: [
      "Do not use Tahleel to break the law, or to harass, threaten, or abuse anyone.",
      "Do not use Tahleel to send or publish content that is unlawful, or that infringes someone else's rights.",
      "Do not attack the app or the people running it. No scraping, no automated abuse, no reverse engineering except where the law expressly allows it, no disrupting the service, and no uploading malicious code.",
      "Do not misrepresent who you are, or who invited you.",
      "Do not resell access to Tahleel or use it as part of a product you sell.",
    ],
  },
  {
    title: "Your content",
    paragraphs: [
      "The app is yours to read in. We claim no ownership of your account or your reading activity.",
      "If you send us feedback, screenshots, or ideas, you give us permission to use them to improve Tahleel without restriction and without payment to you. You confirm that you have the right to send us whatever you send.",
      "We claim no ownership of the Quranic text. The translations, fonts, and other bundled materials belong to their respective owners and are used under their own licences.",
    ],
  },
  {
    title: "Our intellectual property",
    paragraphs: [
      "Tahleel, the name, the logo, the design, and the app code belong to Podexpand LLC. Apple and Google licence us to distribute the app through their stores. That licence does not make Tahleel their property, and it does not give you any right to use our name or logo on your own project without permission.",
    ],
  },
  {
    title: "Third-party services",
    paragraphs: [
      "Apple and Google provide sign-in. If you use them, their terms and privacy policies govern that sign-in as well as ours.",
      "Expo provides push notification delivery and app updates.",
    ],
  },
  {
    title: "Availability and changes",
    paragraphs: [
      "We may add, change, suspend, or discontinue any feature of Tahleel, and we may change or withdraw the app entirely at any time.",
      "We do not promise a minimum level of uptime, or that any particular feature will remain available. Some parts of the app may still be in development.",
    ],
  },
  {
    title: "Disclaimers",
    paragraphs: [
      "Tahleel and this service are provided “as is” and “as available”. To the fullest extent the law allows, Podexpand LLC disclaims all warranties, express or implied, including merchantability, fitness for a particular purpose, accuracy, and non-infringement.",
      "We do not guarantee that the app will be uninterrupted or error-free, nor that it will count your verses, letters, hasanaat, or streaks accurately. Those counts depend on how you use your device.",
      "Tahleel is not religious guidance, and it is not a substitute for scholarly advice or for professional advice of any kind, medical or otherwise.",
    ],
  },
  {
    title: "Limitation of liability",
    paragraphs: [
      "To the fullest extent the law allows, Podexpand LLC and anyone involved in building Tahleel will not be liable for indirect, incidental, special, consequential, or punitive damages, or for lost profits, lost data, or lost goodwill, arising out of your use of the app.",
      "We are not liable for your interactions with other users, or for any content you come across while using the app.",
      "Nothing in these Terms limits liability that cannot lawfully be limited, including liability for death or personal injury caused by negligence, or liability for fraud. Some jurisdictions do not allow certain exclusions, so parts of this section may not apply to you.",
    ],
  },
  {
    title: "Indemnity",
    paragraphs: [
      "To the extent the law allows, you agree to hold Podexpand LLC and its people harmless from any claim, demand, or loss arising out of your use of Tahleel or your breach of these Terms. This applies to anyone using your account.",
    ],
  },
  {
    title: "Ending this agreement",
    paragraphs: [
      "You can stop using Tahleel and delete your account at any time from Settings.",
      "We may suspend or end your access if you break these Terms, or if we are required to by law.",
      "Sections that by their nature should outlive the end of this agreement do survive it, including disclaimers, limitation of liability, indemnity, and governing law.",
    ],
  },
  {
    title: "Changes to these terms",
    paragraphs: [
      "We will update the date on this page whenever these Terms change. If a change is significant, we will tell you in the app before it takes effect.",
      "Continuing to use Tahleel after that means you accept the updated terms. If you do not accept them, delete your account and stop using the app.",
    ],
  },
  {
    title: "Governing law",
    paragraphs: [
      "These Terms are governed by the laws of the State of Wyoming, United States, without regard to its conflict of laws rules.",
      "Any dispute will be brought in the state or federal courts located in Wyoming, and you consent to that venue. Nothing here removes any right you have under the mandatory consumer law of the country where you live.",
    ],
  },
  {
    title: "Contact",
    paragraphs: [
      <>
        Podexpand LLC, Wyoming, United States. For any question about these
        Terms, email{" "}
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
            Effective date: October 2, 2026
          </p>
        </header>
        <article className="text-muted-foreground space-y-11 pt-12 text-[17px] leading-[1.65] tracking-[-0.015em] sm:pt-14">
          <p className="text-foreground">
            These Terms are written to be read. They apply to the Tahleel mobile
            app for iPhone and Android.
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
