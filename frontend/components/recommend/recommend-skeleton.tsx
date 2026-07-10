import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export function RecommendSkeleton() {
  return (
    <div className="space-y-4">
      <Skeleton className="h-3 w-40" />
      {[0, 1, 2].map((i) => (
        <Card key={i}>
          <CardContent className="space-y-3 p-5">
            <div className="flex items-start gap-3">
              <Skeleton className="size-7 shrink-0 rounded-full" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-5 w-32" />
                <Skeleton className="h-3 w-20" />
              </div>
            </div>
            <Skeleton className="h-2.5 w-full" />
            <div className="flex gap-2">
              <Skeleton className="h-9 w-28" />
              <Skeleton className="h-9 w-28" />
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
