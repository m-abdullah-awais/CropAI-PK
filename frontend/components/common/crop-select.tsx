"use client";

import * as React from "react";
import { Combobox, type ComboItem } from "@/components/ui/combobox";
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
  const { t, tCrop } = useI18n();

  // Localize labels for search + display; recompute when the language changes.
  const items = React.useMemo<ComboItem[]>(
    () => crops.map((c) => ({ value: c.slug, label: tCrop(c.slug, c.display) })),
    [crops, tCrop],
  );

  return (
    <Combobox
      id={id}
      items={items}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      searchPlaceholder={t.common.searchPlaceholder}
      emptyText={t.common.noResults}
    />
  );
}
