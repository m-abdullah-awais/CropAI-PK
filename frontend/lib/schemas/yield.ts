import { z } from "zod";

export const yieldSchema = z.object({
  crop: z.string().min(1, "Select a crop"),
  year: z.number().int().min(1990).max(2035),
  rainfall_mm_per_year: z.number().min(0).max(5000),
  avg_temp: z.number().min(-20).max(60),
});

export type YieldForm = z.infer<typeof yieldSchema>;

export const yieldDefaults: YieldForm = {
  crop: "wheat",
  year: 2026,
  rainfall_mm_per_year: 500,
  avg_temp: 25,
};
