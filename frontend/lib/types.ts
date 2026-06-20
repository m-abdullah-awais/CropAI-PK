// Shared API response types (mirror the FastAPI schemas).

export interface HealthResponse {
  status: string;
  models_loaded: boolean;
  version: string;
  n_crops_recommendation: number;
  n_crops_yield: number;
}

export interface CropRecommendation {
  crop: string;
  display: string;
  probability: number;
  confidence: "high" | "medium" | "low";
  yield_available: boolean;
  rotation_available: boolean;
}

export interface RecommendResponse {
  recommendations: CropRecommendation[];
  model_version: string;
}

export interface YieldResponse {
  available: boolean;
  crop: string;
  display: string;
  year?: number | null;
  yield_hg_per_ha?: number | null;
  yield_kg_per_ha?: number | null;
  yield_t_per_ha?: number | null;
  pesticides_tonnes?: number | null;
  pesticides_defaulted?: boolean | null;
  extrapolation_warning?: string | null;
  model_version?: string | null;
  message?: string | null;
  yield_available_crops?: string[] | null;
}

export interface YieldHistoryPoint {
  year: number;
  yield_hg_per_ha: number;
  yield_t_per_ha: number;
}

export interface YieldHistoryResponse {
  available: boolean;
  crop: string;
  display: string;
  series: YieldHistoryPoint[];
}

export interface NextCrop {
  crop: string;
  display: string;
  nitrogen_role?: string | null;
  yield_available: boolean;
}

export interface RotationResponse {
  crop: string;
  display: string;
  family: string;
  season: string;
  nitrogen_role: string;
  recommended_next: NextCrop[];
  avoid_next: NextCrop[];
  notes: string;
}

export interface WeatherResponse {
  location: string;
  latitude: number;
  longitude: number;
  temperature: number;
  humidity: number;
  rainfall: { value: number; reliable: false; note: string };
}
