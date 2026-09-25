import Link from "next/link";

export function SiteFooter() {
  return (
    <footer className="border-border text-muted-foreground mt-20 flex items-center justify-between border-t pt-6 text-[12px] sm:mt-28">
      <span>© 2026 Swipe Go</span>
      <div className="flex items-center gap-5">
        <Link
          href="/privacy"
          className="hover:text-foreground transition-colors"
        >
          Privacy Policy
        </Link>
        <Link href="/terms" className="hover:text-foreground transition-colors">
          Terms
        </Link>
      </div>
    </footer>
  );
}
