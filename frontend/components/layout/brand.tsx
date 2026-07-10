import Link from "next/link";
import { Leaf } from "lucide-react";
import { cn } from "@/lib/utils";

// The CropAI PK wordmark. `iconOnly` renders just the leaf badge for the collapsed rail.
export function Brand({
  iconOnly = false,
  className,
}: {
  iconOnly?: boolean;
  className?: string;
}) {
  return (
    <Link
      href="/"
      aria-label="CropAI PK"
      className={cn("flex items-center gap-2 font-semibold", className)}
    >
      <span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-primary text-primary-foreground shadow-e1">
        <Leaf className="size-5" />
      </span>
      {!iconOnly && (
        <span className="text-lg tracking-tight">
          CropAI <span className="text-primary">PK</span>
        </span>
      )}
    </Link>
  );
}
