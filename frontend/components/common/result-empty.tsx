import type { LucideIcon } from "lucide-react";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";

type Accent = "recommend" | "yield" | "rotation";

const TINT: Record<Accent, string> = {
  recommend: "bg-tool-recommend/10 text-tool-recommend",
  yield: "bg-tool-yield/10 text-tool-yield",
  rotation: "bg-tool-rotation/10 text-tool-rotation",
};

export function ResultEmpty({
  icon: Icon,
  title,
  description,
  accent,
}: {
  icon: LucideIcon;
  title: string;
  description: string;
  accent?: Accent;
}) {
  return (
    <Card className="flex h-full min-h-64 flex-col items-center justify-center border-dashed bg-transparent p-8 text-center shadow-none">
      <span
        className={cn(
          "flex size-14 items-center justify-center rounded-full",
          accent ? TINT[accent] : "bg-secondary text-muted-foreground",
        )}
      >
        <Icon className="size-6" />
      </span>
      <p className="mt-4 font-medium">{title}</p>
      <p className="mt-1 max-w-xs text-sm text-muted-foreground">{description}</p>
    </Card>
  );
}
