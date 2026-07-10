"use client";

import Link from "next/link";
import { motion } from "motion/react";
import { ArrowRight, Sprout, LineChart, RefreshCw } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Stagger, StaggerItem } from "@/components/motion/reveal";
import { cn } from "@/lib/utils";
import { useT } from "@/lib/i18n/provider";

type Accent = "recommend" | "yield" | "rotation";

const ACCENT: Record<Accent, { chip: string; bar: string; hover: string; cta: string }> = {
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

// The three tools as entry-point cards. Same identity treatment as before, now living
// on the dashboard rather than a marketing home.
export function QuickActions() {
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

  return (
    <Stagger className="grid gap-5 md:grid-cols-3">
      {tools.map((tool) => {
        const a = ACCENT[tool.accent];
        return (
          <StaggerItem key={tool.href} className="h-full">
            <motion.div
              whileHover={{ y: -4 }}
              transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
              className="h-full"
            >
              <Link href={tool.href} className="group block h-full">
                <Card
                  className={cn(
                    "relative h-full overflow-hidden ring-1 ring-transparent transition-[box-shadow,border-color] duration-200 hover:shadow-e2",
                    a.hover,
                  )}
                >
                  <span
                    aria-hidden
                    className={cn(
                      "absolute inset-x-0 top-0 h-1 origin-left scale-x-0 transition-transform duration-300 group-hover:scale-x-100 motion-reduce:transition-none",
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
                    <h3 className="mt-4 text-lg font-semibold">{tool.title}</h3>
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
            </motion.div>
          </StaggerItem>
        );
      })}
    </Stagger>
  );
}
