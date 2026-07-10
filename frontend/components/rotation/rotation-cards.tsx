"use client";

import * as React from "react";
import Link from "next/link";
import {
  ArrowRight,
  Ban,
  CalendarDays,
  FlaskConical,
  Leaf,
  Snowflake,
  Sprout,
  Sun,
  TreePine,
  TrendingUp,
  type LucideIcon,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { ConfidenceBar } from "@/components/common/confidence-bar";
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

// Projected-soil tiles: which fields to show and their unit suffix.
const SOIL_TILES: { key: keyof RotationResponse["projected_soil"]; unit: string }[] = [
  { key: "N", unit: "" },
  { key: "P", unit: "" },
  { key: "K", unit: "" },
  { key: "ph", unit: "" },
  { key: "temperature", unit: "°C" },
  { key: "humidity", unit: "%" },
  { key: "rainfall", unit: "mm" },
];

function Row({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-3 border-b border-hairline py-2.5 text-sm last:border-0">
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
      <Card>
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
          <div className="mt-5">
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

export function ProjectedSoil({ data }: { data: RotationResponse }) {
  const { t } = useI18n();
  const soil = data.projected_soil;
  const fields = t.recommend.fields as Record<string, string>;

  return (
    <Card>
      <CardContent className="p-5">
        <p className="flex items-center gap-2 text-xs font-medium uppercase tracking-wider text-muted-foreground">
          <FlaskConical className="size-4 text-tool-rotation" />{" "}
          {t.rotation.projected}
        </p>
        <div className="mt-4 grid grid-cols-3 gap-2 sm:grid-cols-4">
          {SOIL_TILES.map(({ key, unit }) => (
            <div
              key={key}
              className="rounded-lg border border-hairline bg-muted/40 px-2.5 py-2 text-center"
            >
              <div className="text-[10px] uppercase tracking-wide text-muted-foreground/80">
                {fields[key] ?? key}
              </div>
              <div className="font-mono text-sm font-semibold tabular-nums">
                {soil[key]}
                {unit ? (
                  <span className="ml-0.5 text-[10px] text-muted-foreground">
                    {unit}
                  </span>
                ) : null}
              </div>
            </div>
          ))}
        </div>
        <p className="mt-3 text-xs text-muted-foreground">
          {soil.soil_estimated
            ? t.rotation.soilEstimated
            : t.rotation.soilFromTest}
        </p>
      </CardContent>
    </Card>
  );
}

export function RotationFlow({ data }: { data: RotationResponse }) {
  const { t, tCrop } = useI18n();

  if (data.is_perennial) {
    return (
      <MountReveal>
        <Card>
          <CardContent className="flex flex-col items-center gap-3 p-8 text-center">
            <span className="flex size-12 items-center justify-center rounded-xl bg-tool-rotation/10 text-tool-rotation">
              <TreePine className="size-6" />
            </span>
            <h3 className="font-display text-lg font-semibold">
              {t.rotation.perennialTitle}
            </h3>
            <p className="max-w-md text-sm leading-relaxed text-muted-foreground">
              {t.rotation.perennialDesc}
            </p>
          </CardContent>
        </Card>
      </MountReveal>
    );
  }

  const roles = t.rotation.roles as Record<string, string>;
  const cropNotes = t.rotation.cropNotes as Record<string, string>;
  const reasons = t.rotation.reasons as Record<string, string>;

  return (
    <Stagger className="space-y-5">
      <StaggerItem>
        <Card>
          <CardContent className="p-5">
            <p className="flex items-center gap-2 text-xs font-medium uppercase tracking-wider text-muted-foreground">
              <Sprout className="size-4 text-tool-rotation" />{" "}
              {t.rotation.recommended}
            </p>
            <ul className="mt-4 space-y-3">
              {data.next_crops.map((c, i) => (
                <li
                  key={c.crop}
                  className="rounded-xl border border-hairline p-3.5 transition-colors hover:border-tool-rotation/30"
                >
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2">
                      <span className="flex size-6 items-center justify-center rounded-full bg-tool-rotation/10 font-mono text-xs font-semibold text-tool-rotation">
                        {i + 1}
                      </span>
                      <span className="font-medium">
                        {tCrop(c.crop, c.display)}
                      </span>
                      <Badge
                        variant="secondary"
                        className="gap-1 text-[11px] font-normal"
                      >
                        <Leaf className="size-3 text-tool-rotation" />
                        {roles[c.nitrogen_role] ??
                          c.nitrogen_role.replace(/_/g, " ")}
                      </Badge>
                    </div>
                    {c.yield_available ? (
                      <Link
                        href={`/yield?crop=${c.crop}`}
                        className="group inline-flex shrink-0 items-center gap-1 text-xs font-medium text-tool-rotation hover:underline"
                      >
                        <TrendingUp className="size-3.5" />
                        <span className="hidden sm:inline">
                          {t.rotation.predictYield}
                        </span>
                        <ArrowRight className="size-3 transition-transform group-hover:translate-x-0.5 rtl:rotate-180 motion-reduce:transition-none" />
                      </Link>
                    ) : null}
                  </div>
                  <div className="mt-3 flex items-center gap-3">
                    <span className="w-20 shrink-0 text-[11px] text-muted-foreground">
                      {t.rotation.soilMatch}
                    </span>
                    <div className="flex-1">
                      <ConfidenceBar
                        value={c.soil_suitability}
                        tone="high"
                        emphasis={i === 0}
                      />
                    </div>
                  </div>
                  <p className="mt-2 flex items-center gap-1.5 text-xs text-muted-foreground">
                    <Leaf className="size-3 text-tool-rotation" />
                    {cropNotes[c.note] ?? ""}
                  </p>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      </StaggerItem>

      <StaggerItem>
        <Card>
          <CardContent className="p-5">
            <p className="flex items-center gap-2 text-xs font-medium uppercase tracking-wider text-muted-foreground">
              <Ban className="size-4 text-destructive" /> {t.rotation.avoid}
            </p>
            <div className="mt-4 flex flex-wrap gap-2">
              {data.avoid.length > 0 ? (
                data.avoid.map((c) => (
                  <Tooltip key={c.crop}>
                    <TooltipTrigger asChild>
                      <span className="inline-flex cursor-help items-center rounded-full border border-destructive/20 bg-destructive/5 px-3 py-1 text-sm font-medium text-destructive">
                        {tCrop(c.crop, c.display)}
                      </span>
                    </TooltipTrigger>
                    <TooltipContent>
                      {reasons[c.reason] ?? c.reason}
                    </TooltipContent>
                  </Tooltip>
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
