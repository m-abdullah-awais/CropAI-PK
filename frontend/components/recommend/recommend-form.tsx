"use client";

import * as React from "react";
import { CloudSun, FlaskConical, Loader2, Sprout, type LucideIcon } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { WeatherAutofill } from "@/components/common/weather-autofill";
import { recommend } from "@/lib/api/ml";
import { recommendSchema } from "@/lib/schemas/recommend";
import type { RecommendResponse } from "@/lib/types";
import { useT } from "@/lib/i18n/provider";

type FieldName =
  | "N" | "P" | "K" | "ph" | "temperature" | "humidity" | "rainfall";

interface FieldConfig {
  name: FieldName;
  min: number;
  max: number;
  step: number;
  unit: string;
}

// Slider bounds track the real dataset ranges; the number input still accepts
// out-of-range real soil-test values (zod validates the wider window on submit).
const SOIL_FIELDS: FieldConfig[] = [
  { name: "N", min: 0, max: 140, step: 1, unit: "" },
  { name: "P", min: 5, max: 145, step: 1, unit: "" },
  { name: "K", min: 5, max: 205, step: 1, unit: "" },
  { name: "ph", min: 3.5, max: 9.5, step: 0.1, unit: "pH" },
];

const CLIMATE_FIELDS: FieldConfig[] = [
  { name: "temperature", min: 8, max: 44, step: 0.5, unit: "°C" },
  { name: "humidity", min: 14, max: 100, step: 1, unit: "%" },
  { name: "rainfall", min: 20, max: 300, step: 1, unit: "mm" },
];

const DEFAULTS: Record<FieldName, string> = {
  N: "80", P: "45", K: "40", ph: "6.5",
  temperature: "25", humidity: "70", rainfall: "120",
};

export function RecommendForm({
  onResult,
  onLoadingChange,
}: {
  onResult: (r: RecommendResponse | null) => void;
  onLoadingChange: (loading: boolean) => void;
}) {
  const t = useT();
  const [values, setValues] = React.useState<Record<FieldName, string>>(DEFAULTS);
  const [errors, setErrors] = React.useState<Partial<Record<FieldName, string>>>({});
  const [submitting, setSubmitting] = React.useState(false);

  function set(name: FieldName, v: string) {
    setValues((prev) => ({ ...prev, [name]: v }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const numeric = Object.fromEntries(
      (Object.keys(values) as FieldName[]).map((k) => [
        k,
        values[k] === "" ? NaN : Number(values[k]),
      ]),
    );
    const parsed = recommendSchema.safeParse(numeric);
    if (!parsed.success) {
      const next: Partial<Record<FieldName, string>> = {};
      for (const issue of parsed.error.issues) {
        next[issue.path[0] as FieldName] = issue.message;
      }
      setErrors(next);
      return;
    }
    setErrors({});
    setSubmitting(true);
    onLoadingChange(true);
    onResult(null);
    try {
      const res = await recommend({ ...parsed.data, top_n: 3 });
      onResult(res);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : t.common.error);
    } finally {
      setSubmitting(false);
      onLoadingChange(false);
    }
  }

  const renderField = (f: FieldConfig) => (
    <SliderField
      key={f.name}
      label={t.recommend.fields[f.name]}
      config={f}
      value={values[f.name]}
      error={errors[f.name]}
      onChange={(v) => set(f.name, v)}
    />
  );

  return (
    <form onSubmit={handleSubmit} className="space-y-7">
      <section className="space-y-5">
        <SectionHeader icon={FlaskConical} title={t.recommend.soil} />
        <div className="grid grid-cols-1 gap-x-5 gap-y-6 sm:grid-cols-2">
          {SOIL_FIELDS.map(renderField)}
        </div>
      </section>

      <section className="space-y-5 border-t border-hairline pt-7">
        <SectionHeader icon={CloudSun} title={t.recommend.climate} />
        <WeatherAutofill
          onResult={(w) => {
            set("temperature", String(Math.round(w.temperature * 10) / 10));
            set("humidity", String(Math.round(w.humidity)));
            set("rainfall", String(Math.round(w.rainfall.value * 10) / 10));
          }}
        />
        <div className="grid grid-cols-1 gap-x-5 gap-y-6 sm:grid-cols-2">
          {CLIMATE_FIELDS.map(renderField)}
        </div>
      </section>

      <Button type="submit" size="lg" className="w-full" disabled={submitting}>
        {submitting ? <Loader2 className="animate-spin" /> : <Sprout />}
        {t.recommend.submit}
      </Button>
    </form>
  );
}

function SectionHeader({ icon: Icon, title }: { icon: LucideIcon; title: string }) {
  return (
    <div className="flex items-center gap-2">
      <span className="flex size-7 items-center justify-center rounded-md bg-tool-recommend/10 text-tool-recommend">
        <Icon className="size-4" />
      </span>
      <h3 className="text-sm font-semibold">{title}</h3>
    </div>
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
  config: FieldConfig;
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
