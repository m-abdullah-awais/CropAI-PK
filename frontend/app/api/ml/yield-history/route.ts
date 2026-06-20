import { backendFetch } from "@/lib/api/backend";
import type { YieldHistoryResponse } from "@/lib/types";

export async function GET(request: Request) {
  const crop = new URL(request.url).searchParams.get("crop") ?? "";
  const r = await backendFetch<YieldHistoryResponse>(
    `/api/yield/history/${encodeURIComponent(crop)}`,
  );
  if (!r.ok) return Response.json({ error: r.error }, { status: r.status });
  return Response.json(r.data);
}
