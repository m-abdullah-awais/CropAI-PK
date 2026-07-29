// Shared API response types (mirror the FastAPI schemas).

export interface HealthResponse {
  status: string;
  models_loaded: boolean;
  version: string;
  n_crops_recommendation: number;
  n_crops_yield: number;
}

// Real training metrics from models/metrics.json (only the fields the dashboard reads;
// the file also carries per-class F1 and a confusion matrix we do not surface here).
export interface MetricsResponse {
  recommendation?: {
    model?: string;
    accuracy?: number;
    macro_f1?: number;
    top3_accuracy?: number;
    n_train?: number;
    n_test?: number;
  } | null;
  yield?: {
    model?: string;
    n_crops?: number;
    backtest_horizon_years?: number;
    forecast_mae_t_ha?: number;
  } | null;
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
  is_forecast?: boolean | null;
  trend_per_year?: number | null;
  trend_direction?: "rising" | "falling" | "stable" | null;
  last_real_year?: number | null;
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

// Nutrient/weather-based yield estimate (agronomy response model).
export type YieldFactorName =
  | "N" | "P" | "K" | "temperature" | "humidity" | "ph" | "rainfall";

export interface YieldFactor {
  name: YieldFactorName;
  value: number;
  optimum: number;
  adequacy: number; // 0..1
  status: "low" | "ideal" | "high";
  limiting: boolean;
}

export interface YieldSensitivityPoint {
  value: number;
  yield_t_per_ha: number;
}

export interface YieldSensitivity {
  feature: YieldFactorName;
  points: YieldSensitivityPoint[];
  optimum: number;
  current: number;
}

export interface YieldEstimateResponse {
  available: boolean;
  crop: string;
  display: string;
  estimated_t_per_ha?: number | null;
  estimated_kg_per_ha?: number | null;
  attainable_t_per_ha?: number | null;
  overall_adequacy?: number | null; // 0..1
  factors?: YieldFactor[] | null;
  most_limiting?: YieldFactorName | null;
  sensitivities?: YieldSensitivity[] | null;
  note?: string | null;
}

export interface ProjectedSoil {
  N: number;
  P: number;
  K: number;
  temperature: number;
  humidity: number;
  ph: number;
  rainfall: number;
  soil_estimated: boolean;
}

export interface NextCrop {
  crop: string;
  display: string;
  score: number; // blended rank score, 0..1
  soil_suitability: number; // KNN soil-match on the projected soil, 0..1
  nitrogen_role: string;
  note: "nitrogen_break" | "soil_match";
  yield_available: boolean;
}

export interface AvoidCrop {
  crop: string;
  display: string;
  reason: "same_family" | "avoid_pair";
}

export interface RotationResponse {
  crop: string;
  display: string;
  family: string;
  season: string;
  nitrogen_role: string;
  is_perennial: boolean;
  projected_soil: ProjectedSoil;
  next_crops: NextCrop[];
  avoid: AvoidCrop[];
  notes: string;
  model_version: string;
}

export interface WeatherResponse {
  location: string;
  latitude: number;
  longitude: number;
  temperature: number;
  humidity: number;
  rainfall: { value: number; reliable: false; note: string };
}
