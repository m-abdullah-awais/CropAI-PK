// Open-Meteo proxy: geocode a Pakistani location, then fetch current weather.
// No API key required. Returns temperature + humidity (high confidence) and
// recent precipitation flagged as NOT the model's seasonal rainfall.
import type { WeatherResponse } from "@/lib/types";

const GEO = "https://geocoding-api.open-meteo.com/v1/search";
const FORECAST = "https://api.open-meteo.com/v1/forecast";

export async function GET(request: Request) {
  const location = new URL(request.url).searchParams.get("location")?.trim();
  if (!location) {
    return Response.json({ error: "Provide a location." }, { status: 400 });
  }

  try {
    const geoRes = await fetch(
      `${GEO}?name=${encodeURIComponent(location)}&count=1&language=en&country=PK`,
    );
    const geo = await geoRes.json();
    const place = geo?.results?.[0];
    if (!place) {
      // Fall back to a global search if the Pakistan-scoped one finds nothing.
      const g2 = await fetch(
        `${GEO}?name=${encodeURIComponent(location)}&count=1&language=en`,
      );
      const geo2 = await g2.json();
      if (!geo2?.results?.[0]) {
        return Response.json(
          { error: `Could not find "${location}". Try a nearby city.` },
          { status: 404 },
        );
      }
      geo.results = geo2.results;
    }

    const { latitude, longitude, name, admin1 } = geo.results[0];
    const wRes = await fetch(
      `${FORECAST}?latitude=${latitude}&longitude=${longitude}` +
        `&current=temperature_2m,relative_humidity_2m,precipitation&timezone=auto`,
    );
    const w = await wRes.json();
    const cur = w?.current ?? {};

    const payload: WeatherResponse = {
      location: admin1 ? `${name}, ${admin1}` : name,
      latitude,
      longitude,
      temperature: Number(cur.temperature_2m ?? 0),
      humidity: Number(cur.relative_humidity_2m ?? 0),
      rainfall: {
        value: Number(cur.precipitation ?? 0),
        reliable: false,
        note: "Recent precipitation (live) - not the seasonal total the model expects. Please adjust.",
      },
    };
    return Response.json(payload);
  } catch {
    return Response.json(
      { error: "Weather lookup failed. Check your connection and try again." },
      { status: 502 },
    );
  }
}
