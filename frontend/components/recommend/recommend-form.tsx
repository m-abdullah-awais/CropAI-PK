"use client";

import * as React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, Sprout } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { WeatherAutofill } from "@/components/common/weather-autofill";
import { recommend } from "@/lib/api/ml";
import {
  recommendDefaults,
  recommendSchema,
  type RecommendForm as FormValues,
} from "@/lib/schemas/recommend";
import type { RecommendResponse } from "@/lib/types";

const SOIL_FIELDS: { name: keyof FormValues; label: string; hint: string }[] = [
  { name: "N", label: "Nitrogen (N)", hint: "0–140" },
  { name: "P", label: "Phosphorus (P)", hint: "5–145" },
  { name: "K", label: "Potassium (K)", hint: "5–205" },
  { name: "ph", label: "Soil pH", hint: "3.5–9.5" },
];

const CLIMATE_FIELDS: { name: keyof FormValues; label: string; hint: string }[] =
  [
    { name: "temperature", label: "Temperature (°C)", hint: "auto / 8–44" },
    { name: "humidity", label: "Humidity (%)", hint: "auto / 14–100" },
    { name: "rainfall", label: "Rainfall (mm)", hint: "auto — verify" },
  ];

export function RecommendForm({
  onResult,
  onLoadingChange,
}: {
  onResult: (r: RecommendResponse | null) => void;
  onLoadingChange: (loading: boolean) => void;
}) {
  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(recommendSchema),
    defaultValues: recommendDefaults,
  });

  async function onSubmit(values: FormValues) {
    onLoadingChange(true);
    onResult(null);
    try {
      const res = await recommend({ ...values, top_n: 3 });
      onResult(res);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Recommendation failed.");
    } finally {
      onLoadingChange(false);
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
      <WeatherAutofill
        onResult={(w) => {
          setValue("temperature", Math.round(w.temperature * 10) / 10);
          setValue("humidity", Math.round(w.humidity));
          setValue("rainfall", Math.round(w.rainfall.value * 10) / 10);
        }}
      />

      <fieldset className="space-y-3">
        <legend className="text-sm font-semibold text-muted-foreground">
          Soil (enter from your soil test)
        </legend>
        <div className="grid grid-cols-2 gap-3">
          {SOIL_FIELDS.map((f) => (
            <Field
              key={f.name}
              {...f}
              error={errors[f.name]?.message}
              register={register(f.name, { valueAsNumber: true })}
            />
          ))}
        </div>
      </fieldset>

      <fieldset className="space-y-3">
        <legend className="text-sm font-semibold text-muted-foreground">
          Climate (auto-filled from weather, editable)
        </legend>
        <div className="grid grid-cols-3 gap-3">
          {CLIMATE_FIELDS.map((f) => (
            <Field
              key={f.name}
              {...f}
              error={errors[f.name]?.message}
              register={register(f.name, { valueAsNumber: true })}
            />
          ))}
        </div>
      </fieldset>

      <Button type="submit" size="lg" className="w-full" disabled={isSubmitting}>
        {isSubmitting ? <Loader2 className="animate-spin" /> : <Sprout />}
        Recommend crops
      </Button>
    </form>
  );
}

function Field({
  label,
  hint,
  error,
  register,
}: {
  label: string;
  hint: string;
  error?: string;
  register: ReturnType<ReturnType<typeof useForm<FormValues>>["register"]>;
}) {
  return (
    <div className="space-y-1.5">
      <div className="flex items-baseline justify-between">
        <Label>{label}</Label>
        <span className="text-[11px] text-muted-foreground">{hint}</span>
      </div>
      <Input type="number" step="any" {...register} />
      {error && <p className="text-xs text-destructive">{error}</p>}
    </div>
  );
}
