"use client";

import * as React from "react";
import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { RefreshCw } from "lucide-react";
import { PageShell } from "@/components/common/page-shell";
import { PageHeader } from "@/components/common/page-header";
import { ErrorCard } from "@/components/common/error-card";
import { ResultEmpty } from "@/components/common/result-empty";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { CropSelect } from "@/components/common/crop-select";
import {
  RotationFlow,
  RotationIdentity,
} from "@/components/rotation/rotation-cards";
import { ROTATION_CROPS } from "@/lib/crops";
import { getRotation } from "@/lib/api/ml";
import type { RotationResponse } from "@/lib/types";
import { useT } from "@/lib/i18n/provider";

function IdentitySkeleton() {
  return (
    <Card className="overflow-hidden">
      <span aria-hidden className="block h-1.5 bg-muted" />
      <CardContent className="space-y-4 p-6">
        <div className="flex items-center gap-3">
          <Skeleton className="size-11 shrink-0 rounded-xl" />
          <div className="space-y-2">
            <Skeleton className="h-5 w-28" />
            <Skeleton className="h-3 w-20" />
          </div>
        </div>
        <Skeleton className="h-9 w-full" />
        <Skeleton className="h-9 w-full" />
        <Skeleton className="h-16 w-full" />
      </CardContent>
    </Card>
  );
}

function FlowSkeleton() {
  return (
    <div className="space-y-5">
      {[0, 1].map((i) => (
        <Card key={i}>
          <CardContent className="space-y-3 p-5">
            <Skeleton className="h-4 w-40" />
            <div className="flex flex-wrap gap-2">
              <Skeleton className="h-7 w-24 rounded-full" />
              <Skeleton className="h-7 w-24 rounded-full" />
              <Skeleton className="h-7 w-24 rounded-full" />
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

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

  const load = React.useCallback(
    (slug: string) => {
      setLoading(true);
      setError(null);
      getRotation(slug)
        .then(setData)
        .catch((e) => setError(e instanceof Error ? e.message : t.common.error))
        .finally(() => setLoading(false));
    },
    [t.common.error],
  );

  // Sync the selection when the URL crop param changes (e.g. arriving from a link).
  React.useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setCrop(initial);
  }, [initial]);

  // Fetch the rotation plan whenever the selected crop changes.
  React.useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    load(crop);
  }, [crop, load]);

  return (
    <PageShell>
      <PageHeader
        accent="rotation"
        icon={RefreshCw}
        title={t.rotation.title}
        description={t.rotation.desc}
      />

      <div className="grid gap-6 lg:grid-cols-12">
        <div className="space-y-6 lg:col-span-5">
          <Card>
            <CardContent className="p-5 sm:p-6">
              <Label htmlFor="crop" className="mb-2 block">
                {t.rotation.crop}
              </Label>
              <CropSelect
                id="crop"
                crops={ROTATION_CROPS}
                value={crop}
                onChange={setCrop}
                placeholder={t.selectCrop}
              />
            </CardContent>
          </Card>
          {loading ? (
            <IdentitySkeleton />
          ) : data ? (
            <RotationIdentity data={data} />
          ) : null}
        </div>

        <div className="lg:col-span-7">
          {loading ? (
            <FlowSkeleton />
          ) : error ? (
            <ErrorCard message={error} onRetry={() => load(crop)} />
          ) : data ? (
            <RotationFlow data={data} />
          ) : (
            <ResultEmpty
              accent="rotation"
              icon={RefreshCw}
              title={t.rotation.empty}
              description={t.rotation.emptyDesc}
            />
          )}
        </div>
      </div>
    </PageShell>
  );
}

export default function RotationPage() {
  return (
    <Suspense>
      <RotationInner />
    </Suspense>
  );
}
