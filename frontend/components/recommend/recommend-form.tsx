"use client";

import * as React from "react";
import { Loader2, Sprout } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { WeatherAutofill } from "@/components/common/weather-autofill";
import { recommend } from "@/lib/api/ml";
import { recommendSchema } from "@/lib/schemas/recommend";
import type { RecommendResponse } from "@/lib/types";
import { useT } from "@/lib/i18n/provider";

type FieldName =
  | "N" | "P" | "K" | "ph" | "temperature" | "humidity" | "rainfall";

const SOIL_FIELDS: { name: FieldName; hint: string }[] = [
  { name: "N", hint: "0-140" },
  { name: "P", hint: "5-145" },
  { name: "K", hint: "5-205" },
  { name: "ph", hint: "3.5-9.5" },
];

const CLIMATE_FIELDS: { name: FieldName; hint: string }[] = [
  { name: "temperature", hint: "8-44" },
  { name: "humidity", hint: "14-100" },
  { name: "rainfall", hint: "20-300" },
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
      toast.error(err instanceof Error ? err.message : "Recommendation failed.");
    } finally {
      setSubmitting(false);
      onLoadingChange(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <WeatherAutofill
        onResult={(w) => {
          set("temperature", String(Math.round(w.temperature * 10) / 10));
          set("humidity", String(Math.round(w.humidity)));
          set("rainfall", String(Math.round(w.rainfall.value * 10) / 10));
        }}
      />

      <fieldset className="space-y-3">
        <legend className="text-sm font-semibold text-muted-foreground">
          {t.recommend.soil}
        </legend>
        <div className="grid grid-cols-2 gap-3">
          {SOIL_FIELDS.map((f) => (
            <Field
              key={f.name}
              label={t.recommend.fields[f.name]}
              hint={f.hint}
              value={values[f.name]}
              error={errors[f.name]}
              onChange={(v) => set(f.name, v)}
            />
          ))}
        </div>
      </fieldset>

      <fieldset className="space-y-3">
        <legend className="text-sm font-semibold text-muted-foreground">
          {t.recommend.climate}
        </legend>
        <div className="grid grid-cols-3 gap-3">
          {CLIMATE_FIELDS.map((f) => (
            <Field
              key={f.name}
              label={t.recommend.fields[f.name]}
              hint={f.hint}
              value={values[f.name]}
              error={errors[f.name]}
              onChange={(v) => set(f.name, v)}
            />
          ))}
        </div>
      </fieldset>

      <Button type="submit" size="lg" className="w-full" disabled={submitting}>
        {submitting ? <Loader2 className="animate-spin" /> : <Sprout />}
        {t.recommend.submit}
      </Button>
    </form>
  );
}

function Field({
  label,
  hint,
  value,
  error,
  onChange,
}: {
  label: string;
  hint: string;
  value: string;
  error?: string;
  onChange: (v: string) => void;
}) {
  return (
    <div className="space-y-1.5">
      <div className="flex items-baseline justify-between gap-2">
        <Label>{label}</Label>
        <span className="text-[11px] text-muted-foreground">{hint}</span>
      </div>
      <Input
        type="number"
        step="any"
        inputMode="decimal"
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
      {error && <p className="text-xs text-destructive">{error}</p>}
    </div>
  );
}
