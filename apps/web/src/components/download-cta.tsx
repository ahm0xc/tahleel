import Link from "next/link";

import { APP_STORE_URL } from "@/lib/constants";
import { cn } from "@/lib/utils";
import { AppleLogoIcon } from "@phosphor-icons/react/dist/ssr";

const longLabel = APP_STORE_URL
  ? "Download for iPhone"
  : "Coming soon to iPhone";
const shortLabel = APP_STORE_URL ? "Download" : "Coming soon";

export function DownloadCta({
  short = false,
  className,
}: {
  short?: boolean;
  className?: string;
}) {
  const base =
    "bg-primary text-primary-foreground flex items-center justify-center gap-2 rounded-full font-medium";

  if (!APP_STORE_URL) {
    return (
      <span
        aria-disabled
        className={cn(base, "cursor-default opacity-65", className)}
      >
        <AppleLogoIcon weight="fill" className="size-4 shrink-0" />
        {short ? shortLabel : longLabel}
      </span>
    );
  }

  return (
    <Link
      href={APP_STORE_URL}
      target="_blank"
      rel="noopener noreferrer"
      className={cn(base, "hover:bg-primary/90 transition-colors", className)}
    >
      <AppleLogoIcon weight="fill" className="size-4 shrink-0" />
      {short ? shortLabel : longLabel}
    </Link>
  );
}
