// Server-only helper used by the Next.js proxy route handlers to reach FastAPI.
import { API_URL } from "@/lib/env";

export interface BackendResult<T> {
  ok: boolean;
  status: number;
  data?: T;
  error?: string;
}

export async function backendFetch<T>(
  path: string,
  init?: RequestInit,
): Promise<BackendResult<T>> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 10_000);
  try {
    const res = await fetch(`${API_URL}${path}`, {
      ...init,
      headers: { "content-type": "application/json", ...(init?.headers ?? {}) },
      signal: controller.signal,
      cache: "no-store",
    });
    const text = await res.text();
    const body = text ? JSON.parse(text) : undefined;
    if (!res.ok) {
      const detail =
        (body && (body.detail || body.error)) || `Backend error ${res.status}`;
      return { ok: false, status: res.status, error: String(detail) };
    }
    return { ok: true, status: res.status, data: body as T };
  } catch (err) {
    const msg =
      err instanceof Error && err.name === "AbortError"
        ? "The ML backend timed out. Is it running?"
        : "Could not reach the ML backend. Is it running on the configured port?";
    return { ok: false, status: 503, error: msg };
  } finally {
    clearTimeout(timeout);
  }
}
