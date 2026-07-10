import { cn } from "@/lib/utils";

// Shared page container so all three tools share the panel's width and rhythm
// (matches the dashboard's max-w-7xl content column).
export function PageShell({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("mx-auto w-full max-w-7xl px-4 py-8 sm:px-6", className)}>
      {children}
    </div>
  );
}
