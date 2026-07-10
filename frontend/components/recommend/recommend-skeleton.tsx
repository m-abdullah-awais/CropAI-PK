import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export function RecommendSkeleton() {
  return (
    <div className="space-y-4">
      <Skeleton className="h-3 w-40" />
      {[0, 1, 2].map((i) => (
        <Card key={i}>
          <CardContent className="p-5">
            <div className="flex items-center gap-4">
              <Skeleton className="h-4 w-4 shrink-0" />
              <div className="flex-1 space-y-2.5">
                <div className="flex items-center justify-between">
                  <Skeleton className="h-5 w-28" />
                  <Skeleton className="h-5 w-20 rounded-full" />
                </div>
                <Skeleton className="h-2 w-full rounded-full" />
              </div>
            </div>
            <div className="mt-4 flex gap-2 ps-8">
              <Skeleton className="h-9 w-28" />
              <Skeleton className="h-9 w-28" />
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
