"use client";

import * as React from "react";
import { Loader2, LineChart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { CropSelect } from "@/components/common/crop-select";
import { YIELD_AVAILABLE_CROPS } from "@/lib/crops";
import { yieldSchema, type YieldForm as FormValues } from "@/lib/schemas/yield";
import { useT } from "@/lib/i18n/provider";

// Selectable prediction-year window (matches the yield schema bounds).
const YEAR_MIN = 1990;
const YEAR_MAX = 2035;

export function YieldForm({
  initialCrop,
  onSubmit,
  loading,
}: {
  initialCrop?: string;
  onSubmit: (values: FormValues) => void;
  loading: boolean;
}) {
  const t = useT();
  const supported = YIELD_AVAILABLE_CROPS.some((c) => c.slug === initialCrop);
  const [crop, setCrop] = React.useState(
    supported ? initialCrop! : YIELD_AVAILABLE_CROPS[0].slug,
  );
  const [year, setYear] = React.useState("2026");
  const [errors, setErrors] = React.useState<Record<string, string>>({});

  // Arriving from the recommend page ("Predict yield") lands here with ?crop=<slug>.
  // Select that crop and predict immediately so the result is ready on load, rather
  // than making the user click Predict again. Runs only when the crop param changes;
  // a direct visit with no param does nothing.
  React.useEffect(() => {
    if (!supported || !initialCrop) return;
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setCrop(initialCrop);
    const parsed = yieldSchema.safeParse({ crop: initialCrop, year: Number(year) });
    if (parsed.success) onSubmit(parsed.data);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialCrop]);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const parsed = yieldSchema.safeParse({
      crop,
      year: year === "" ? NaN : Number(year),
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

  const parsedYear = Number(year);
  const yearNum =
    year === "" || Number.isNaN(parsedYear)
      ? 2024
      : Math.min(YEAR_MAX, Math.max(YEAR_MIN, parsedYear));

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div className="space-y-1.5">
        <Label htmlFor="crop">{t.yield.crop}</Label>
        <CropSelect
          id="crop"
          crops={YIELD_AVAILABLE_CROPS}
          value={crop}
          onChange={setCrop}
          placeholder={t.selectCrop}
        />
        <p className="text-[11px] text-muted-foreground">{t.yield.cropHint}</p>
      </div>

      <div className="space-y-2.5">
        <div className="flex items-baseline justify-between gap-2">
          <Label htmlFor="year">{t.yield.year}</Label>
          <Input
            id="year"
            type="number"
            step="1"
            inputMode="numeric"
            value={year}
            aria-invalid={errors.year ? true : undefined}
            onChange={(e) => setYear(e.target.value)}
            className="h-8 w-20 px-2 text-end text-sm tabular-nums"
          />
        </div>
        <Slider
          value={[yearNum]}
          min={YEAR_MIN}
          max={YEAR_MAX}
          step={1}
          aria-label={t.yield.year}
          onValueChange={([v]) => setYear(String(v))}
        />
        <div className="flex justify-between text-[10px] tabular-nums text-muted-foreground/70">
          <span>{YEAR_MIN}</span>
          <span>{YEAR_MAX}</span>
        </div>
        {errors.year && <p className="text-xs text-destructive">{errors.year}</p>}
        <p className="text-[11px] text-muted-foreground">{t.yield.yearHint}</p>
      </div>

      <Button type="submit" size="lg" className="w-full" disabled={loading}>
        {loading ? <Loader2 className="animate-spin" /> : <LineChart />}
        {t.yield.submit}
      </Button>
    </form>
  );
}
