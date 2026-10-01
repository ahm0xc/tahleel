import Image from "next/image";

import { cn } from "@/lib/utils";

const LOGO_WIDTH = 581;
const LOGO_HEIGHT = 124;

type BrandLogoProps = {
  className?: string;
  height?: number;
  priority?: boolean;
};

export function BrandLogo({
  className,
  height = 28,
  priority = false,
}: BrandLogoProps) {
  const width = Math.round((LOGO_WIDTH / LOGO_HEIGHT) * height);

  return (
    <span
      className={cn("relative inline-block shrink-0", className)}
      style={{ height, width }}
    >
      <Image
        src="/logo-light.png"
        alt="Tahleel"
        width={width}
        height={height}
        priority={priority}
        className="absolute inset-0 size-full dark:hidden"
      />
      <Image
        src="/logo-dark.png"
        alt=""
        aria-hidden
        width={width}
        height={height}
        className="absolute inset-0 hidden size-full dark:block"
      />
    </span>
  );
}
