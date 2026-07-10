"use client";

import * as React from "react";
import { Loader2, LineChart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { CropSelect } from "@/components/common/crop-select";
import { YIELD_AVAILABLE_CROPS } from "@/lib/crops";
import { yieldSchema, type YieldForm as FormValues } from "@/lib/schemas/yield";
import { useT } from "@/lib/i18n/provider";

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

      <div className="space-y-1.5">
        <Label htmlFor="year">{t.yield.year}</Label>
        <Input
          id="year"
          type="number"
          step="1"
          inputMode="numeric"
          value={year}
          aria-invalid={errors.year ? true : undefined}
          onChange={(e) => setYear(e.target.value)}
        />
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
