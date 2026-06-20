import { backendFetch } from "@/lib/api/backend";
import type { HealthResponse } from "@/lib/types";

export async function GET() {
  const r = await backendFetch<HealthResponse>("/health");
  if (!r.ok) return Response.json({ error: r.error }, { status: r.status });
  return Response.json(r.data);
}
