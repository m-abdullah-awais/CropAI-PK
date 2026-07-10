"use client";

import Link from "next/link";
import { ArrowRight, Sprout, LineChart, RefreshCw, Leaf } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { HealthBadge } from "@/components/common/health-badge";
import { SoilHorizon } from "@/components/common/soil-horizon";
import { cn } from "@/lib/utils";
import { useT } from "@/lib/i18n/provider";

type Accent = "recommend" | "yield" | "rotation";

const ACCENT: Record<
  Accent,
  { chip: string; bar: string; hover: string; cta: string }
> = {
  recommend: {
    chip: "bg-tool-recommend/10 text-tool-recommend group-hover:bg-tool-recommend group-hover:text-primary-foreground",
    bar: "bg-tool-recommend",
    hover: "hover:border-tool-recommend/40 hover:ring-tool-recommend/15",
    cta: "text-tool-recommend",
  },
  yield: {
    chip: "bg-tool-yield/10 text-tool-yield group-hover:bg-tool-yield group-hover:text-primary-foreground",
    bar: "bg-tool-yield",
    hover: "hover:border-tool-yield/40 hover:ring-tool-yield/15",
    cta: "text-tool-yield",
  },
  rotation: {
    chip: "bg-tool-rotation/10 text-tool-rotation group-hover:bg-tool-rotation group-hover:text-primary-foreground",
    bar: "bg-tool-rotation",
    hover: "hover:border-tool-rotation/40 hover:ring-tool-rotation/15",
    cta: "text-tool-rotation",
  },
};

export default function Home() {
  const t = useT();

  const tools: {
    href: string;
    title: string;
    description: string;
    icon: typeof Sprout;
    cta: string;
    accent: Accent;
  }[] = [
    { href: "/recommend", title: t.home.recTitle, description: t.home.recDesc, icon: Sprout, cta: t.home.recCta, accent: "recommend" },
    { href: "/yield", title: t.home.yldTitle, description: t.home.yldDesc, icon: LineChart, cta: t.home.yldCta, accent: "yield" },
    { href: "/rotation", title: t.home.rotTitle, description: t.home.rotDesc, icon: RefreshCw, cta: t.home.rotCta, accent: "rotation" },
  ];

  const stats: { value: string; label: string; bar: string }[] = [
    { value: "21", label: t.home.statCrops, bar: "bg-tool-recommend" },
    { value: "31", label: t.home.statYield, bar: "bg-tool-yield" },
    { value: "1961-2024", label: t.home.statYears, bar: "bg-tool-rotation" },
    { value: "3", label: t.home.statLangs, bar: "bg-accent" },
  ];

  return (
    <div className="overflow-hidden">
      {/* Hero: the headline is planted above a soil cross-section. */}
      <section className="relative">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-95 bg-[radial-gradient(60%_55%_at_50%_0%,hsl(142_44%_30%/0.08),transparent)]"
        />
        <div className="mx-auto max-w-6xl px-4 pt-14 pb-36 text-center sm:pt-20 sm:pb-44">
          <Badge variant="success" className="mx-auto">
            <Leaf className="size-3.5" /> {t.home.badge}
          </Badge>
          <h1 className="font-display mx-auto mt-5 max-w-3xl text-balance text-5xl font-semibold leading-[1.05] tracking-tight sm:text-6xl">
            {t.home.title}
          </h1>
          <p className="mx-auto mt-5 max-w-2xl text-pretty text-lg text-muted-foreground">
            {t.home.subtitle}
          </p>
          <div className="mt-7 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
            <Link
              href="/recommend"
              className={cn(buttonVariants({ size: "lg" }), "shadow-e2")}
            >
              {t.home.cta}
              <ArrowRight className="rtl:rotate-180" />
            </Link>
            <HealthBadge />
          </div>
        </div>
        <SoilHorizon variant="hero" />
      </section>

      <div className="mx-auto max-w-6xl px-4 pb-16">
        {/* Stats sit on the soil surface. */}
        <section className="relative z-10 -mt-16 grid grid-cols-2 gap-3 sm:-mt-20 sm:grid-cols-4">
          {stats.map((s) => (
            <div
              key={s.label}
              className="relative overflow-hidden rounded-xl border border-border/70 bg-card px-4 py-4 text-center shadow-e1"
            >
              <span className={cn("absolute inset-x-0 top-0 h-0.5", s.bar)} />
              <div className="font-mono text-2xl font-semibold tabular-nums tracking-tight text-foreground sm:text-3xl">
                {s.value}
              </div>
              <div className="mt-1 text-xs text-muted-foreground">{s.label}</div>
            </div>
          ))}
        </section>

        {/* Tool cards, each with its own identity. */}
        <section className="mt-14 grid gap-5 md:grid-cols-3">
          {tools.map((tool, i) => {
            const a = ACCENT[tool.accent];
            return (
              <Link
                key={tool.href}
                href={tool.href}
                className="group animate-fade-in-up"
                style={{ animationDelay: `${i * 80}ms` }}
              >
                <Card
                  className={cn(
                    "relative h-full overflow-hidden ring-1 ring-transparent transition-all duration-200 hover:-translate-y-1 hover:shadow-e2 motion-reduce:hover:translate-y-0",
                    a.hover,
                  )}
                >
                  <span
                    aria-hidden
                    className={cn(
                      "absolute inset-x-0 top-0 h-1 origin-left scale-x-0 transition-transform duration-200 group-hover:scale-x-100 motion-reduce:transition-none",
                      a.bar,
                    )}
                  />
                  <CardContent className="flex h-full flex-col p-6 pt-7">
                    <span
                      className={cn(
                        "flex size-12 items-center justify-center rounded-xl transition-colors",
                        a.chip,
                      )}
                    >
                      <tool.icon className="size-6" />
                    </span>
                    <h2 className="mt-4 text-lg font-semibold">{tool.title}</h2>
                    <p className="mt-2 flex-1 text-sm text-muted-foreground">
                      {tool.description}
                    </p>
                    <span
                      className={cn(
                        "mt-4 inline-flex items-center gap-1 text-sm font-medium",
                        a.cta,
                      )}
                    >
                      {tool.cta}
                      <ArrowRight className="size-4 transition-transform group-hover:translate-x-1 rtl:rotate-180 rtl:group-hover:-translate-x-1 motion-reduce:transition-none" />
                    </span>
                  </CardContent>
                </Card>
              </Link>
            );
          })}
        </section>
      </div>
    </div>
  );
}
