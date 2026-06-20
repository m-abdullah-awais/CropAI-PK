// Browser-side fetch wrapper. Talks to the Next.js proxy routes (same origin),
// so there is no CORS and the backend URL stays server-side.

export class ApiError extends Error {
  status: number;
  constructor(message: string, status: number) {
    super(message);
    this.status = status;
  }
}

export async function apiFetch<T>(path: string, init?: RequestInit): Promise<T> {
  let res: Response;
  try {
    res = await fetch(path, {
      ...init,
      headers: { "content-type": "application/json", ...(init?.headers ?? {}) },
    });
  } catch {
    throw new ApiError("Network error - could not reach the server.", 0);
  }

  const text = await res.text();
  const body = text ? JSON.parse(text) : undefined;

  if (!res.ok) {
    const message =
      (body && (body.error || body.detail)) || `Request failed (${res.status})`;
    throw new ApiError(String(message), res.status);
  }
  return body as T;
}
