import { backendFetch } from "@/lib/api/backend";
import type { RotationResponse } from "@/lib/types";

export async function POST(request: Request) {
  const body = await request.text();
  const r = await backendFetch<RotationResponse>("/api/rotation", {
    method: "POST",
    body,
  });
  if (!r.ok) return Response.json({ error: r.error }, { status: r.status });
  return Response.json(r.data);
}
