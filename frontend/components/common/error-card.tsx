"use client";

import { AlertTriangle, RotateCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { useT } from "@/lib/i18n/provider";

export function ErrorCard({
  message,
  onRetry,
}: {
  message: string;
  onRetry?: () => void;
}) {
  const t = useT();
  return (
    <Alert variant="destructive">
      <AlertTriangle />
      <AlertTitle>{t.common.error}</AlertTitle>
      <AlertDescription>
        <p>{message}</p>
        {onRetry && (
          <Button
            variant="outline"
            size="sm"
            className="mt-3"
            onClick={onRetry}
          >
            <RotateCw /> {t.common.retry}
          </Button>
        )}
      </AlertDescription>
    </Alert>
  );
}
