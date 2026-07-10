import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

type Accent = "recommend" | "yield" | "rotation";

const CHIP: Record<Accent, string> = {
  recommend: "bg-tool-recommend/10 text-tool-recommend",
  yield: "bg-tool-yield/10 text-tool-yield",
  rotation: "bg-tool-rotation/10 text-tool-rotation",
};

// Compact page heading. The panel top bar already carries the short route title, so this
// stays quiet: a small accent icon, the title, and a one-line description. No hero chrome.
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
    <div className="mb-6 flex items-start gap-3">
      {Icon && (
        <span
          className={cn(
            "mt-0.5 flex size-10 shrink-0 items-center justify-center rounded-lg",
            accent ? CHIP[accent] : "bg-secondary text-muted-foreground",
          )}
        >
          <Icon className="size-5" />
        </span>
      )}
      <div className="min-w-0">
        <h1 className="font-display text-2xl font-semibold tracking-tight sm:text-[1.7rem]">
          {title}
        </h1>
        {description && (
          <p className="mt-1 max-w-2xl text-pretty text-sm text-muted-foreground">
            {description}
          </p>
        )}
      </div>
    </div>
  );
}
