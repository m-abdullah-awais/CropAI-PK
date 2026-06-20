import { backendFetch } from "@/lib/api/backend";
import type { RotationResponse } from "@/lib/types";

export async function GET(request: Request) {
  const crop = new URL(request.url).searchParams.get("crop") ?? "";
  const r = await backendFetch<RotationResponse>(
    `/api/rotation/${encodeURIComponent(crop)}`,
  );
  if (!r.ok) return Response.json({ error: r.error }, { status: r.status });
  return Response.json(r.data);
}
