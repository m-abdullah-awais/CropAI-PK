import type { LucideIcon } from "lucide-react";

export function PageHeader({
  title,
  description,
  icon: Icon,
}: {
  title: string;
  description?: string;
  icon?: LucideIcon;
}) {
  return (
    <div className="mb-8">
      <div className="flex items-center gap-3">
        {Icon && (
          <span className="flex size-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
            <Icon className="size-5" />
          </span>
        )}
        <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">{title}</h1>
      </div>
      {description && (
        <p className="mt-2 max-w-2xl text-muted-foreground">{description}</p>
      )}
    </div>
  );
}
