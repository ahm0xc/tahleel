import type { ReactNode } from "react";

import type { Metadata } from "next";

import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";

export const metadata: Metadata = {
  title: "Account Deletion",
  description:
    "How to request deletion of your Tahleel account and all of the data attached to it.",
};

const DELETION_EMAIL = "tahleelapp@gmail.com";

const steps = [
  "Open the email app on your phone or your computer.",
  "Start a new message and address it to the address shown above.",
  "Say clearly that it is a request to delete your Tahleel account, and include the email address you sign in to Tahleel with.",
  "Send the message. You do not need to sign in to anything on this website, because Tahleel has no password to reset.",
];

const whatWeDelete = [
  "Your sign-in account, including your name, email address, and profile photo.",
  "All of your reading history: every day, your daily goal, your verses read, your hasanaat, and the time you spent reading.",
  "Your streaks, both your current and your longest.",
  "Every friend connection, and your invite code.",
  "The push notification token for your device.",
];

const whatStaysOnDevice = [
  "Your reading position and the verse you stopped on.",
  "The verses you saved as favourites.",
  "Your script, translation, and font size preferences.",
  "The first name you typed during setup.",
  "Cached copies of your streaks and history.",
];

interface Section {
  title: string;
  paragraphs?: readonly ReactNode[];
  list?: readonly ReactNode[];
  steps?: readonly ReactNode[];
}

const sections: readonly Section[] = [
  {
    title: "How to request deletion",
    paragraphs: [
      "Tahleel is deleted by email, handled by a person rather than a button. It takes four steps and you can do all of them from your own mail app.",
    ],
    steps,
  },
  {
    title: "What to include in your message",
    list: [
      <>
        <strong className="text-foreground">
          The email address you sign in to Tahleel with.
        </strong>{" "}
        This is how we find your account. It is the address you use with Apple
        or Google.
      </>,
      <>
        <strong className="text-foreground">The word “delete”</strong>, so your
        message is not mistaken for feedback or support.
      </>,
      <>
        <strong className="text-foreground">Your first name</strong>, if you
        remember it. It helps us tell two similar addresses apart.
      </>,
    ],
  },
  {
    title: "What happens next",
    paragraphs: [
      "We read every deletion request ourselves. If we need to confirm that the request really came from the account holder, we will reply to you and ask before we delete anything.",
      "Once the request is confirmed, we delete the account and everything attached to it. We will let you know when it is done.",
    ],
  },
  {
    title: "What we delete",
    list: whatWeDelete,
  },
  {
    title: "What stays on your device",
    paragraphs: [
      "Deleting your account does not reach into your phone. Everything below stays on your device until you remove the app.",
    ],
    list: whatStaysOnDevice,
  },
  {
    title: "What happens to your friends",
    paragraphs: [
      "Your name and photo disappear from your friends' lists straight away, and your daily totals stop counting. Nobody can reconnect to you, because your invite code is deleted too.",
    ],
  },
  {
    title: "How long it takes",
    paragraphs: [
      "We complete confirmed deletion requests within 30 days. Most take much less than that.",
      "Deletion cannot be undone. Once your account is gone, your reading history and hasanaat cannot be restored, so please make sure you do not want them before you send the request.",
    ],
  },
  {
    title: "Backups",
    paragraphs: [
      "Your data is removed from our live database immediately. Copies that exist in encrypted backups are kept only until those backups age out and are overwritten, which also happens within 30 days.",
    ],
  },
  {
    title: "Contact",
    paragraphs: [
      <>
        Podexpand LLC, Wyoming, United States. Send deletion requests, and any
        question about one, to{" "}
        <span className="text-foreground select-all">{DELETION_EMAIL}</span>.
      </>,
    ],
  },
];

export default function AccountDeletionPage() {
  return (
    <main className="bg-background text-foreground min-h-screen">
      <div className="mx-auto max-w-[780px] px-5 pb-16 sm:px-8">
        <SiteHeader />
        <header className="border-border border-b pt-14 pb-12 sm:pt-20">
          <h1 className="font-heading text-[clamp(2.25rem,5.5vw,4rem)] leading-[0.9] font-semibold tracking-[-0.07em]">
            Account Deletion
          </h1>
          <p className="text-muted-foreground mt-4 text-[14px]">
            How to delete your Tahleel account and all of the data attached to
            it.
          </p>
        </header>
        <article className="text-muted-foreground space-y-11 pt-12 text-[17px] leading-[1.65] tracking-[-0.015em] sm:pt-14">
          <p className="text-foreground">
            You can delete your Tahleel account and everything in it at any
            time. There is no fee, no waiting period, and no reason you have to
            give.
          </p>
          <div className="border-border bg-muted/50 rounded-lg border px-5 py-4 select-all">
            <p className="text-muted-foreground text-[12px] tracking-[0.08em] uppercase">
              Send your request to
            </p>
            <p className="text-foreground mt-1.5 text-[19px] font-medium break-all">
              {DELETION_EMAIL}
            </p>
          </div>
          {sections.map((section) => (
            <section key={section.title}>
              <h2 className="text-foreground mb-3 text-[19px] font-medium tracking-[-0.035em]">
                {section.title}
              </h2>
              <div className="space-y-4">
                {section.paragraphs?.map((paragraph, index) => (
                  <p key={index}>{paragraph}</p>
                ))}
                {section.steps && (
                  <ol className="space-y-2.5">
                    {section.steps.map((step, index) => (
                      <li key={index} className="flex gap-3">
                        <span className="text-muted-foreground/50 w-4 shrink-0 pt-1 text-[14px] tabular-nums">
                          {index + 1}.
                        </span>
                        <span>{step}</span>
                      </li>
                    ))}
                  </ol>
                )}
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
