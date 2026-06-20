"use client";

import * as React from "react";
import { CloudSun, Loader2, MapPin } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { getWeather } from "@/lib/api/ml";
import type { WeatherResponse } from "@/lib/types";

export function WeatherAutofill({
  onResult,
}: {
  onResult: (w: WeatherResponse) => void;
}) {
  const [location, setLocation] = React.useState("");
  const [loading, setLoading] = React.useState(false);
  const [note, setNote] = React.useState<string | null>(null);

  async function fetchWeather() {
    if (!location.trim()) {
      toast.error("Enter a location first.");
      return;
    }
    setLoading(true);
    setNote(null);
    try {
      const w = await getWeather(location);
      onResult(w);
      setNote(
        `Filled temperature & humidity for ${w.location}. ${w.rainfall.note}`,
      );
      toast.success(`Weather loaded for ${w.location}`);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Weather lookup failed.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="rounded-lg border bg-secondary/30 p-4">
      <Label htmlFor="location" className="flex items-center gap-1.5">
        <MapPin className="size-4 text-primary" /> Location (auto-fill weather)
      </Label>
      <div className="mt-2 flex gap-2">
        <Input
          id="location"
          placeholder="e.g. Faisalabad"
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
          Fetch
        </Button>
      </div>
      {note && <p className="mt-2 text-xs text-muted-foreground">{note}</p>}
    </div>
  );
}
