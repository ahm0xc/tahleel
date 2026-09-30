import Link from "next/link";

import { DownloadCta } from "@/components/download-cta";

export function SiteHeader() {
  return (
    <nav className="flex items-center justify-between py-7 sm:py-8">
      <Link
        href="/"
        aria-label="Tahleel home"
        className="font-heading text-[22px] leading-none font-semibold tracking-[-0.04em]"
      >
        Tahleel
      </Link>
      <div className="flex items-center gap-4 sm:gap-7">
        <Link
          href="/changelog"
          className="text-muted-foreground hover:text-foreground text-[14px] transition-colors"
        >
          Changelog
        </Link>
        <DownloadCta short className="px-4 py-2.5 text-[13px] sm:px-5" />
      </div>
    </nav>
  );
}
