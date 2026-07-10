"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Leaf, Menu } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { ThemeToggle } from "@/components/layout/theme-toggle";
import { LanguageSwitcher } from "@/components/layout/language-switcher";
import { useT } from "@/lib/i18n/provider";

function Brand() {
  return (
    <Link href="/" className="flex items-center gap-2 font-semibold">
      <span className="flex size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground shadow-e1">
        <Leaf className="size-5" />
      </span>
      <span className="text-lg tracking-tight">
        CropAI <span className="text-primary">PK</span>
      </span>
    </Link>
  );
}

export function Navbar() {
  const pathname = usePathname();
  const [open, setOpen] = React.useState(false);
  const t = useT();

  const links = [
    { href: "/", label: t.nav.dashboard },
    { href: "/recommend", label: t.nav.recommend },
    { href: "/yield", label: t.nav.yield },
    { href: "/rotation", label: t.nav.rotation },
  ];

  const isActive = (href: string) =>
    href === "/" ? pathname === "/" : pathname.startsWith(href);

  return (
    <header className="sticky top-0 z-40 border-b bg-background/80 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4">
        <Brand />

        <nav className="hidden items-center gap-1 md:flex">
          {links.map((l) => {
            const active = isActive(l.href);
            return (
              <Link
                key={l.href}
                href={l.href}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "relative rounded-md px-3 py-2 text-sm font-medium transition-colors",
                  "after:absolute after:inset-x-3 after:bottom-1 after:h-0.5 after:rounded-full after:bg-primary after:transition-transform after:duration-200 after:content-[''] motion-reduce:after:transition-none",
                  active
                    ? "text-foreground after:scale-x-100"
                    : "text-muted-foreground hover:text-foreground after:scale-x-0 hover:after:scale-x-50",
                )}
              >
                {l.label}
              </Link>
            );
          })}
          <Separator orientation="vertical" className="mx-1 h-6" />
          <LanguageSwitcher />
          <ThemeToggle />
        </nav>

        <div className="flex items-center gap-1 md:hidden">
          <LanguageSwitcher />
          <ThemeToggle />
          <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" aria-label={t.nav.menu}>
                <Menu />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-72 p-0">
              <SheetHeader className="border-b">
                <SheetTitle className="text-start">
                  <Brand />
                </SheetTitle>
              </SheetHeader>
              <nav className="flex flex-col gap-1 p-3">
                {links.map((l) => {
                  const active = isActive(l.href);
                  return (
                    <SheetClose asChild key={l.href}>
                      <Link
                        href={l.href}
                        aria-current={active ? "page" : undefined}
                        className={cn(
                          "rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                          active
                            ? "bg-secondary text-secondary-foreground"
                            : "text-muted-foreground hover:bg-secondary/60 hover:text-foreground",
                        )}
                      >
                        {l.label}
                      </Link>
                    </SheetClose>
                  );
                })}
              </nav>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
