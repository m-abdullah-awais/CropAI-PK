"use client";

import * as React from "react";
import { Loader2, LineChart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { CropSelect } from "@/components/common/crop-select";
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
  const [year, setYear] = React.useState("2024");
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
        <Label htmlFor="crop">Crop</Label>
        <CropSelect
          id="crop"
          crops={YIELD_AVAILABLE_CROPS}
          value={crop}
          onChange={setCrop}
        />
        <p className="text-[11px] text-muted-foreground">
          Real FAO/OWID yield data for 13 Pakistani crops.
        </p>
      </div>

      <div className="space-y-1.5">
        <Label>Year</Label>
        <Input
          type="number"
          step="1"
          inputMode="numeric"
          value={year}
          onChange={(e) => setYear(e.target.value)}
        />
        {errors.year && <p className="text-xs text-destructive">{errors.year}</p>}
        <p className="text-[11px] text-muted-foreground">
          Real data runs 1961-2024; later years show the latest available.
        </p>
      </div>

      <Button type="submit" size="lg" className="w-full" disabled={loading}>
        {loading ? <Loader2 className="animate-spin" /> : <LineChart />}
        Predict yield
      </Button>
    </form>
  );
}
