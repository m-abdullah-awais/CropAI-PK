import Link from "next/link";
import { ArrowRight, Sprout, LineChart, RefreshCw, Leaf } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { HealthBadge } from "@/components/common/health-badge";
import { cn } from "@/lib/utils";

const TOOLS = [
  {
    href: "/recommend",
    title: "Crop Recommendation",
    description:
      "Enter soil nutrients and a location - get the best crops for your field, ranked by confidence, with live weather auto-filled.",
    icon: Sprout,
    cta: "Recommend a crop",
  },
  {
    href: "/yield",
    title: "Yield Prediction",
    description:
      "Estimate expected yield (t/ha) for major Pakistani crops, with a historical trend from FAO data.",
    icon: LineChart,
    cta: "Predict yield",
  },
  {
    href: "/rotation",
    title: "Rotation Planning",
    description:
      "Plan next season - which crops to follow with and which to avoid, based on Pakistani cropping systems.",
    icon: RefreshCw,
    cta: "Plan rotation",
  },
];

export default function Home() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-12 sm:py-16">
      <section className="text-center">
        <Badge variant="success" className="mx-auto">
          <Leaf className="size-3.5" /> Built for Pakistani agriculture
        </Badge>
        <h1 className="mx-auto mt-4 max-w-3xl text-balance text-4xl font-bold tracking-tight sm:text-5xl">
          Smarter decisions for every field
        </h1>
        <p className="mx-auto mt-4 max-w-2xl text-balance text-lg text-muted-foreground">
          AI-powered crop recommendation, yield prediction, and rotation
          planning - tuned for Pakistan&apos;s soils, crops, and climate.
        </p>
        <div className="mt-6 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
          <Link href="/recommend" className={cn(buttonVariants({ size: "lg" }))}>
            Get a recommendation <ArrowRight />
          </Link>
          <HealthBadge />
        </div>
      </section>

      <section className="mt-14 grid gap-5 md:grid-cols-3">
        {TOOLS.map((t, i) => (
          <Link
            key={t.href}
            href={t.href}
            className="group animate-fade-in-up"
            style={{ animationDelay: `${i * 80}ms` }}
          >
            <Card className="h-full transition-all hover:-translate-y-1 hover:border-primary/40 hover:shadow-md">
              <CardContent className="flex h-full flex-col p-6">
                <span className="flex size-12 items-center justify-center rounded-xl bg-primary/10 text-primary transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
                  <t.icon className="size-6" />
                </span>
                <h2 className="mt-4 text-lg font-semibold">{t.title}</h2>
                <p className="mt-2 flex-1 text-sm text-muted-foreground">
                  {t.description}
                </p>
                <span className="mt-4 inline-flex items-center gap-1 text-sm font-medium text-primary">
                  {t.cta}
                  <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" />
                </span>
              </CardContent>
            </Card>
          </Link>
        ))}
      </section>
    </div>
  );
}
