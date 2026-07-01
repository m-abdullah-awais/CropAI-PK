"use client";

import * as React from "react";
import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { RefreshCw } from "lucide-react";
import { PageHeader } from "@/components/common/page-header";
import { ErrorCard } from "@/components/common/error-card";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { CropSelect } from "@/components/common/crop-select";
import { RotationCards } from "@/components/rotation/rotation-cards";
import { ROTATION_CROPS } from "@/lib/crops";
import { getRotation } from "@/lib/api/ml";
import type { RotationResponse } from "@/lib/types";
import { useT } from "@/lib/i18n/provider";

function RotationInner() {
  const t = useT();
  const queryCrop = useSearchParams().get("crop");
  const initial = ROTATION_CROPS.some((c) => c.slug === queryCrop)
    ? queryCrop!
    : ROTATION_CROPS[0].slug;

  const [crop, setCrop] = React.useState(initial);
  const [data, setData] = React.useState<RotationResponse | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  const load = React.useCallback((slug: string) => {
    setLoading(true);
    setError(null);
    getRotation(slug)
      .then(setData)
      .catch((e) =>
        setError(e instanceof Error ? e.message : "Could not load rotation."),
      )
      .finally(() => setLoading(false));
  }, []);

  // Reload whenever the selected crop changes (and the query param updates it).
  React.useEffect(() => {
    setCrop(initial);
  }, [initial]);

  React.useEffect(() => {
    load(crop);
  }, [crop, load]);

  return (
    <div className="mx-auto max-w-4xl px-4 py-10">
      <PageHeader
        icon={RefreshCw}
        title={t.rotation.title}
        description={t.rotation.desc}
      />

      <Card className="mb-6">
        <CardContent className="flex flex-col gap-2 p-5 sm:flex-row sm:items-center sm:gap-4">
          <Label htmlFor="crop" className="shrink-0">
            {t.rotation.crop}
          </Label>
          <div className="w-full sm:max-w-xs">
            <CropSelect
              id="crop"
              crops={ROTATION_CROPS}
              value={crop}
              onChange={setCrop}
            />
          </div>
        </CardContent>
      </Card>

      {loading ? (
        <div className="space-y-5">
          <Skeleton className="h-32 w-full rounded-xl" />
          <div className="grid gap-5 sm:grid-cols-2">
            <Skeleton className="h-36 w-full rounded-xl" />
            <Skeleton className="h-36 w-full rounded-xl" />
          </div>
        </div>
      ) : error ? (
        <ErrorCard message={error} onRetry={() => load(crop)} />
      ) : data ? (
        <RotationCards data={data} />
      ) : null}
    </div>
  );
}

export default function RotationPage() {
  return (
    <Suspense>
      <RotationInner />
    </Suspense>
  );
}
