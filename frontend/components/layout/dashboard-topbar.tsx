"use client";

import { usePathname } from "next/navigation";
import { Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import { LanguageSwitcher } from "@/components/layout/language-switcher";
import { ThemeToggle } from "@/components/layout/theme-toggle";
import { useT } from "@/lib/i18n/provider";

// Sticky panel header. Left: mobile drawer trigger + a contextual page title derived
// from the route (breadcrumb-like). Right: language + theme controls.
export function DashboardTopBar({ onOpenMobile }: { onOpenMobile: () => void }) {
  const pathname = usePathname();
  const t = useT();

  const title =
    pathname.startsWith("/recommend")
      ? t.recommend.title
      : pathname.startsWith("/yield")
        ? t.yield.title
        : pathname.startsWith("/rotation")
          ? t.rotation.title
          : t.nav.dashboard;

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center gap-2 border-b border-hairline bg-background/80 px-4 backdrop-blur-lg sm:px-6">
      <Button
        variant="ghost"
        size="icon"
        onClick={onOpenMobile}
        aria-label={t.nav.menu}
        className="lg:hidden"
      >
        <Menu />
      </Button>

      <span className="truncate text-sm font-semibold tracking-tight text-foreground">
        {title}
      </span>

      <div className="ms-auto flex items-center gap-1">
        <LanguageSwitcher />
        <ThemeToggle />
      </div>
    </header>
  );
}
