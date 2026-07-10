"use client";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { CropDef } from "@/lib/crops";
import { useI18n } from "@/lib/i18n/provider";

export function CropSelect({
  crops,
  value,
  onChange,
  id,
  placeholder,
}: {
  crops: CropDef[];
  value: string;
  onChange: (slug: string) => void;
  id?: string;
  placeholder?: string;
}) {
  const { tCrop } = useI18n();
  return (
    <Select value={value} onValueChange={onChange}>
      <SelectTrigger id={id} className="w-full">
        <SelectValue placeholder={placeholder} />
      </SelectTrigger>
      <SelectContent className="max-h-72">
        {crops.map((c) => (
          <SelectItem key={c.slug} value={c.slug}>
            {tCrop(c.slug, c.display)}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
