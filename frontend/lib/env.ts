// Server-side backend base URL for the proxy route handlers.
export const API_URL =
  process.env.API_URL ?? process.env.NEXT_PUBLIC_API_URL ?? "http://127.0.0.1:9271";
