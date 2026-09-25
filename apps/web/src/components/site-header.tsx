import Image from "next/image";
import Link from "next/link";

import { APP_STORE_URL } from "@/lib/constants";
import { AppleLogoIcon } from "@phosphor-icons/react/dist/ssr";

export function SiteHeader() {
  return (
    <nav className="flex items-center justify-between py-7 sm:py-8">
      <Link href="/" aria-label="Swipe Go home">
        <Image
          src="/swipe-go-logo-light.png"
          alt="Swipe Go"
          width={123}
          height={30}
          priority
          className="h-[30px] w-auto dark:hidden"
        />
        <Image
          src="/swipe-go-logo.png"
          alt="Swipe Go"
          width={123}
          height={30}
          priority
          className="hidden h-[30px] w-auto dark:block"
        />
      </Link>
      <div className="flex items-center gap-4 sm:gap-7">
        <Link
          href="/changelog"
          className="text-muted-foreground hover:text-foreground text-[14px] transition-colors"
        >
          Changelog
        </Link>
        <Link
          href={APP_STORE_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="bg-primary text-primary-foreground hover:bg-primary/90 flex items-center gap-2 rounded-full px-4 py-2.5 text-[13px] font-medium transition-colors sm:px-5"
        >
          <AppleLogoIcon weight="fill" className="size-4" />
          <span className="hidden sm:inline">Download for iPhone</span>
          <span className="sm:hidden">Download</span>
        </Link>
      </div>
    </nav>
  );
}
