"use client";

import Link from "next/link";
import { Leaf } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { useT } from "@/lib/i18n/provider";

export function Footer() {
  const t = useT();
  const tools = [
    { href: "/recommend", label: t.nav.recommend },
    { href: "/yield", label: t.nav.yield },
    { href: "/rotation", label: t.nav.rotation },
  ];

  return (
    <footer className="mt-auto border-t bg-background">
      <div className="mx-auto max-w-6xl px-4 py-10">
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          <div className="lg:col-span-2">
            <div className="flex items-center gap-2 font-semibold text-foreground">
              <span className="flex size-7 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                <Leaf className="size-4" />
              </span>
              CropAI <span className="text-primary">PK</span>
            </div>
            <p className="mt-3 max-w-md text-sm text-muted-foreground">
              {t.footer.tagline}
            </p>
          </div>

          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              {t.footer.tools}
            </p>
            <ul className="mt-3 space-y-2 text-sm">
              {tools.map((l) => (
                <li key={l.href}>
                  <Link
                    href={l.href}
                    className="text-muted-foreground transition-colors hover:text-foreground"
                  >
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              {t.footer.dataSources}
            </p>
            <p className="mt-3 text-xs leading-relaxed text-muted-foreground">
              {t.footer.data}
            </p>
          </div>
        </div>

        <Separator className="my-6" />

        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            {t.footer.about}
          </p>
          <p className="mt-2 text-xs text-muted-foreground">
            {t.footer.madeBy}{" "}
            <span className="font-medium text-foreground">
              Muhammad Abdullah Awais
            </span>{" "}
            -{" "}
            <a
              href="https://abdullahawais.com"
              target="_blank"
              rel="noopener noreferrer"
              className="font-medium text-primary hover:underline"
            >
              abdullahawais.com
            </a>
          </p>
        </div>
      </div>
    </footer>
  );
}
