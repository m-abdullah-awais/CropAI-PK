"use client";

import { Select } from "@/components/ui/select";
import type { CropDef } from "@/lib/crops";
import { useI18n } from "@/lib/i18n/provider";

export function CropSelect({
  crops,
  value,
  onChange,
  id,
}: {
  crops: CropDef[];
  value: string;
  onChange: (slug: string) => void;
  id?: string;
}) {
  const { tCrop } = useI18n();
  return (
    <Select id={id} value={value} onChange={(e) => onChange(e.target.value)}>
      {crops.map((c) => (
        <option key={c.slug} value={c.slug}>
          {tCrop(c.slug, c.display)}
        </option>
      ))}
    </Select>
  );
}
