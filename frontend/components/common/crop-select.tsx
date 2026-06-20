import { Select } from "@/components/ui/select";
import type { CropDef } from "@/lib/crops";

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
  return (
    <Select id={id} value={value} onChange={(e) => onChange(e.target.value)}>
      {crops.map((c) => (
        <option key={c.slug} value={c.slug}>
          {c.display}
        </option>
      ))}
    </Select>
  );
}
