import { AlertTriangle, RotateCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

export function ErrorCard({
  message,
  onRetry,
}: {
  message: string;
  onRetry?: () => void;
}) {
  return (
    <Card className="border-destructive/40 bg-destructive/5">
      <CardContent className="flex items-start gap-3 p-5">
        <AlertTriangle className="mt-0.5 size-5 shrink-0 text-destructive" />
        <div className="flex-1">
          <p className="font-medium text-foreground">Something went wrong</p>
          <p className="mt-1 text-sm text-muted-foreground">{message}</p>
          {onRetry && (
            <Button
              variant="outline"
              size="sm"
              className="mt-3"
              onClick={onRetry}
            >
              <RotateCw /> Try again
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
