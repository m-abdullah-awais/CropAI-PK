import type { LucideIcon } from "lucide-react";
import { Card } from "@/components/ui/card";

export function ResultEmpty({
  icon: Icon,
  title,
  description,
}: {
  icon: LucideIcon;
  title: string;
  description: string;
}) {
  return (
    <Card className="flex h-full min-h-64 flex-col items-center justify-center border-dashed p-8 text-center">
      <span className="flex size-12 items-center justify-center rounded-full bg-secondary text-muted-foreground">
        <Icon className="size-6" />
      </span>
      <p className="mt-4 font-medium">{title}</p>
      <p className="mt-1 max-w-xs text-sm text-muted-foreground">{description}</p>
    </Card>
  );
}
