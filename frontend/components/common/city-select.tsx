"use client";

import * as React from "react";
import { Combobox, type ComboItem } from "@/components/ui/combobox";
import { PK_CITIES } from "@/lib/pk-cities";
import { useT } from "@/lib/i18n/provider";

// Cities are static, so build the item list once at module load.
const CITY_ITEMS: ComboItem[] = PK_CITIES.map((c) => ({
  value: c.name,
  label: c.name,
  hint: c.province,
}));

export function CitySelect({
  value,
  onChange,
  id,
  loading,
}: {
  value: string;
  onChange: (city: string) => void;
  id?: string;
  loading?: boolean;
}) {
  const t = useT();
  return (
    <Combobox
      id={id}
      items={CITY_ITEMS}
      value={value}
      onChange={onChange}
      loading={loading}
      placeholder={t.recommend.selectCity}
      searchPlaceholder={t.common.searchPlaceholder}
      emptyText={t.common.noResults}
    />
  );
}
