import { cn } from "@/lib/utils";

// Shared page container so all three tools share one width and rhythm.
export function PageShell({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("mx-auto w-full max-w-6xl px-4 py-10 sm:py-12", className)}>
      {children}
    </div>
  );
}
