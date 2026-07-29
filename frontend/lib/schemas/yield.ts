import { z } from "zod";

export const yieldSchema = z.object({
  crop: z.string().min(1, "Select a crop"),
  year: z.number().int().min(1990).max(2035),
});

export type YieldForm = z.infer<typeof yieldSchema>;

export const yieldDefaults: YieldForm = {
  crop: "wheat",
  year: 2026,
};

// Nutrient/weather-based yield estimate (soil + climate -> yield).
export const yieldEstimateSchema = z.object({
  crop: z.string().min(1, "Select a crop"),
  N: z.number().min(0),
  P: z.number().min(0),
  K: z.number().min(0),
  ph: z.number().min(0).max(14),
  temperature: z.number(),
  humidity: z.number().min(0).max(100),
  rainfall: z.number().min(0),
});

export type YieldEstimateForm = z.infer<typeof yieldEstimateSchema>;
