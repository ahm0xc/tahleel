import type { Metadata } from "next";
import { Geist, Inter } from "next/font/google";

import { ThemeProvider } from "@/components/theme-provider";
import { SITE_URL } from "@/lib/constants";
import { cn } from "@/lib/utils";

import "./globals.css";

const geistHeading = Geist({ subsets: ["latin"], variable: "--font-heading" });

const inter = Inter({ subsets: ["latin"], variable: "--font-sans" });

const title = "Tahleel — Read a little Quran, every day";

const description =
  "Tahleel turns daily Quran reading into a habit. Scroll through a few verses each day, earn hasanaat as you read, and see how you stack up against your friends and the world.";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: title,
    template: "%s · Tahleel",
  },
  description,
  applicationName: "Tahleel",
  keywords: [
    "Quran",
    "Quran app",
    "read Quran",
    "daily Quran reading",
    "Quran habit",
    "hasanaat",
    "good deeds counter",
    "Quran reading streak",
    "Islamic app",
    "Tahleel",
  ],
  category: "lifestyle",
  openGraph: {
    type: "website",
    siteName: "Tahleel",
    title,
    description,
    url: "/",
  },
  twitter: {
    card: "summary",
    title,
    description,
  },
  robots: {
    index: true,
    follow: true,
  },
  formatDetection: {
    telephone: false,
  },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={cn(
        "h-full font-sans antialiased",
        inter.variable,
        geistHeading.variable
      )}
    >
      <body className="flex min-h-full flex-col">
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
