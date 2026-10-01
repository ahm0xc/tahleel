import Link from "next/link";

import { BrandLogo } from "@/components/brand-logo";
import { DownloadCta } from "@/components/download-cta";

export function SiteHeader() {
  return (
    <nav className="flex items-center justify-between py-7 sm:py-8">
      <Link href="/" aria-label="Tahleel home">
        <BrandLogo height={26} priority />
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
