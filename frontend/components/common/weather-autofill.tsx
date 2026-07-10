"use client";

import * as React from "react";
import { CheckCircle2, CloudSun, Info, Loader2, MapPin } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { getWeather } from "@/lib/api/ml";
import type { WeatherResponse } from "@/lib/types";
import { useT } from "@/lib/i18n/provider";

export function WeatherAutofill({
  onResult,
}: {
  onResult: (w: WeatherResponse) => void;
}) {
  const [location, setLocation] = React.useState("");
  const [loading, setLoading] = React.useState(false);
  const [filled, setFilled] = React.useState<string | null>(null);
  const t = useT();

  async function fetchWeather() {
    if (!location.trim()) return;
    setLoading(true);
    setFilled(null);
    try {
      const w = await getWeather(location);
      onResult(w);
      setFilled(w.location);
      toast.success(w.location);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : t.recommend.weatherError);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="rounded-lg border border-tool-recommend/20 bg-tool-recommend/6 p-4">
      <div className="flex items-center justify-between gap-2">
        <Label htmlFor="location" className="flex items-center gap-1.5">
          <MapPin className="size-4 text-tool-recommend" /> {t.recommend.location}
        </Label>
        <Tooltip>
          <TooltipTrigger asChild>
            <button
              type="button"
              aria-label={t.recommend.rainfallNote}
              className="text-muted-foreground transition-colors hover:text-foreground"
            >
              <Info className="size-4" />
            </button>
          </TooltipTrigger>
          <TooltipContent className="max-w-xs">
            {t.recommend.rainfallNote}
          </TooltipContent>
        </Tooltip>
      </div>
      <div className="mt-2 flex gap-2">
        <Input
          id="location"
          placeholder={t.recommend.locationPlaceholder}
          value={location}
          onChange={(e) => setLocation(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              fetchWeather();
            }
          }}
        />
        <Button
          type="button"
          variant="accent"
          onClick={fetchWeather}
          disabled={loading}
        >
          {loading ? <Loader2 className="animate-spin" /> : <CloudSun />}
          {loading ? t.recommend.fetching : t.recommend.fetch}
        </Button>
      </div>
      {filled && (
        <p className="mt-2 flex items-center gap-1.5 text-xs text-tool-recommend">
          <CheckCircle2 className="size-3.5" /> {filled}
        </p>
      )}
    </div>
  );
}
