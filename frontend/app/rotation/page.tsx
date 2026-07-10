"use client";

import * as React from "react";
import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { CloudSun, Loader2, RefreshCw } from "lucide-react";
import { PageShell } from "@/components/common/page-shell";
import { PageHeader } from "@/components/common/page-header";
import { ErrorCard } from "@/components/common/error-card";
import { ResultEmpty } from "@/components/common/result-empty";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Skeleton } from "@/components/ui/skeleton";
import { CropSelect } from "@/components/common/crop-select";
import { WeatherAutofill } from "@/components/common/weather-autofill";
import {
  ProjectedSoil,
  RotationFlow,
  RotationIdentity,
} from "@/components/rotation/rotation-cards";
import { ROTATION_CROPS } from "@/lib/crops";
import { planRotation, type RotationInput } from "@/lib/api/ml";
import { rotationSchema } from "@/lib/schemas/rotation";
import type { RotationResponse } from "@/lib/types";
import { useT } from "@/lib/i18n/provider";

type SoilField =
  | "N" | "P" | "K" | "ph" | "temperature" | "humidity" | "rainfall";

const SOIL_FIELDS: { name: SoilField; min: number; max: number; step: number; unit: string }[] = [
  { name: "N", min: 0, max: 140, step: 1, unit: "" },
  { name: "P", min: 5, max: 145, step: 1, unit: "" },
  { name: "K", min: 5, max: 205, step: 1, unit: "" },
  { name: "ph", min: 3.5, max: 9.5, step: 0.1, unit: "pH" },
  { name: "temperature", min: 8, max: 44, step: 0.5, unit: "°C" },
  { name: "humidity", min: 14, max: 100, step: 1, unit: "%" },
  { name: "rainfall", min: 20, max: 300, step: 1, unit: "mm" },
];

const SOIL_DEFAULTS: Record<SoilField, string> = {
  N: "80", P: "45", K: "40", ph: "6.5",
  temperature: "25", humidity: "70", rainfall: "120",
};

function IdentitySkeleton() {
  return (
    <Card>
      <CardContent className="space-y-4 p-6">
        <div className="flex items-center gap-3">
          <Skeleton className="size-11 shrink-0 rounded-xl" />
          <div className="space-y-2">
            <Skeleton className="h-5 w-28" />
            <Skeleton className="h-3 w-20" />
          </div>
        </div>
        <Skeleton className="h-9 w-full" />
        <Skeleton className="h-9 w-full" />
        <Skeleton className="h-16 w-full" />
      </CardContent>
    </Card>
  );
}

function FlowSkeleton() {
  return (
    <div className="space-y-5">
      <Card>
        <CardContent className="space-y-3 p-5">
          <Skeleton className="h-4 w-40" />
          <div className="grid grid-cols-4 gap-2">
            {[0, 1, 2, 3, 4, 5, 6].map((i) => (
              <Skeleton key={i} className="h-12 w-full rounded-lg" />
            ))}
          </div>
        </CardContent>
      </Card>
      <Card>
        <CardContent className="space-y-3 p-5">
          <Skeleton className="h-4 w-40" />
          {[0, 1, 2].map((i) => (
            <Skeleton key={i} className="h-16 w-full rounded-xl" />
          ))}
        </CardContent>
      </Card>
    </div>
  );
}

function RotationInner() {
  const t = useT();
  const queryCrop = useSearchParams().get("crop");
  const initial = ROTATION_CROPS.some((c) => c.slug === queryCrop)
    ? queryCrop!
    : ROTATION_CROPS[0].slug;

  const [crop, setCrop] = React.useState(initial);
  const [useSoil, setUseSoil] = React.useState(false);
  const [values, setValues] = React.useState<Record<SoilField, string>>(SOIL_DEFAULTS);
  const [errors, setErrors] = React.useState<Partial<Record<SoilField, string>>>({});
  const [data, setData] = React.useState<RotationResponse | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  // Latest slider values, read by the auto-load effect without making it a dep
  // (so editing a slider does not re-fetch - that is what the button is for).
  const valuesRef = React.useRef(values);
  React.useEffect(() => {
    valuesRef.current = values;
  }, [values]);

  function set(name: SoilField, v: string) {
    setValues((prev) => ({ ...prev, [name]: v }));
  }

  const load = React.useCallback((input: RotationInput) => {
    setLoading(true);
    setError(null);
    planRotation(input)
      .then(setData)
      .catch((e) => setError(e instanceof Error ? e.message : t.common.error))
      .finally(() => setLoading(false));
  }, [t.common.error]);

  // Crop only, or crop plus whatever valid soil values are entered (invalid/empty
  // fields are dropped so the backend seeds them from the crop profile).
  const autoInput = React.useCallback(
    (withSoil: boolean, slug: string): RotationInput => {
      const input: RotationInput = { current_crop: slug, top_n: 4 };
      if (!withSoil) return input;
      for (const f of SOIL_FIELDS) {
        const n = Number(valuesRef.current[f.name]);
        if (valuesRef.current[f.name] !== "" && !Number.isNaN(n)) input[f.name] = n;
      }
      return input;
    },
    [],
  );

  // Sync the selection when the URL crop param changes (e.g. arriving from a link).
  React.useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setCrop(initial);
  }, [initial]);

  // Auto-load when the crop or soil-source mode changes (soil edits use the button).
  React.useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    load(autoInput(useSoil, crop));
  }, [crop, useSoil, load, autoInput]);

  // Button path: validate the entered soil values and surface field errors.
  function handleRecompute() {
    const numeric = Object.fromEntries(
      SOIL_FIELDS.map((f) => [f.name, values[f.name] === "" ? NaN : Number(values[f.name])]),
    );
    const parsed = rotationSchema.safeParse({ current_crop: crop, ...numeric });
    if (!parsed.success) {
      const next: Partial<Record<SoilField, string>> = {};
      for (const issue of parsed.error.issues) {
        next[issue.path[0] as SoilField] = issue.message;
      }
      setErrors(next);
      return;
    }
    setErrors({});
    load({ ...parsed.data, top_n: 4 });
  }

  return (
    <PageShell>
      <PageHeader
        accent="rotation"
        icon={RefreshCw}
        title={t.rotation.title}
        description={t.rotation.desc}
      />

      <div className="grid gap-6 lg:grid-cols-12">
        <div className="space-y-6 lg:col-span-5">
          <Card>
            <CardContent className="space-y-5 p-5 sm:p-6">
              <div>
                <Label htmlFor="crop" className="mb-2 flex items-center gap-1.5">
                  <RefreshCw className="size-3.5 text-tool-rotation" />
                  {t.rotation.crop}
                </Label>
                <CropSelect
                  id="crop"
                  crops={ROTATION_CROPS}
                  value={crop}
                  onChange={setCrop}
                  placeholder={t.selectCrop}
                />
              </div>

              <div className="border-t border-hairline pt-5">
                <button
                  type="button"
                  aria-pressed={useSoil}
                  onClick={() => setUseSoil((v) => !v)}
                  className="flex w-full items-center justify-between gap-3 text-left"
                >
                  <span>
                    <span className="flex items-center gap-1.5 text-sm font-medium">
                      <CloudSun className="size-4 text-tool-rotation" />
                      {t.rotation.useSoilTest}
                    </span>
                    <span className="mt-1 block text-xs text-muted-foreground">
                      {t.rotation.useSoilHint}
                    </span>
                  </span>
                  <span
                    className={`relative h-6 w-11 shrink-0 rounded-full transition-colors ${
                      useSoil ? "bg-tool-rotation" : "bg-muted"
                    }`}
                  >
                    <span
                      className={`absolute top-0.5 size-5 rounded-full bg-white shadow transition-all ${
                        useSoil ? "left-5.5" : "left-0.5"
                      }`}
                    />
                  </span>
                </button>

                {useSoil ? (
                  <div className="mt-5 space-y-5">
                    <WeatherAutofill
                      onResult={(w) => {
                        set("temperature", String(Math.round(w.temperature * 10) / 10));
                        set("humidity", String(Math.round(w.humidity)));
                        set("rainfall", String(Math.round(w.rainfall.value * 10) / 10));
                      }}
                    />
                    <div className="grid grid-cols-1 gap-x-5 gap-y-6 sm:grid-cols-2">
                      {SOIL_FIELDS.map((f) => (
                        <SliderField
                          key={f.name}
                          label={t.recommend.fields[f.name]}
                          config={f}
                          value={values[f.name]}
                          error={errors[f.name]}
                          onChange={(v) => set(f.name, v)}
                        />
                      ))}
                    </div>
                    <Button
                      type="button"
                      className="w-full"
                      onClick={handleRecompute}
                      disabled={loading}
                    >
                      {loading ? (
                        <Loader2 className="animate-spin" />
                      ) : (
                        <RefreshCw />
                      )}
                      {t.rotation.recompute}
                    </Button>
                  </div>
                ) : null}
              </div>
            </CardContent>
          </Card>

          {loading ? (
            <IdentitySkeleton />
          ) : data ? (
            <RotationIdentity data={data} />
          ) : null}
        </div>

        <div className="space-y-6 lg:col-span-7">
          {loading ? (
            <FlowSkeleton />
          ) : error ? (
            <ErrorCard message={error} onRetry={handleRecompute} />
          ) : data ? (
            <>
              <ProjectedSoil data={data} />
              <RotationFlow data={data} />
            </>
          ) : (
            <ResultEmpty
              accent="rotation"
              icon={RefreshCw}
              title={t.rotation.empty}
              description={t.rotation.emptyDesc}
            />
          )}
        </div>
      </div>
    </PageShell>
  );
}

function SliderField({
  label,
  config,
  value,
  error,
  onChange,
}: {
  label: string;
  config: { min: number; max: number; step: number; unit: string };
  value: string;
  error?: string;
  onChange: (v: string) => void;
}) {
  const { min, max, step, unit } = config;
  const parsed = Number(value);
  const num =
    value === "" || Number.isNaN(parsed)
      ? min
      : Math.min(max, Math.max(min, parsed));

  return (
    <div className="space-y-2.5">
      <div className="flex items-baseline justify-between gap-2">
        <Label className="text-[13px]">{label}</Label>
        <div className="flex items-baseline gap-1">
          <Input
            type="number"
            step="any"
            inputMode="decimal"
            value={value}
            aria-label={label}
            aria-invalid={error ? true : undefined}
            onChange={(e) => onChange(e.target.value)}
            className="h-8 w-16 px-2 text-end text-sm tabular-nums"
          />
          <span className="w-6 text-xs text-muted-foreground">{unit}</span>
        </div>
      </div>
      <Slider
        value={[num]}
        min={min}
        max={max}
        step={step}
        aria-label={label}
        onValueChange={([v]) => onChange(String(v))}
      />
      {error ? (
        <p className="text-xs text-destructive">{error}</p>
      ) : (
        <div className="flex justify-between text-[10px] tabular-nums text-muted-foreground/70">
          <span>{min}</span>
          <span>{max}</span>
        </div>
      )}
    </div>
  );
}

export default function RotationPage() {
  return (
    <Suspense>
      <RotationInner />
    </Suspense>
  );
}
