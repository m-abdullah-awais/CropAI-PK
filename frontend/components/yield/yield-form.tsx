"use client";

import * as React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, LineChart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { CropSelect } from "@/components/common/crop-select";
import { WeatherAutofill } from "@/components/common/weather-autofill";
import { YIELD_AVAILABLE_CROPS } from "@/lib/crops";
import {
  yieldDefaults,
  yieldSchema,
  type YieldForm as FormValues,
} from "@/lib/schemas/yield";

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
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(yieldSchema),
    defaultValues: {
      ...yieldDefaults,
      crop: supported ? initialCrop! : yieldDefaults.crop,
    },
  });

  const crop = watch("crop");

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
      <div className="space-y-1.5">
        <Label htmlFor="crop">Crop</Label>
        <CropSelect
          id="crop"
          crops={YIELD_AVAILABLE_CROPS}
          value={crop}
          onChange={(v) => setValue("crop", v)}
        />
        <p className="text-[11px] text-muted-foreground">
          Yield data is available for 7 major Pakistani crops.
        </p>
      </div>

      <WeatherAutofill
        onResult={(w) =>
          setValue("avg_temp", Math.round(w.temperature * 10) / 10)
        }
      />

      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1.5">
          <Label>Year</Label>
          <Input type="number" step="1" {...register("year", { valueAsNumber: true })} />
          {errors.year && (
            <p className="text-xs text-destructive">{errors.year.message}</p>
          )}
        </div>
        <div className="space-y-1.5">
          <Label>Avg temperature (°C)</Label>
          <Input type="number" step="any" {...register("avg_temp", { valueAsNumber: true })} />
          {errors.avg_temp && (
            <p className="text-xs text-destructive">{errors.avg_temp.message}</p>
          )}
        </div>
        <div className="col-span-2 space-y-1.5">
          <Label>Annual rainfall (mm)</Label>
          <Input
            type="number"
            step="any"
            {...register("rainfall_mm_per_year", { valueAsNumber: true })}
          />
          {errors.rainfall_mm_per_year && (
            <p className="text-xs text-destructive">
              {errors.rainfall_mm_per_year.message}
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
