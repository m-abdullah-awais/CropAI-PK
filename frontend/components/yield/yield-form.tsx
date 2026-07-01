"use client";

import * as React from "react";
import { Loader2, LineChart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { CropSelect } from "@/components/common/crop-select";
import { WeatherAutofill } from "@/components/common/weather-autofill";
import { YIELD_AVAILABLE_CROPS } from "@/lib/crops";
import { yieldSchema, type YieldForm as FormValues } from "@/lib/schemas/yield";

export function YieldForm({
  initialCrop,
  onSubmit,
  loading,
}: {
  initialCrop?: string;
  onSubmit: (values: FormValues) => void;
  loading: boolean;
}) {
  const supported = YIELD_AVAILABLE_CROPS.some((c) => c.slug === initialCrop);
  const [crop, setCrop] = React.useState(
    supported ? initialCrop! : YIELD_AVAILABLE_CROPS[0].slug,
  );
  const [year, setYear] = React.useState("2026");
  const [avgTemp, setAvgTemp] = React.useState("25");
  const [rainfall, setRainfall] = React.useState("500");
  const [errors, setErrors] = React.useState<Record<string, string>>({});

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const parsed = yieldSchema.safeParse({
      crop,
      year: year === "" ? NaN : Number(year),
      avg_temp: avgTemp === "" ? NaN : Number(avgTemp),
      rainfall_mm_per_year: rainfall === "" ? NaN : Number(rainfall),
    });
    if (!parsed.success) {
      const next: Record<string, string> = {};
      for (const issue of parsed.error.issues) {
        next[String(issue.path[0])] = issue.message;
      }
      setErrors(next);
      return;
    }
    setErrors({});
    onSubmit(parsed.data);
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div className="space-y-1.5">
        <Label htmlFor="crop">Crop</Label>
        <CropSelect
          id="crop"
          crops={YIELD_AVAILABLE_CROPS}
          value={crop}
          onChange={setCrop}
        />
        <p className="text-[11px] text-muted-foreground">
          Yield data is available for 9 major Pakistani crops.
        </p>
      </div>

      <WeatherAutofill
        onResult={(w) => setAvgTemp(String(Math.round(w.temperature * 10) / 10))}
      />

      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1.5">
          <Label>Year</Label>
          <Input
            type="number"
            step="1"
            value={year}
            onChange={(e) => setYear(e.target.value)}
          />
          {errors.year && (
            <p className="text-xs text-destructive">{errors.year}</p>
          )}
        </div>
        <div className="space-y-1.5">
          <Label>Avg temperature (°C)</Label>
          <Input
            type="number"
            step="any"
            value={avgTemp}
            onChange={(e) => setAvgTemp(e.target.value)}
          />
          {errors.avg_temp && (
            <p className="text-xs text-destructive">{errors.avg_temp}</p>
          )}
        </div>
        <div className="col-span-2 space-y-1.5">
          <Label>Annual rainfall (mm)</Label>
          <Input
            type="number"
            step="any"
            value={rainfall}
            onChange={(e) => setRainfall(e.target.value)}
          />
          {errors.rainfall_mm_per_year && (
            <p className="text-xs text-destructive">
              {errors.rainfall_mm_per_year}
            </p>
          )}
        </div>
      </div>

      <Button type="submit" size="lg" className="w-full" disabled={loading}>
        {loading ? <Loader2 className="animate-spin" /> : <LineChart />}
        Predict yield
      </Button>
    </form>
  );
}
