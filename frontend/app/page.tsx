"use client";

import Link from "next/link";
import { ArrowRight, Sprout, LineChart, RefreshCw, Leaf } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { HealthBadge } from "@/components/common/health-badge";
import { cn } from "@/lib/utils";
import { useT } from "@/lib/i18n/provider";

export default function Home() {
  const t = useT();

  const tools = [
    { href: "/recommend", title: t.home.recTitle, description: t.home.recDesc, icon: Sprout, cta: t.home.recCta },
    { href: "/yield", title: t.home.yldTitle, description: t.home.yldDesc, icon: LineChart, cta: t.home.yldCta },
    { href: "/rotation", title: t.home.rotTitle, description: t.home.rotDesc, icon: RefreshCw, cta: t.home.rotCta },
  ];

  const stats = [
    { value: "22", label: t.home.statCrops },
    { value: "13", label: t.home.statYield },
    { value: "1961-2024", label: t.home.statYears },
    { value: "3", label: t.home.statLangs },
  ];

  return (
    <div className="relative overflow-hidden">
      {/* soft ambient background */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-[420px] bg-[radial-gradient(60%_60%_at_50%_0%,hsl(142_44%_30%/0.10),transparent)]"
      />

      <div className="mx-auto max-w-6xl px-4 py-12 sm:py-16">
        <section className="text-center">
          <Badge variant="success" className="mx-auto">
            <Leaf className="size-3.5" /> {t.home.badge}
          </Badge>
          <h1 className="mx-auto mt-4 max-w-3xl text-balance text-4xl font-bold tracking-tight sm:text-5xl">
            {t.home.title}
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-balance text-lg text-muted-foreground">
            {t.home.subtitle}
          </p>
          <div className="mt-6 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
            <Link href="/recommend" className={cn(buttonVariants({ size: "lg" }))}>
              {t.home.cta} <ArrowRight />
            </Link>
            <HealthBadge />
          </div>
        </section>

        <section className="mx-auto mt-10 grid max-w-3xl grid-cols-2 gap-3 sm:grid-cols-4">
          {stats.map((s) => (
            <div
              key={s.label}
              className="rounded-xl border bg-card/60 px-4 py-3 text-center"
            >
              <div className="text-xl font-bold tracking-tight text-primary sm:text-2xl">
                {s.value}
              </div>
              <div className="mt-0.5 text-xs text-muted-foreground">{s.label}</div>
            </div>
          ))}
        </section>

        <section className="mt-12 grid gap-5 md:grid-cols-3">
          {tools.map((tool, i) => (
            <Link
              key={tool.href}
              href={tool.href}
              className="group animate-fade-in-up"
              style={{ animationDelay: `${i * 80}ms` }}
            >
              <Card className="h-full transition-all hover:-translate-y-1 hover:border-primary/40 hover:shadow-md">
                <CardContent className="flex h-full flex-col p-6">
                  <span className="flex size-12 items-center justify-center rounded-xl bg-primary/10 text-primary transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
                    <tool.icon className="size-6" />
                  </span>
                  <h2 className="mt-4 text-lg font-semibold">{tool.title}</h2>
                  <p className="mt-2 flex-1 text-sm text-muted-foreground">
                    {tool.description}
                  </p>
                  <span className="mt-4 inline-flex items-center gap-1 text-sm font-medium text-primary">
                    {tool.cta}
                    <ArrowRight className="size-4 transition-transform group-hover:translate-x-1 rtl:group-hover:-translate-x-1 rtl:rotate-180" />
                  </span>
                </CardContent>
              </Card>
            </Link>
          ))}
        </section>
      </div>
    </div>
  );
}
