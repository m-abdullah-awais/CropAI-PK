import Link from "next/link";
import { ArrowRight, CheckCircle2, Leaf, Sprout, XCircle } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { RotationResponse } from "@/lib/types";

function pretty(s: string) {
  return s.replace(/_/g, " ");
}

export function RotationCards({ data }: { data: RotationResponse }) {
  return (
    <div className="animate-fade-in-up space-y-5">
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <span className="flex size-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
                <Sprout className="size-5" />
              </span>
              <div>
                <h2 className="text-xl font-semibold">{data.display}</h2>
                <p className="text-sm text-muted-foreground capitalize">
                  {data.family}
                </p>
              </div>
            </div>
            <div className="flex flex-wrap gap-2">
              <Badge variant="secondary">{data.season} season</Badge>
              <Badge variant="accent" className="capitalize">
                <Leaf className="size-3" /> {pretty(data.nitrogen_role)}
              </Badge>
            </div>
          </div>
          <p className="mt-4 text-sm text-muted-foreground">{data.notes}</p>
        </CardContent>
      </Card>

      <div className="grid gap-5 sm:grid-cols-2">
        <Card className="border-primary/30">
          <CardContent className="p-5">
            <p className="flex items-center gap-2 font-medium text-primary">
              <CheckCircle2 className="size-4" /> Plant next season
            </p>
            <div className="mt-3 flex flex-wrap gap-2">
              {data.recommended_next.map((c) => (
                <Link
                  key={c.crop}
                  href={`/rotation?crop=${c.crop}`}
                  className="group inline-flex items-center gap-1 rounded-full border border-primary/30 bg-primary/5 px-3 py-1 text-sm font-medium text-primary transition-colors hover:bg-primary/15"
                >
                  {c.display}
                  <ArrowRight className="size-3 transition-transform group-hover:translate-x-0.5" />
                </Link>
              ))}
              {data.recommended_next.length === 0 && (
                <p className="text-sm text-muted-foreground">
                  No specific successors — see notes.
                </p>
              )}
            </div>
          </CardContent>
        </Card>

        <Card className="border-destructive/30">
          <CardContent className="p-5">
            <p className="flex items-center gap-2 font-medium text-destructive">
              <XCircle className="size-4" /> Avoid next season
            </p>
            <div className="mt-3 flex flex-wrap gap-2">
              {data.avoid_next.map((c) => (
                <span
                  key={c.crop}
                  className="inline-flex items-center rounded-full border border-destructive/30 bg-destructive/5 px-3 py-1 text-sm font-medium text-destructive"
                >
                  {c.display}
                </span>
              ))}
              {data.avoid_next.length === 0 && (
                <p className="text-sm text-muted-foreground">
                  Nothing specific to avoid.
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
