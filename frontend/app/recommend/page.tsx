"use client";

import * as React from "react";
import { Sprout } from "lucide-react";
import { PageShell } from "@/components/common/page-shell";
import { PageHeader } from "@/components/common/page-header";
import { ResultEmpty } from "@/components/common/result-empty";
import { Card, CardContent } from "@/components/ui/card";
import {
  RecommendForm,
  type SoilValues,
} from "@/components/recommend/recommend-form";
import { RecommendResults } from "@/components/recommend/recommend-results";
import { RecommendSkeleton } from "@/components/recommend/recommend-skeleton";
import type { RecommendResponse } from "@/lib/types";
import { useT } from "@/lib/i18n/provider";

export default function RecommendPage() {
  const [result, setResult] = React.useState<RecommendResponse | null>(null);
  const [soil, setSoil] = React.useState<SoilValues | null>(null);
  const [loading, setLoading] = React.useState(false);
  const t = useT();

  function handleResult(r: RecommendResponse | null) {
    setResult(r);
    // On submit (r === null, loading starts) scroll back to the top of the page.
    if (r === null && typeof window !== "undefined") {
      requestAnimationFrame(() =>
        window.scrollTo({ top: 0, behavior: "smooth" }),
      );
    }
  }

  return (
    <PageShell>
      <PageHeader
        accent="recommend"
        icon={Sprout}
        title={t.recommend.title}
        description={t.recommend.desc}
      />

      <div className="grid gap-6 lg:grid-cols-12">
        <div className="lg:col-span-5">
          <Card className="lg:sticky lg:top-20">
            <CardContent className="p-5 sm:p-6">
              <RecommendForm
                onResult={handleResult}
                onLoadingChange={setLoading}
                onSoil={setSoil}
              />
            </CardContent>
          </Card>
        </div>

        <div className="lg:col-span-7">
          {loading ? (
            <RecommendSkeleton />
          ) : result ? (
            <RecommendResults data={result} soil={soil} />
          ) : (
            <ResultEmpty
              accent="recommend"
              icon={Sprout}
              title={t.recommend.empty}
              description={t.recommend.emptyDesc}
            />
          )}
        </div>
      </div>
    </PageShell>
  );
}
