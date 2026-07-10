import { backendFetch } from "@/lib/api/backend";
import type { MetricsResponse } from "@/lib/types";

export async function GET() {
  const r = await backendFetch<MetricsResponse>("/api/metrics");
  if (!r.ok) return Response.json({ error: r.error }, { status: r.status });
  return Response.json(r.data);
}
