import { backendFetch } from "@/lib/api/backend";
import type { RecommendResponse } from "@/lib/types";

export async function POST(request: Request) {
  const body = await request.text();
  const r = await backendFetch<RecommendResponse>("/api/recommend", {
    method: "POST",
    body,
  });
  if (!r.ok) return Response.json({ error: r.error }, { status: r.status });
  return Response.json(r.data);
}
