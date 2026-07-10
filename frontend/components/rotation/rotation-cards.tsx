"use client";

import * as React from "react";
import Link from "next/link";
import {
  ArrowRight,
  Ban,
  CalendarDays,
  CheckCircle2,
  Leaf,
  Snowflake,
  Sprout,
  Sun,
  TreePine,
  type LucideIcon,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { SoilHorizon } from "@/components/common/soil-horizon";
import { MountReveal, Stagger, StaggerItem } from "@/components/motion/reveal";
import type { RotationResponse } from "@/lib/types";
import { useI18n } from "@/lib/i18n/provider";

const SEASON_ICON: Record<string, LucideIcon> = {
  Kharif: Sun,
  Rabi: Snowflake,
  perennial: TreePine,
  spring: Sprout,
  annual: CalendarDays,
};

function Row({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-3 rounded-lg bg-secondary/50 px-3 py-2 text-sm">
      <span className="text-muted-foreground">{label}</span>
      <span className="inline-flex items-center gap-1.5 font-medium capitalize">
        {value}
      </span>
    </div>
  );
}

export function RotationIdentity({ data }: { data: RotationResponse }) {
  const { t, tCrop } = useI18n();
  const seasons = t.rotation.seasons as Record<string, string>;
  const roles = t.rotation.roles as Record<string, string>;
  const season = seasons[data.season] ?? data.season;
  const role =
    roles[data.nitrogen_role] ?? data.nitrogen_role.replace(/_/g, " ");
  const SeasonIcon = SEASON_ICON[data.season] ?? CalendarDays;

  return (
    <MountReveal>
      <Card className="overflow-hidden">
        <SoilHorizon variant="rule" accent="rotation" className="h-1.5 rounded-none" />
        <CardContent className="p-6">
        <div className="flex items-center gap-3">
          <span className="flex size-11 items-center justify-center rounded-xl bg-tool-rotation/10 text-tool-rotation">
            <Sprout className="size-5" />
          </span>
          <div>
            <h2 className="font-display text-xl font-semibold">
              {tCrop(data.crop, data.display)}
            </h2>
            <p className="text-sm capitalize text-muted-foreground">
              {data.family}
            </p>
          </div>
        </div>
        <div className="mt-5 space-y-2">
          <Row
            label={t.rotation.season}
            value={
              <>
                <SeasonIcon className="size-3.5 text-tool-rotation" /> {season}
              </>
            }
          />
          <Row
            label={t.rotation.role}
            value={
              <>
                <Leaf className="size-3.5 text-tool-rotation" /> {role}
              </>
            }
          />
        </div>
        <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
          {data.notes}
        </p>
        </CardContent>
      </Card>
    </MountReveal>
  );
}

export function RotationFlow({ data }: { data: RotationResponse }) {
  const { t, tCrop } = useI18n();
  return (
    <Stagger className="space-y-5">
      <StaggerItem>
        <Card className="overflow-hidden">
          <span aria-hidden className="block h-1 bg-tool-rotation" />
        <CardContent className="p-5">
          <p className="flex items-center gap-2 font-medium text-tool-rotation">
            <CheckCircle2 className="size-4" /> {t.rotation.recommended}
          </p>
          <div className="mt-4 flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-tool-rotation px-3 py-1 text-sm font-medium text-primary-foreground">
              <Sprout className="size-3.5" /> {tCrop(data.crop, data.display)}
            </span>
            <ArrowRight className="size-4 shrink-0 text-muted-foreground rtl:rotate-180" />
            {data.recommended_next.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {data.recommended_next.map((c) => (
                  <Link
                    key={c.crop}
                    href={`/rotation?crop=${c.crop}`}
                    className="group inline-flex items-center gap-1 rounded-full border border-tool-rotation/30 bg-tool-rotation/8 px-3 py-1 text-sm font-medium text-tool-rotation transition-colors hover:bg-tool-rotation/15"
                  >
                    {tCrop(c.crop, c.display)}
                    <ArrowRight className="size-3 transition-transform group-hover:translate-x-0.5 rtl:rotate-180 motion-reduce:transition-none" />
                  </Link>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">
                {t.rotation.noSuccessors}
              </p>
            )}
          </div>
          </CardContent>
        </Card>
      </StaggerItem>

      <StaggerItem>
        <Card>
          <CardContent className="p-5">
          <p className="flex items-center gap-2 font-medium text-destructive">
            <Ban className="size-4" /> {t.rotation.avoid}
          </p>
          <div className="mt-3 flex flex-wrap gap-2">
            {data.avoid_next.length > 0 ? (
              data.avoid_next.map((c) => (
                <span
                  key={c.crop}
                  className="inline-flex items-center rounded-full border border-destructive/30 bg-destructive/5 px-3 py-1 text-sm font-medium text-destructive"
                >
                  {tCrop(c.crop, c.display)}
                </span>
              ))
            ) : (
              <p className="text-sm text-muted-foreground">
                {t.rotation.nothingAvoid}
              </p>
            )}
          </div>
          </CardContent>
        </Card>
      </StaggerItem>
    </Stagger>
  );
}
