"use client";

import * as React from "react";
import { Sprout } from "lucide-react";
import { PageHeader } from "@/components/common/page-header";
import { ResultEmpty } from "@/components/common/result-empty";
import { Card, CardContent } from "@/components/ui/card";
import { RecommendForm } from "@/components/recommend/recommend-form";
import { RecommendResults } from "@/components/recommend/recommend-results";
import { RecommendSkeleton } from "@/components/recommend/recommend-skeleton";
import type { RecommendResponse } from "@/lib/types";

export default function RecommendPage() {
  const [result, setResult] = React.useState<RecommendResponse | null>(null);
  const [loading, setLoading] = React.useState(false);

  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <PageHeader
        icon={Sprout}
        title="Crop Recommendation"
        description="Enter your soil test values and a location. We auto-fill live weather, then rank the best crops for your field."
      />

      <div className="grid gap-6 lg:grid-cols-12">
        <div className="lg:col-span-5">
          <Card>
            <CardContent className="p-6">
              <RecommendForm
                onResult={setResult}
                onLoadingChange={setLoading}
              />
            </CardContent>
          </Card>
        </div>

        <div className="lg:col-span-7">
          {loading ? (
            <RecommendSkeleton />
          ) : result ? (
            <RecommendResults data={result} />
          ) : (
            <ResultEmpty
              icon={Sprout}
              title="Your recommendations will appear here"
              description="Fill in the soil and climate values, then click “Recommend crops”."
            />
          )}
        </div>
      </div>
    </div>
  );
}
