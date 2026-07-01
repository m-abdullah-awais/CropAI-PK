"use client";

import * as React from "react";
import { CloudSun, Loader2, MapPin } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
  const [note, setNote] = React.useState<string | null>(null);
  const t = useT();

  async function fetchWeather() {
    if (!location.trim()) return;
    setLoading(true);
    setNote(null);
    try {
      const w = await getWeather(location);
      onResult(w);
      setNote(`${w.location} - ${t.recommend.rainfallNote}`);
      toast.success(w.location);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : t.recommend.weatherError);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="rounded-lg border bg-secondary/30 p-4">
      <Label htmlFor="location" className="flex items-center gap-1.5">
        <MapPin className="size-4 text-primary" /> {t.recommend.location}
      </Label>
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
      {note && <p className="mt-2 text-xs text-muted-foreground">{note}</p>}
    </div>
  );
}
