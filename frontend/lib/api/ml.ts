// Typed client wrappers for the three capabilities (via Next proxy routes).
import { apiFetch } from "@/lib/api/client";
import type {
  HealthResponse,
  RecommendResponse,
  RotationResponse,
  WeatherResponse,
  YieldHistoryResponse,
  YieldResponse,
} from "@/lib/types";

export interface RecommendInput {
  N: number;
  P: number;
  K: number;
  temperature: number;
  humidity: number;
  ph: number;
  rainfall: number;
  top_n?: number;
}

export interface YieldInput {
  crop: string;
  year: number;
}

export function getHealth(): Promise<HealthResponse> {
  return apiFetch<HealthResponse>("/api/ml/health");
}

export function recommend(input: RecommendInput): Promise<RecommendResponse> {
  return apiFetch<RecommendResponse>("/api/ml/recommend", {
    method: "POST",
    body: JSON.stringify(input),
  });
}

export function predictYield(input: YieldInput): Promise<YieldResponse> {
  return apiFetch<YieldResponse>("/api/ml/yield", {
    method: "POST",
    body: JSON.stringify(input),
  });
}

export function getYieldHistory(crop: string): Promise<YieldHistoryResponse> {
  return apiFetch<YieldHistoryResponse>(
    `/api/ml/yield-history?crop=${encodeURIComponent(crop)}`,
  );
}

export function getRotation(crop: string): Promise<RotationResponse> {
  return apiFetch<RotationResponse>(
    `/api/ml/rotation?crop=${encodeURIComponent(crop)}`,
  );
}

export function getWeather(location: string): Promise<WeatherResponse> {
  return apiFetch<WeatherResponse>(
    `/api/weather?location=${encodeURIComponent(location)}`,
  );
}
