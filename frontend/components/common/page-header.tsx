import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { SoilHorizon } from "@/components/common/soil-horizon";

type Accent = "recommend" | "yield" | "rotation";

const CHIP: Record<Accent, string> = {
  recommend: "bg-tool-recommend/10 text-tool-recommend",
  yield: "bg-tool-yield/10 text-tool-yield",
  rotation: "bg-tool-rotation/10 text-tool-rotation",
};

export function PageHeader({
  title,
  description,
  icon: Icon,
  accent,
}: {
  title: string;
  description?: string;
  icon?: LucideIcon;
  accent?: Accent;
}) {
  return (
    <div className="mb-8">
      <SoilHorizon variant="rule" accent={accent} className="mb-5 w-24" />
      <div className="flex items-center gap-3">
        {Icon && (
          <span
            className={cn(
              "flex size-11 items-center justify-center rounded-xl",
              accent ? CHIP[accent] : "bg-primary/10 text-primary",
            )}
          >
            <Icon className="size-5" />
          </span>
        )}
        <h1 className="font-display text-3xl font-semibold tracking-tight sm:text-4xl">
          {title}
        </h1>
      </div>
      {description && (
        <p className="mt-3 max-w-2xl text-pretty text-muted-foreground">
          {description}
        </p>
      )}
    </div>
  );
}
