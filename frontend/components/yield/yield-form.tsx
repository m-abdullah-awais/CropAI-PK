"use client";

import * as React from "react";
import { CloudSun, FlaskConical, Info, type LucideIcon } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { CropSelect } from "@/components/common/crop-select";
import { YIELD_AVAILABLE_CROPS, getCrop } from "@/lib/crops";
import { yieldEstimateSchema, type YieldEstimateForm } from "@/lib/schemas/yield";
import { useT } from "@/lib/i18n/provider";

type FieldName = "N" | "P" | "K" | "ph" | "temperature" | "humidity" | "rainfall";

interface FieldConfig {
  name: FieldName;
  min: number;
  max: number;
  step: number;
  unit: string;
}

// Slider bounds track the real dataset ranges (same as the recommend form).
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

export function YieldForm({
  initialCrop,
  initialSoil,
  onEstimate,
}: {
  initialCrop?: string;
  initialSoil?: Partial<Record<FieldName, number>>;
  onEstimate: (values: YieldEstimateForm) => void;
}) {
  const t = useT();
  const supported = YIELD_AVAILABLE_CROPS.some((c) => c.slug === initialCrop);
  const [crop, setCrop] = React.useState(
    supported ? initialCrop! : YIELD_AVAILABLE_CROPS[0].slug,
  );
  const [values, setValues] = React.useState<Record<FieldName, string>>(() => {
    if (!initialSoil) return DEFAULTS;
    const next = { ...DEFAULTS };
    for (const k of Object.keys(DEFAULTS) as FieldName[]) {
      if (initialSoil[k] != null) next[k] = String(initialSoil[k]);
    }
    return next;
  });

  const onEstimateRef = React.useRef(onEstimate);
  React.useEffect(() => {
    onEstimateRef.current = onEstimate;
  }, [onEstimate]);

  // Debounced live estimate: any change to the crop or a slider re-estimates.
  React.useEffect(() => {
    const numeric = Object.fromEntries(
      (Object.keys(values) as FieldName[]).map((k) => [
        k,
        values[k] === "" ? NaN : Number(values[k]),
      ]),
    );
    const parsed = yieldEstimateSchema.safeParse({ crop, ...numeric });
    if (!parsed.success) return;
    const id = setTimeout(() => onEstimateRef.current(parsed.data), 400);
    return () => clearTimeout(id);
  }, [crop, values]);

  const nutrientCapable = getCrop(crop)?.rotationAvailable ?? false;

  function set(name: FieldName, v: string) {
    setValues((prev) => ({ ...prev, [name]: v }));
  }

  const renderField = (f: FieldConfig) => (
    <SliderField
      key={f.name}
      label={t.recommend.fields[f.name]}
      config={f}
      value={values[f.name]}
      onChange={(v) => set(f.name, v)}
    />
  );

  return (
    <div className="space-y-7">
      <div className="space-y-2">
        <Label htmlFor="crop">{t.yield.crop}</Label>
        <CropSelect
          id="crop"
          crops={YIELD_AVAILABLE_CROPS}
          value={crop}
          onChange={setCrop}
          placeholder={t.selectCrop}
        />
      </div>

      {nutrientCapable ? (
        <>
          <section className="space-y-5 border-t border-hairline pt-7">
            <SectionHeader icon={FlaskConical} title={t.recommend.soil} />
            <div className="grid grid-cols-1 gap-x-5 gap-y-6 sm:grid-cols-2">
              {SOIL_FIELDS.map(renderField)}
            </div>
          </section>
          <section className="space-y-5 border-t border-hairline pt-7">
            <SectionHeader icon={CloudSun} title={t.recommend.climate} />
            <div className="grid grid-cols-1 gap-x-5 gap-y-6 sm:grid-cols-2">
              {CLIMATE_FIELDS.map(renderField)}
            </div>
          </section>
          <p className="flex items-start gap-1.5 text-[11px] text-muted-foreground">
            <Info className="mt-0.5 size-3.5 shrink-0" /> {t.yield.liveHint}
          </p>
        </>
      ) : (
        <p className="flex items-start gap-2 rounded-lg border border-hairline bg-secondary/30 p-3 text-xs text-muted-foreground">
          <Info className="mt-0.5 size-4 shrink-0" /> {t.yield.nutrientUnavailable}
        </p>
      )}
    </div>
  );
}

function SectionHeader({ icon: Icon, title }: { icon: LucideIcon; title: string }) {
  return (
    <div className="flex items-center gap-2">
      <span className="flex size-7 items-center justify-center rounded-md bg-tool-yield/10 text-tool-yield">
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
  onChange,
}: {
  label: string;
  config: FieldConfig;
  value: string;
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
      <div className="flex justify-between text-[10px] tabular-nums text-muted-foreground/70">
        <span>{min}</span>
        <span>{max}</span>
      </div>
    </div>
  );
}
